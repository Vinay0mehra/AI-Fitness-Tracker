import { createClient } from "@/utils/supabase/server";
import { DashboardCharts } from "@/components/dashboard-charts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const { data: foodLogs } = await supabase.from("food_logs").select("*").eq("user_id", user.id).gte("created_at", todayIso);
  const { data: activityLogs } = await supabase.from("activity_logs").select("*").eq("user_id", user.id).gte("created_at", todayIso);

  // Parse Consumed Stats
  const consumedCalories = foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
  const consumedProtein = foodLogs?.reduce((sum, log) => sum + (log.protein_g || 0), 0) || 0;
  const consumedCarbs = foodLogs?.reduce((sum, log) => sum + (log.carbs_g || 0), 0) || 0;
  const consumedFats = foodLogs?.reduce((sum, log) => sum + (log.fat_g || 0), 0) || 0;
  
  const burnedCalories = activityLogs?.reduce((sum, log) => sum + (log.calories_burned || 0), 0) || 0;

  // Exact Harris-Benedict BMR Formula
  const weight = profile?.weight_kg || 70;
  const height = profile?.height_cm || 170;
  const age = profile?.age || 25;
  const gender = profile?.gender || "unspecified";

  let bmr = 1500; // Base baseline
  if (gender === "male") {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else if (gender === "female") {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  } else {
    // Average baseline
    bmr = 250 + (11.0 * weight) + (4.0 * height) - (5.0 * age);
  }

  // Activity Multiplier
  const multipliers: Record<string, number> = { "sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "ultra": 1.9 };
  const tdee = bmr * (multipliers[profile?.activity_level] || 1.375);

  // Goal Adjustment
  let targetCalories = tdee;
  if (profile?.fitness_goal === "lose_weight") targetCalories -= 500;
  if (profile?.fitness_goal === "gain_muscle") targetCalories += 300;

  // Macro Splits Logic
  const macroMultipliers: Record<string, [number, number, number]> = {
    "balanced": [0.3, 0.4, 0.3], // 30% Prot / 40% Carb / 30% Fat
    "high_protein": [0.4, 0.3, 0.3],
    "low_carb": [0.3, 0.1, 0.6],
  };
  const splits = macroMultipliers[profile?.macro_preference] || macroMultipliers["balanced"];
  
  const macroSplit = {
    protein: consumedProtein,
    targetProtein: (targetCalories * splits[0]) / 4, // 4 cals per gram
    carbs: consumedCarbs,
    targetCarbs: (targetCalories * splits[1]) / 4,
    fats: consumedFats,
    targetFats: (targetCalories * splits[2]) / 9, // 9 cals per gram
  };

  const netCalories = consumedCalories - burnedCalories;
  const progressPercent = Math.min((netCalories / targetCalories) * 100, 100);

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-1000">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
          Welcome back, {profile?.name || user.email?.split("@")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Dashboard parameters dynamically anchored to your precision targets.
        </p>
      </header>

      <DashboardCharts 
        profile={profile}
        netCalories={netCalories}
        targetCalories={targetCalories}
        progressPercent={progressPercent}
        consumedCalories={consumedCalories}
        burnedCalories={burnedCalories}
        macroSplit={macroSplit}
      />
    </div>
  );
}

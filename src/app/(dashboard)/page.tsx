import { createClient } from "@/utils/supabase/server";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils } from "lucide-react";

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

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Today's Meals</h2>
        {foodLogs && foodLogs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {foodLogs.map((log) => (
              <Card key={log.id} className="bg-card/50 backdrop-blur-md border-white/10 hover:bg-card/80 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{log.food_name}</CardTitle>
                    <CardDescription>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">{log.calories} <span className="text-sm font-normal text-muted-foreground">kcal</span></div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {log.protein_g > 0 && <span>P: {log.protein_g}g</span>}
                    {log.carbs_g > 0 && <span>C: {log.carbs_g}g</span>}
                    {log.fat_g > 0 && <span>F: {log.fat_g}g</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card/30 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Utensils className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No meals logged today.</p>
              <p className="text-sm text-muted-foreground mt-1">Head over to the Log Food page to add your meals.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

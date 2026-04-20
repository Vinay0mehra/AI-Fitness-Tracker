"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function logActivity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const activityName = formData.get("activityName") as string;
  const duration = parseInt(formData.get("duration") as string);
  const caloriesBurned = parseInt(formData.get("calories") as string);

  if (!activityName || isNaN(duration) || isNaN(caloriesBurned)) {
    return { error: "Invalid input" };
  }

  const { error } = await supabase.from("activity_logs").insert({
    user_id: user.id,
    activity_name: activityName,
    duration_minutes: duration,
    calories_burned: caloriesBurned,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/activity");
  revalidatePath("/");
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const updates = {
    name: formData.get("name") as string,
    age: parseInt(formData.get("age") as string),
    weight_kg: parseFloat(formData.get("weight") as string),
    height_cm: parseFloat(formData.get("height") as string),
    fitness_goal: formData.get("goal") as string,
    gender: formData.get("gender") as string,
    activity_level: formData.get("activity") as string,
    macro_preference: formData.get("macro") as string,
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/");
}

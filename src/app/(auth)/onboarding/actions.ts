"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const age = parseInt(formData.get("age") as string);
  const weight = parseFloat(formData.get("weight") as string);
  const height = parseFloat(formData.get("height") as string);
  const goal = formData.get("goal") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      age,
      weight_kg: weight,
      height_cm: height,
      fitness_goal: goal,
    })
    .eq("id", user.id);

  if (error) {
    redirect("/onboarding?error=Submission failed");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

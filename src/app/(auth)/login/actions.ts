"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const response = await supabase.auth.signInWithPassword(data);
  console.log("LOGIN RESPONSE:", response);
  const { error } = response;

  if (error) {
    redirect("/login?error=Could not authenticate user");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const response = await supabase.auth.signUp(data);
  console.log("SIGNUP RESPONSE:", response);
  const { error } = response;

  if (error) {
    redirect("/login?error=Could not create user");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

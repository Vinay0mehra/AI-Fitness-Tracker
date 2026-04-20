"use server";

export async function getGeminiKey() {
  return process.env.GEMINI_API_KEY || "";
}

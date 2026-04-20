import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Fallback to avoid crashes if API key isn't provided right away
const apiKey = process.env.GEMINI_API_KEY || "DUMMY_KEY";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  if (apiKey === "DUMMY_KEY") {
    return NextResponse.json({ error: "GEMINI_API_KEY is missing in your .env.local file" }, { status: 500 });
  }

  try {
    const textBody = await req.text();
    const { imageBase64 } = JSON.parse(textBody);
    
    if (!imageBase64) {
       return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this image of food. Identify what it is and estimate the calories and macronutrients for the entire visible portion. If it does not contain food, set food_name to "Not Food".
    Return ONLY raw JSON strictly matching this schema with no markdown formatting:
    {
      "food_name": "string",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "confidence_score": number // from 0 to 1 scaling your confidence
    }`;

    // Extract mime type and raw base64 data
    const mimeTypeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const rawBase64 = imageBase64.split(",")[1];

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: rawBase64,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text().trim();
    // Clean markdown code blocks if the AI includes them
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '');
    
    const data = JSON.parse(cleanJson);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}

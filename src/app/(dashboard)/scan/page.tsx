"use client";

import { useState } from "react";
import { Camera, Loader2, CheckCircle2, UploadCloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiKey } from "./actions";

export default function ScanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setIsScanning(true);
    setError(null);
    try {
      const apiKey = await getGeminiKey();
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing in your .env.local file");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Analyze this image of food. Identify what it is and estimate the calories and macronutrients for the entire visible portion. If it does not contain food, set food_name to "Not Food".
      Return ONLY raw JSON strictly matching this schema with no markdown formatting:
      {
        "food_name": "string",
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number,
        "confidence_score": number
      }`;

      const mimeTypeMatch = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const rawBase64 = base64.split(",")[1];

      const resultPayload = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: rawBase64,
            mimeType: mimeType
          }
        }
      ]);

      const text = resultPayload.response.text().trim();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '');
      const data = JSON.parse(cleanJson);
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setIsScanning(false);
    }
  };

  const saveFoodLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    
    setIsScanning(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from("food_logs").insert({
        user_id: user.id,
        food_name: result.food_name,
        calories: result.calories,
        protein_g: result.protein_g,
        carbs_g: result.carbs_g,
        fat_g: result.fat_g,
        confidence_score: result.confidence_score,
        image_url: null, // Skipping complicated bucket storage for local dev
      });
    }
    
    setIsScanning(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">AI Food Scanner</h1>
        <p className="text-muted-foreground mt-2">Let Gemini calculate your macros for you.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <Card className={`border-dashed border-2 relative overflow-hidden transition-all ${imagePreview ? 'border-primary/50' : 'border-muted-foreground/30'}`}>
            <CardContent className="p-0">
              {imagePreview ? (
                <div className="relative aspect-square w-full">
                  <img src={imagePreview} alt="Upload preview" className="object-cover w-full h-full opacity-50" />
                  {isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-10">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                      <p className="font-medium animate-pulse">Analyzing nutritional value...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center aspect-square text-muted-foreground p-8">
                  <UploadCloud className="w-16 h-16 mb-4 text-muted-foreground/50" />
                  <p className="font-medium text-center mb-2">Upload a photo of your meal</p>
                  <p className="text-sm text-center opacity-80 mb-6">Supports JPEG, PNG, WEBP</p>
                  <Label htmlFor="image-upload" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors">
                    <Camera className="w-4 h-4 inline-block mr-2" />
                    Open Camera / Gallery
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {error && (
            <div className="mt-4 p-4 text-destructive bg-destructive/10 rounded-md border border-destructive/20 text-sm font-medium">
              {error}
            </div>
          )}
        </section>

        <section>
          <Card className={!result ? 'opacity-50 pointer-events-none filter grayscale transition-all' : 'transition-all'}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Scan Results
              </CardTitle>
              <CardDescription>Review and modify the AI estimates.</CardDescription>
            </CardHeader>
            <form onSubmit={saveFoodLog}>
              <CardContent className="space-y-4">
                {result && (
                  <div className="mb-6 p-4 rounded-lg bg-muted flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">AI Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-1000" 
                          style={{ width: `${Math.round(result.confidence_score * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{Math.round(result.confidence_score * 100)}%</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="food_name">Detected Food</Label>
                  <Input 
                    id="food_name" 
                    value={result?.food_name || ""} 
                    onChange={(e) => setResult({...result, food_name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories (kcal)</Label>
                  <Input 
                    id="calories" 
                    type="number"
                    value={result?.calories || ""} 
                    onChange={(e) => setResult({...result, calories: Number(e.target.value)})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input 
                      id="protein" 
                      type="number"
                      value={result?.protein_g || ""} 
                      onChange={(e) => setResult({...result, protein_g: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input 
                      id="carbs" 
                      type="number"
                      value={result?.carbs_g || ""} 
                      onChange={(e) => setResult({...result, carbs_g: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input 
                      id="fat" 
                      type="number"
                      value={result?.fat_g || ""} 
                      onChange={(e) => setResult({...result, fat_g: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => {setResult(null); setImagePreview(null);}}>
                  Discard
                </Button>
                <Button type="submit" className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Food
                </Button>
              </CardFooter>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}

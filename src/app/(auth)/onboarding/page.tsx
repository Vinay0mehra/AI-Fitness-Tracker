import { submitOnboarding } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background border-t-4 border-accent p-4">
      <Card className="w-full max-w-lg mx-auto">
        <form action={submitOnboarding}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              We need a little more information to customize your AI Fitness tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required placeholder="John Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" required placeholder="25" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" name="weight" type="number" step="0.1" required placeholder="70" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" name="height" type="number" step="0.1" required placeholder="175" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">Primary Fitness Goal</Label>
              <Select name="goal" required defaultValue="maintain">
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Save and Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, CalendarDays, Target, Settings2 } from "lucide-react";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const daysActive = Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your precision fitness parameters.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-3 z-10 relative">
        <section className="space-y-4 md:col-span-1">
          <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30 shadow-primary/10 hover:shadow-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                <Flame className="w-5 h-5" /> Account Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black">{daysActive} <span className="text-xl font-bold text-muted-foreground">Days</span></div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Your dedication is showing.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" /> Active Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold capitalize">{profile?.fitness_goal?.replace("_", " ")}</div>
              <p className="text-xs text-muted-foreground mt-1">Recalculates macros globally.</p>
            </CardContent>
          </Card>
        </section>

        <section className="md:col-span-2">
          <Card>
            <form action={updateProfile}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-yellow-500" /> Precision Target Math
                </CardTitle>
                <CardDescription>We use Harris-Benedict formulas to dictate your perfect BMR.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={profile?.name || ""} required className="bg-background/40 font-medium" />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" name="age" type="number" defaultValue={profile?.age || ""} required className="bg-background/40" />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" step="0.1" defaultValue={profile?.weight_kg || ""} required className="bg-background/40" />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" name="height" type="number" step="0.1" defaultValue={profile?.height_cm || ""} required className="bg-background/40" />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="gender">Gender Biology</Label>
                    <Select name="gender" defaultValue={profile?.gender || "unspecified"}>
                      <SelectTrigger className="bg-background/40"><SelectValue placeholder="Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unspecified">Unspecified Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Primary Objective</Label>
                    <Select name="goal" defaultValue={profile?.fitness_goal || "maintain"}>
                      <SelectTrigger className="bg-background/40"><SelectValue placeholder="Select a goal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose_weight">Cut (Lose Weight)</SelectItem>
                        <SelectItem value="maintain">Maintain Physique</SelectItem>
                        <SelectItem value="gain_muscle">Bulk (Gain Muscle)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activity">Activity Level</Label>
                    <Select name="activity" defaultValue={profile?.activity_level || "moderate"}>
                      <SelectTrigger className="bg-background/40"><SelectValue placeholder="Activity Rating" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (No Exercise)</SelectItem>
                        <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-5 days)</SelectItem>
                        <SelectItem value="active">Active (6-7 days)</SelectItem>
                        <SelectItem value="ultra">Ultra (Athlete/Physical Job)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="macro">Macro Split</Label>
                    <Select name="macro" defaultValue={profile?.macro_preference || "balanced"}>
                      <SelectTrigger className="bg-background/40"><SelectValue placeholder="Macro Split" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced (40/30/30)</SelectItem>
                        <SelectItem value="high_protein">High Protein (30/40/30)</SelectItem>
                        <SelectItem value="low_carb">Low Carb / Keto (10/30/60)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full text-md font-semibold">Save Precision Profile</Button>
              </CardFooter>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logActivity } from "./actions";
import { Activity as ActivityIcon, Flame, Clock } from "lucide-react";

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch recent activity logs
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-2">Log your workouts and view your fitness timeline.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Form Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-primary" />
                Log New Workout
              </CardTitle>
              <CardDescription>Enter your activity details below.</CardDescription>
            </CardHeader>
            <form action={logActivity}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activityName">Activity Name</Label>
                  <Input id="activityName" name="activityName" placeholder="e.g., Running, Cycling, HIIT" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (mins)</Label>
                    <Input id="duration" name="duration" type="number" min="1" placeholder="45" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories Burned</Label>
                    <Input id="calories" name="calories" type="number" min="1" placeholder="300" required />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Save Activity</Button>
              </CardFooter>
            </form>
          </Card>
        </section>

        {/* Timeline Section */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
          {logs && logs.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {logs.map((log) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Flame className="w-4 h-4 text-accent" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold capitalize">{log.activity_name}</h3>
                      <time className="text-xs text-muted-foreground font-mono">
                        {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </time>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.duration_minutes} mins
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Flame className="w-3 h-3" />
                        {log.calories_burned} kcal
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                No recent activity found. Log your first workout to start your timeline!
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

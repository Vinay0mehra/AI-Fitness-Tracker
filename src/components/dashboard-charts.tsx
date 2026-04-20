"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { User, Activity as Flame } from "lucide-react";

export function DashboardCharts({ 
  profile, 
  netCalories, 
  targetCalories, 
  progressPercent, 
  consumedCalories, 
  burnedCalories,
  macroSplit 
}: any) {
  
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const macroData = [
    { name: "Protein", value: macroSplit.protein, target: macroSplit.targetProtein, color: "#3b82f6" },
    { name: "Carbs", value: macroSplit.carbs, target: macroSplit.targetCarbs, color: "#10b981" },
    { name: "Fats", value: macroSplit.fats, target: macroSplit.targetFats, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Stats SVG Ring */}
      <Card className="bg-gradient-to-br from-card to-background shadow-xl border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-lg font-semibold tracking-wide uppercase text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Flame className="w-5 h-5 text-accent" /> Net Caloric Load
            </h2>
            <div className="text-6xl font-black font-mono tracking-tighter text-foreground drop-shadow-lg">
              {netCalories.toLocaleString()}
              <span className="text-xl font-medium text-muted-foreground ml-2">/ {Math.round(targetCalories).toLocaleString()} kcal</span>
            </div>
            <p className="font-medium text-sm text-primary bg-primary/10 inline-block px-3 py-1 rounded-full">
              {targetCalories - netCalories > 0
                ? `${Math.round(targetCalories - netCalories).toLocaleString()} kcal remaining`
                : `Target exceeded by ${Math.round(netCalories - targetCalories).toLocaleString()} kcal!`}
            </p>
          </div>

          <div className="relative flex justify-center items-center">
             <svg className="-rotate-90 transform w-48 h-48 drop-shadow-2xl">
                {/* Background Ring */}
                <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="16" fill="transparent" className="text-muted/30" />
                {/* Foreground Animated Ring */}
                <circle cx="96" cy="96" r={radius} stroke="url(#gradient)" strokeWidth="16" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-black font-mono text-foreground drop-shadow-sm">
                  {Math.round(progressPercent)}%
                </span>
              </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Dynamic Macro Progress Bars */}
        <Card className="lg:col-span-2 group hover:shadow-primary/10 transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Macronutrient Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {macroData.map((m) => (
              <div key={m.name} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="font-bold">{m.name}</span>
                  <span className="text-muted-foreground font-mono">{m.value}g / {Math.round(m.target)}g</span>
                </div>
                <div className="h-4 bg-muted/50 rounded-full overflow-hidden border border-white/5 relative">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                    style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="group hover:shadow-accent/10 transition-shadow bg-gradient-to-t from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Physiological Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-end border-b border-white/5 pb-2">
               <span className="text-sm">BMR Strategy</span>
               <span className="font-bold font-mono">{profile.activity_level}</span>
             </div>
             <div className="flex justify-between items-end border-b border-white/5 pb-2">
               <span className="text-sm text-muted-foreground">Calories Consumed</span>
               <span className="font-bold font-mono text-primary">{consumedCalories} kcal</span>
             </div>
             <div className="flex justify-between items-end pb-2">
               <span className="text-sm text-muted-foreground">Active Workouts</span>
               <span className="font-bold font-mono text-accent">{burnedCalories} kcal</span>
             </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 7-DAY Trailing Recharts Integration */}
       <Card className="hover:shadow-xl transition-shadow border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">7-Day Trailing Overview (Mocked Chart UI Example)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mon', calories: 2400, burned: 400 },
                { name: 'Tue', calories: 2100, burned: 350 },
                { name: 'Wed', calories: 2800, burned: 600 },
                { name: 'Thu', calories: 2500, burned: 200 },
                { name: 'Fri', calories: 2200, burned: 500 },
                { name: 'Sat', calories: 1900, burned: 100 },
                { name: 'Sun', calories: 2600, burned: 450 },
              ]}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="burned" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
    </div>
  );
}

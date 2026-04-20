import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    if (!profile?.name) {
      redirect("/onboarding");
    }
  }

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Animated Glassmorphism Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/10 blur-[120px] mix-blend-screen animate-pulse duration-7000" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="z-10 hidden md:block">
        <Sidebar  />
      </div>
      
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in-95 duration-1000 ease-out">
          {children}
        </div>
      </main>
      
      <div className="z-50 md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

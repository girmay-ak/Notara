import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";
import { nl } from "@/lib/i18n/nl";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Defence in depth: middleware already gates, but always verify here too.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("full_name, profession")
    .eq("id", user.id)
    .single();
  const profile = data as {
    full_name: string | null;
    profession: keyof typeof nl.professions;
  } | null;

  const name = profile?.full_name ?? user.email ?? "Gebruiker";
  const profession =
    nl.professions[profile?.profession ?? "physiotherapist"] ??
    nl.professions.physiotherapist;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={name} profession={profession} />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

import Link from "next/link";
import { Mic, AudioLines } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, snippet, formatLabel } from "@/lib/format";
import { nl } from "@/lib/i18n/nl";

function greeting() {
  const h = new Date().getHours();
  const d = nl.dashboard;
  if (h < 12) return d.greetingMorning;
  if (h < 18) return d.greetingAfternoon;
  if (h < 22) return d.greetingEvening;
  return d.greetingLate;
}

interface RecentNote {
  id: string;
  format: "kngf" | "soap";
  rendered_text: string | null;
  transcript: string | null;
  created_at: string;
}

export default async function DashboardPage() {
  const d = nl.dashboard;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = user
    ? await supabase
        .from("profiles")
        .select("full_name, trial_ends_at")
        .eq("id", user.id)
        .single()
    : { data: null };
  const profile = profileData as {
    full_name: string | null;
    trial_ends_at: string | null;
  } | null;

  const { data: notesData } = user
    ? await supabase
        .from("notes")
        .select("id, format, rendered_text, transcript, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null };
  const recent = (notesData ?? []) as RecentNote[];

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "daar";
  const trialDays = profile?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.trial_ends_at).getTime() - Date.now()) / 86_400_000,
        ),
      )
    : 14;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">{d.welcome}</p>
        </div>
        <Badge variant="amber" className="shrink-0 px-3 py-1">
          {d.trialStatus} · {d.trialDaysLeft(trialDays)}
        </Badge>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card className="relative overflow-hidden bg-brand-700 p-6 text-primary-foreground md:col-span-2">
          <AudioLines className="absolute -right-2 bottom-2 size-40 text-primary-foreground/10" />
          <span className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
            {d.quickStart}
          </span>
          <h2 className="mt-2 max-w-sm text-2xl font-bold">{d.quickTitle}</h2>
          <p className="mt-2 max-w-md text-sm text-primary-foreground/80">{d.quickBody}</p>
          <Link
            href="/record"
            className={buttonVariants({
              variant: "secondary",
              className: "mt-5 bg-brand-100 text-brand-700",
            })}
          >
            <Mic className="size-4" /> {d.quickCta}
          </Link>
        </Card>

        <Card className="flex flex-col justify-center p-6">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {d.thisWeek}
          </span>
          <div className="mt-1">
            <span className="text-4xl font-bold text-brand-700">{recent.length}</span>
            <span className="ml-1 text-muted-foreground">{d.notesUnit}</span>
          </div>
        </Card>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{d.recent}</h2>
        <Link href="/notes" className="text-sm font-medium text-brand-500 hover:underline">
          {d.viewAll}
        </Link>
      </div>

      {recent.length === 0 ? (
        <Card className="mt-4 flex flex-col items-center gap-2 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{nl.notes.empty}</p>
          <Link href="/record" className={buttonVariants({ className: "mt-2" })}>
            <Mic className="size-4" /> {d.quickCta}
          </Link>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {recent.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <AudioLines className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={note.format === "kngf" ? "soep" : "soap"}>
                      {formatLabel(note.format)}
                    </Badge>
                    <span className="truncate text-sm text-muted-foreground">
                      {formatDateTime(note.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-foreground">
                    {snippet(note.rendered_text ?? note.transcript, 80)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

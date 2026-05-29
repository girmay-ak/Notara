"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Lock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRecorder, type RecorderResult } from "@/lib/recording/useRecorder";
import { nl } from "@/lib/i18n/nl";

type Format = "kngf" | "soap";
type Lang = "nl" | "en";

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="inline-flex rounded-full bg-muted p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              value === opt.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function RecordPage() {
  const t = nl.record;
  const router = useRouter();
  const [format, setFormat] = useState<Format>("kngf");
  const [lang, setLang] = useState<Lang>("nl");
  const [phase, setPhase] = useState<"idle" | "processing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleComplete = useCallback(
    async ({ file, durationSec }: RecorderResult) => {
      setPhase("processing");
      setErrorMsg(null);
      try {
        const fd = new FormData();
        fd.append("audio", file);
        fd.append("format", format);
        fd.append("language", lang);
        fd.append("durationSec", String(durationSec));
        const res = await fetch("/api/notes", { method: "POST", body: fd });
        const json = await res.json();
        if (!json.ok) {
          setErrorMsg(json.error?.message ?? t.errors.generic);
          setPhase("error");
          return;
        }
        router.push(`/notes/${json.data.id}`);
      } catch {
        setErrorMsg(t.errors.network);
        setPhase("error");
      }
    },
    [format, lang, router, t.errors.generic, t.errors.network],
  );

  const rec = useRecorder({ onComplete: handleComplete });

  const recError =
    rec.errorCode &&
    (t.errors[rec.errorCode as keyof typeof t.errors] ?? t.errors.generic);

  // ---- Processing ----
  if (phase === "processing") {
    return (
      <Centered>
        <Loader2 className="size-10 animate-spin text-brand-500" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">{t.processing}</h1>
        <p className="mt-2 max-w-xs text-muted-foreground">{t.processingHint}</p>
      </Centered>
    );
  }

  // ---- Error ----
  if (phase === "error" || recError) {
    return (
      <Centered>
        <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </span>
        <p className="mt-5 max-w-sm text-foreground">{errorMsg ?? recError}</p>
        <Button
          className="mt-6"
          onClick={() => {
            setPhase("idle");
            setErrorMsg(null);
            void rec.start();
          }}
        >
          {t.retry}
        </Button>
      </Centered>
    );
  }

  // ---- Recording ----
  if (rec.status === "recording") {
    return (
      <Centered>
        <div className="flex items-center gap-2 text-lg font-medium text-foreground">
          <span className="size-3 animate-pulse rounded-full bg-destructive" />
          {t.recording}
        </div>
        <div className="mt-6 font-mono text-5xl font-bold tabular-nums text-foreground">
          {mmss(rec.seconds)}
        </div>
        <button
          type="button"
          onClick={rec.stop}
          aria-label={t.stop}
          className="mt-12 grid size-24 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform active:scale-95"
        >
          <Square className="size-8 fill-current" />
        </button>
        <button
          type="button"
          onClick={rec.cancel}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground"
        >
          {t.cancel}
        </button>
      </Centered>
    );
  }

  // ---- Idle ----
  const busy = rec.status === "requesting";
  return (
    <Centered>
      <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">{t.subtitle}</p>

      <div className="mt-10 flex gap-10">
        <Toggle
          label={t.format}
          value={format}
          onChange={setFormat}
          disabled={busy}
          options={[
            { value: "kngf", label: "SOEP" },
            { value: "soap", label: "SOAP" },
          ]}
        />
        <Toggle
          label={t.language}
          value={lang}
          onChange={setLang}
          disabled={busy}
          options={[
            { value: "nl", label: "NL" },
            { value: "en", label: "EN" },
          ]}
        />
      </div>

      <button
        type="button"
        onClick={() => void rec.start()}
        disabled={busy}
        aria-label={t.start}
        className="group relative mt-12 grid size-40 place-items-center rounded-full disabled:opacity-60"
      >
        <span className="absolute inset-0 rounded-full bg-brand-100/60 transition-transform group-hover:scale-105" />
        <span className="absolute inset-6 rounded-full bg-brand-100" />
        <span className="relative grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-active:scale-95">
          {busy ? <Loader2 className="size-9 animate-spin" /> : <Mic className="size-9" />}
        </span>
      </button>

      <div className="mt-12 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
        <Lock className="size-3.5" /> {t.privacy}
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
      {children}
    </div>
  );
}

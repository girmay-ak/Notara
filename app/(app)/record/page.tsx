"use client";

import { useState } from "react";
import { Mic, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { nl } from "@/lib/i18n/nl";

type Format = "kngf" | "soap";
type Lang = "nl" | "en";

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
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
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
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

export default function RecordPage() {
  const t = nl.record;
  const [format, setFormat] = useState<Format>("kngf");
  const [lang, setLang] = useState<Lang>("nl");

  // TODO (M3): wire the MediaRecorder state machine + /api/notes pipeline.
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">{t.subtitle}</p>

      <div className="mt-10 flex gap-10">
        <Toggle
          label={t.format}
          value={format}
          onChange={setFormat}
          options={[
            { value: "kngf", label: "SOEP" },
            { value: "soap", label: "SOAP" },
          ]}
        />
        <Toggle
          label={t.language}
          value={lang}
          onChange={setLang}
          options={[
            { value: "nl", label: "NL" },
            { value: "en", label: "EN" },
          ]}
        />
      </div>

      <button
        type="button"
        aria-label={t.start}
        className="group relative mt-12 grid size-40 place-items-center rounded-full"
      >
        <span className="absolute inset-0 rounded-full bg-brand-100/60 transition-transform group-hover:scale-105" />
        <span className="absolute inset-6 rounded-full bg-brand-100" />
        <span className="relative grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-active:scale-95">
          <Mic className="size-9" />
        </span>
      </button>

      <div className="mt-12 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
        <Lock className="size-3.5" /> {t.privacy}
      </div>
    </div>
  );
}

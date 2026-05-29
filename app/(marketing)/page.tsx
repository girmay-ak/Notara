import Link from "next/link";
import {
  ArrowDownToLine,
  Sparkles,
  ClipboardCheck,
  ShieldCheck,
  Trash2,
  FileSignature,
  Check,
  AudioLines,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { nl } from "@/lib/i18n/nl";

const stepIcons = [ArrowDownToLine, Sparkles, ClipboardCheck];
const securityIcons = [ShieldCheck, Trash2, FileSignature];

export default function LandingPage() {
  const t = nl.marketing;
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              {t.hero.ctaPrimary}
            </Link>
            <Link
              href="#how"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Stylised note preview */}
        <Card className="overflow-hidden p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <AudioLines className="size-6 text-brand-500" />
            <Badge variant="soep">KNGF READY</Badge>
          </div>
          <div className="text-sm font-semibold text-foreground">SOEP-notitie</div>
          <div className="mt-3 space-y-3">
            {["Subjectief", "Objectief", "Plan"].map((label) => (
              <div key={label} className="rounded-lg bg-muted/60 p-3">
                <div className="text-xs font-medium text-brand-700">{label}</div>
                <div className="mt-1 h-2 w-3/4 rounded bg-border" />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">{t.how.title}</h2>
            <p className="mt-2 text-muted-foreground">{t.how.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.how.steps.map((step, i) => {
              const Icon = stepIcons[i]!;
              return (
                <Card key={step.title} className="p-6">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="bg-brand-700 py-20 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="text-3xl font-bold">{t.security.title}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {t.security.items.map((item, i) => {
              const Icon = securityIcons[i]!;
              return (
                <div key={item.title} className="flex gap-3">
                  <Icon className="size-6 shrink-0 text-brand-100" />
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <p className="mt-1 text-sm text-primary-foreground/75">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">{t.pricing.title}</h2>
            <p className="mt-2 text-muted-foreground">{t.pricing.subtitle}</p>
          </div>
          <Card className="mx-auto mt-10 max-w-md p-8 shadow-md">
            <div className="flex justify-center">
              <Badge variant="soep">{t.pricing.badge}</Badge>
            </div>
            <div className="mt-4 text-center">
              <span className="text-4xl font-bold text-foreground">{t.pricing.price}</span>
              <span className="text-muted-foreground">{t.pricing.period}</span>
              <div className="text-sm text-muted-foreground">{t.pricing.alt}</div>
            </div>
            <ul className="mt-6 space-y-3">
              {t.pricing.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 text-brand-500" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={buttonVariants({ size: "lg", className: "mt-8 w-full" })}
            >
              {t.pricing.cta}
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">{t.pricing.footnote}</p>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">{t.faq.title}</h2>
          <div className="mt-10 space-y-3">
            {t.faq.items.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer list-none font-medium text-foreground">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

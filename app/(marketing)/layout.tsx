import type { ReactNode } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { nl } from "@/lib/i18n/nl";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const t = nl.marketing;
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <FileText className="size-4" />
            </span>
            {nl.brand.name}
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">{t.nav.how}</a>
            <a href="#security" className="hover:text-foreground">{t.nav.security}</a>
            <a href="#pricing" className="hover:text-foreground">{t.nav.pricing}</a>
          </nav>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            {t.nav.start}
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-brand-700 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <div className="text-lg font-semibold">{nl.brand.name}</div>
            <p className="text-sm text-primary-foreground/70">{t.footer.tagline}</p>
          </div>
          <div className="flex gap-6 text-sm text-primary-foreground/80">
            <Link href="/privacy" className="hover:text-primary-foreground">{t.footer.links.privacy}</Link>
            <Link href="/voorwaarden" className="hover:text-primary-foreground">{t.footer.links.terms}</Link>
            <Link href="/verwerkersovereenkomst" className="hover:text-primary-foreground">{t.footer.links.dpa}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

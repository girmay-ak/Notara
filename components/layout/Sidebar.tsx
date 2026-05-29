"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { navItems } from "./nav-items";
import { nl } from "@/lib/i18n/nl";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/50 p-4 md:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="size-4" />
        </span>
        <span className="leading-tight">
          <span className="block font-semibold text-foreground">{nl.brand.name}</span>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
            {nl.brand.tagline}
          </span>
        </span>
      </Link>

      <Link href="/record" className={buttonVariants({ className: "mb-6 w-full" })}>
        <Plus className="size-4" /> {nl.nav.newNote}
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

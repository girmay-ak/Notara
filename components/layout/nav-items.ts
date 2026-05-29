import { LayoutDashboard, Mic, FileText, Settings, type LucideIcon } from "lucide-react";
import { nl } from "@/lib/i18n/nl";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: nl.nav.dashboard, icon: LayoutDashboard },
  { href: "/record", label: nl.nav.record, icon: Mic },
  { href: "/notes", label: nl.nav.notes, icon: FileText },
  { href: "/settings", label: nl.nav.settings, icon: Settings },
];

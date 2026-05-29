import type { ReactNode } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { nl } from "@/lib/i18n/nl";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <FileText className="size-4" />
        </span>
        {nl.brand.name}
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

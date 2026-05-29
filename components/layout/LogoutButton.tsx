"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  async function onLogout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={onLogout}
      aria-label="Uitloggen"
      className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <LogOut className="size-5" />
    </button>
  );
}

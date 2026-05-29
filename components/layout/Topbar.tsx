import { Bell } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

/** Top bar with the signed-in user's name + profession and a logout control. */
export function Topbar({
  name,
  profession,
}: {
  name: string;
  profession: string;
}) {
  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b border-border px-4 md:px-8">
      <button
        type="button"
        aria-label="Meldingen"
        className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <Bell className="size-5" />
      </button>
      <LogoutButton />
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-sm font-medium text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{profession}</div>
        </div>
        <div className="size-9 rounded-full bg-brand-100" aria-hidden />
      </div>
    </header>
  );
}

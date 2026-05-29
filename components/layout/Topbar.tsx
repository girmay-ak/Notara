import { Bell } from "lucide-react";

/**
 * Top bar. `user` is passed in by the (app) layout once auth is wired; for now
 * it accepts a display name + profession so the shell renders standalone.
 */
export function Topbar({
  name,
  profession,
}: {
  name: string;
  profession: string;
}) {
  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-border px-4 md:px-8">
      <button
        type="button"
        aria-label="Meldingen"
        className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <Bell className="size-5" />
      </button>
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

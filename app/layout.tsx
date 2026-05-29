import type { ReactNode } from "react";

export const metadata = {
  title: "Notara",
  description:
    "Van voicememo naar KNGF/SOEP-notitie. AI-notities voor zorgprofessionals.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}

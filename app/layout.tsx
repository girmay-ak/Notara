import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Notara — Van voicememo naar KNGF-notitie",
  description:
    "Notara verandert een voicememo van 60 seconden in een gestructureerde KNGF/SOEP- of SOAP-behandelnotitie. AVG-proof, EU-hosting.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Specweaver — Architecture Intelligence",
  description: "Dual-persona system architecture generator. Boardroom insights meet engineering precision.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

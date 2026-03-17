import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Specweaver — AI Architecture Generator",
  description: "Dual-persona AI architecture generator. Boardroom clarity meets engineering precision. Generate executive summaries, SQL schemas, API specs, and Mermaid diagrams.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Specweaver — AI Architecture Generator",
    description: "Transform product visions into executive-ready architecture insights or production-grade technical specs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Specweaver",
  description: "AI-powered system architecture generator",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
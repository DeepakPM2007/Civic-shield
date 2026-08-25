import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicShield AI — Government of Tamil Nadu",
  description: "AI-powered civic issue reporting and routing system for Tamil Nadu municipal corporations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </body>
    </html>
  );
}

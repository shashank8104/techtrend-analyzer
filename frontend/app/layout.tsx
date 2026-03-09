/**
 * layout.tsx – Root layout with Inter font, global CSS, and Navbar.
 */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TechTrend Analyzer – Discover What's Trending in Tech",
  description:
    "Real-time AI-powered dashboard that analyzes Reddit discussions to surface trending technologies, keywords, and insights.",
  openGraph: {
    title: "TechTrend Analyzer",
    description: "AI-powered Reddit tech trend dashboard",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 66px)" }}>
          {children}
        </main>
        <footer style={{
          textAlign: "center",
          padding: "32px 16px",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          borderTop: "1px solid var(--border)",
          marginTop: "64px",
        }}>
          TechTrend Analyzer · Built with Next.js, FastAPI & HuggingFace
        </footer>
      </body>
    </html>
  );
}

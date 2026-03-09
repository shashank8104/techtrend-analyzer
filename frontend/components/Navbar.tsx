/**
 * Navbar.tsx – Top navigation bar with logo, animated gradient line, and nav links.
 */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background: scrolled ? "rgba(10,14,26,0.95)" : "rgba(10,14,26,0.7)",
      borderBottom: "1px solid var(--border)",
      transition: "background var(--transition)",
    }}>
      {/* Accent gradient line at top */}
      <div style={{
        height: "2px",
        background: "var(--gradient-accent)",
        opacity: 0.8,
      }} />

      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            background: "var(--gradient-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: 800,
            color: "#fff",
          }}>T</div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            <span className="gradient-text">TechTrend</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}> Analyzer</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { href: "/", label: "Dashboard" },
            { href: "#trending", label: "Trending" },
            { href: "#posts", label: "Posts" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "color var(--transition), background var(--transition)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

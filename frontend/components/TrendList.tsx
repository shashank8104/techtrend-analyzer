/**
 * TrendList.tsx – Animated display of trending technology keywords.
 */
"use client";

import type { Trend } from "@/types/post";

interface TrendListProps {
  trends: Trend[];
}

const ACCENT_COLORS = [
  { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  { bg: "rgba(124,58,237,0.15)", text: "#a78bfa", border: "rgba(124,58,237,0.3)" },
  { bg: "rgba(6,182,212,0.15)",  text: "#22d3ee", border: "rgba(6,182,212,0.3)"  },
  { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
  { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  { bg: "rgba(236,72,153,0.15)", text: "#f472b6", border: "rgba(236,72,153,0.3)" },
];

export default function TrendList({ trends }: TrendListProps) {
  if (!trends || trends.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
        No trending topics yet. Run the scraper to populate data.
      </div>
    );
  }

  const maxCount = trends[0]?.count ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {trends.map((trend, i) => {
        const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
        const barWidth = Math.max(8, Math.round((trend.count / maxCount) * 100));

        return (
          <div
            key={trend.keyword}
            className="animate-fadeInUp"
            style={{
              animationDelay: `${i * 40}ms`,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              position: "relative",
              overflow: "hidden",
              transition: "border-color var(--transition), transform var(--transition)",
              cursor: "default",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = color.border;
              (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
            }}
          >
            {/* Background fill bar */}
            <div style={{
              position: "absolute",
              inset: 0,
              width: `${barWidth}%`,
              background: color.bg,
              transition: "width 1s ease",
            }} />

            {/* Content */}
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Rank number */}
                <span style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  minWidth: "18px",
                }}>#{i + 1}</span>

                <span style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: color.text,
                }}>
                  {trend.keyword}
                </span>
              </div>

              <span style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.05)",
                padding: "2px 8px",
                borderRadius: "20px",
              }}>
                {trend.count}×
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

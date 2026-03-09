/**
 * SummaryCard.tsx – Expandable AI-generated discussion summary for a post.
 */
"use client";

import { useState } from "react";

interface SummaryCardProps {
  summary: string;
  loading?: boolean;
}

export default function SummaryCard({ summary, loading = false }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
      }}>
        <div className="skeleton" style={{ height: "14px", width: "40%", marginBottom: "12px" }} />
        <div className="skeleton" style={{ height: "12px", width: "100%", marginBottom: "8px" }} />
        <div className="skeleton" style={{ height: "12px", width: "90%", marginBottom: "8px" }} />
        <div className="skeleton" style={{ height: "12px", width: "75%" }} />
      </div>
    );
  }

  const isEmpty = !summary || summary.includes("Not enough content");

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid rgba(59,130,246,0.2)",
      borderRadius: "var(--radius-lg)",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Accent gradient at top */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: "var(--gradient-accent)",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{
          width: 28, height: 28,
          borderRadius: "8px",
          background: "rgba(59,130,246,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Sparkle icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#60a5fa" }}>
          AI Discussion Summary
        </span>
      </div>

      {/* Summary body */}
      {isEmpty ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>
          Not enough discussion content to generate a meaningful summary.
        </p>
      ) : (
        <>
          <p style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            display: expanded ? "block" : "-webkit-box",
            WebkitLineClamp: expanded ? undefined : 4,
            WebkitBoxOrient: expanded ? undefined : "vertical",
            overflow: "hidden",
          }}>
            {summary}
          </p>
          {summary.length > 300 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                marginTop: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--accent-blue)",
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: 0,
              }}
            >
              {expanded ? "Show less ↑" : "Read more ↓"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

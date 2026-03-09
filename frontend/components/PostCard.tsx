/**
 * PostCard.tsx – Card displaying a single Reddit post summary.
 */
"use client";

import Link from "next/link";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
  index?: number;
}

const SUBREDDIT_COLORS: Record<string, { bg: string; color: string }> = {
  MachineLearning: { bg: "rgba(59,130,246,0.18)", color: "#60a5fa" },
  artificial:      { bg: "rgba(124,58,237,0.18)", color: "#a78bfa" },
  programming:     { bg: "rgba(16,185,129,0.18)", color: "#34d399" },
  technology:      { bg: "rgba(6,182,212,0.18)",  color: "#22d3ee" },
  OpenAI:          { bg: "rgba(245,158,11,0.18)", color: "#fbbf24" },
};

function SubredditBadge({ name }: { name: string }) {
  const { bg, color } = SUBREDDIT_COLORS[name] ?? { bg: "rgba(148,163,184,0.18)", color: "#94a3b8" };
  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "20px",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        background: bg,
        color,
      }}
    >
      r/{name}
    </span>
  );
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="animate-fadeInUp"
      style={{
        animationDelay: `${index * 50}ms`,
        display: "block",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        transition: "all var(--transition)",
        cursor: "pointer",
        textDecoration: "none",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border-hover)";
        el.style.transform = "translateY(-3px)";
        el.style.boxShadow = "var(--shadow-glow)";
        el.style.background = "var(--bg-card-hover)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.background = "var(--bg-card)";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <SubredditBadge name={post.subreddit} />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--text-primary)",
        lineHeight: 1.5,
        marginBottom: "16px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {post.title}
      </h3>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "16px" }}>
        {/* Upvotes */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fbbf24" }}>
            {formatScore(post.score)}
          </span>
        </div>

        {/* Comments */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--accent-blue)" }}>
            {formatScore(post.comments_count)}
          </span>
        </div>

        {/* Keyword pills */}
        {post.keywords?.slice(0, 2).map(kw => (
          <span key={kw} style={{
            fontSize: "0.68rem",
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: "20px",
            background: "rgba(124,58,237,0.15)",
            color: "#a78bfa",
            marginLeft: "auto",
          }}>{kw}</span>
        ))}
      </div>
    </Link>
  );
}

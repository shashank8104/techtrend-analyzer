/**
 * app/posts/[id]/page.tsx – Post detail page.
 * Shows full post metadata, AI summary, and a link back to Reddit.
 */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SummaryCard from "@/components/SummaryCard";
import type { Post } from "@/types/post";
import { fetchPost } from "@/services/api";

function StatBadge({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}>
      <span style={{ fontSize: "1.4rem" }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: "1.3rem", color }}>{value}</span>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchPost(id)
      .then(setPost)
      .catch(() => setError("Post not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
        <div className="skeleton" style={{ height: "24px", width: "120px", marginBottom: "40px" }} />
        <div className="skeleton" style={{ height: "40px", width: "80%", marginBottom: "24px" }} />
        <div className="skeleton" style={{ height: "20px", width: "40%", marginBottom: "40px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: "100px" }} />)}
        </div>
        <SummaryCard summary="" loading />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ paddingTop: "80px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
        <h1 style={{ color: "var(--text-primary)", marginBottom: "12px" }}>Post Not Found</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>{error}</p>
        <Link href="/" style={{
          padding: "10px 24px",
          background: "var(--gradient-accent)",
          borderRadius: "var(--radius-sm)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.9rem",
        }}>← Back to Dashboard</Link>
      </div>
    );
  }

  const subredditColors: Record<string, string> = {
    MachineLearning: "#60a5fa",
    artificial: "#a78bfa",
    programming: "#34d399",
    technology: "#22d3ee",
    OpenAI: "#fbbf24",
  };
  const badgeColor = subredditColors[post.subreddit] ?? "#94a3b8";

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "64px", maxWidth: "860px" }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          fontWeight: 500,
          padding: "6px 14px",
          cursor: "pointer",
          marginBottom: "32px",
          transition: "all var(--transition)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
        }}
      >
        ← Back
      </button>

      {/* Subreddit badge */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          padding: "4px 12px",
          borderRadius: "20px",
          background: `${badgeColor}20`,
          color: badgeColor,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          r/{post.subreddit}
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: "clamp(1.3rem, 3vw, 2rem)",
        fontWeight: 700,
        lineHeight: 1.4,
        color: "var(--text-primary)",
        marginBottom: "32px",
      }}>
        {post.title}
      </h1>

      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
        marginBottom: "32px",
      }}>
        <StatBadge icon="⬆️" value={formatScore(post.score)} label="Upvotes" color="#fbbf24" />
        <StatBadge icon="💬" value={formatScore(post.comments_count)} label="Comments" color="#60a5fa" />
        <StatBadge icon="📅" value={new Date(post.created_at).toLocaleDateString()} label="Posted on" color="#a78bfa" />
      </div>

      {/* AI Summary */}
      <div style={{ marginBottom: "32px" }}>
        <SummaryCard summary={post.summary} />
      </div>

      {/* Keywords */}
      {post.keywords && post.keywords.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Extracted Keywords
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {post.keywords.map(kw => (
              <span key={kw} style={{
                padding: "5px 14px",
                borderRadius: "20px",
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.2)",
                color: "#a78bfa",
                fontSize: "0.82rem",
                fontWeight: 500,
              }}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Reddit link */}
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          background: "var(--gradient-accent)",
          borderRadius: "var(--radius-md)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.9rem",
          transition: "opacity var(--transition), transform var(--transition)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.opacity = "0.9";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
        View on Reddit
      </a>
    </div>
  );
}

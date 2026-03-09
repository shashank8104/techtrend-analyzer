/**
 * page.tsx – Homepage dashboard.
 * Shows Trending Topics panel + filterable Reddit Posts grid.
 * Uses a "use client" wrapper for filter interactivity on top of
 * server-fetched initial data.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import TrendList from "@/components/TrendList";
import PostCard from "@/components/PostCard";
import Filters from "@/components/Filters";
import type { Post, Trend, SubredditFilter, TimeRange } from "@/types/post";
import { fetchPosts, fetchTrending } from "@/services/api";

/* ── Hero section ─────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      textAlign: "center",
      padding: "72px 24px 48px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: "absolute",
        top: "20%", left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "300px",
        background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="animate-fadeInUp" style={{ position: "relative" }}>
        {/* Live badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: "20px",
          padding: "4px 14px",
          marginBottom: "24px",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#34d399",
        }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: "#10b981",
            animation: "pulse-glow 2s ease-in-out infinite",
            display: "inline-block",
          }} />
          Live Reddit Data
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: "16px",
          letterSpacing: "-0.02em",
        }}>
          Discover What&apos;s{" "}
          <span className="gradient-text">Trending</span>
          <br />in Technology
        </h1>

        <p style={{
          fontSize: "1.05rem",
          color: "var(--text-secondary)",
          maxWidth: "540px",
          margin: "0 auto",
          lineHeight: 1.7,
        }}>
          AI-powered insights from Reddit&apos;s top tech communities — updated every 6 hours.
        </p>
      </div>
    </section>
  );
}

/* ── Main dashboard page ──────────────────────────────────────────────────── */
export default function HomePage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [subreddit, setSubreddit] = useState<SubredditFilter>("");
  const [timeRange, setTimeRange] = useState<TimeRange>("");

  // Load trending topics once
  useEffect(() => {
    fetchTrending(20)
      .then(r => setTrends(r.trends))
      .catch(() => {})
      .finally(() => setTrendsLoading(false));
  }, []);

  // Load posts whenever filters or page change
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPosts(subreddit, timeRange, page, 18);
      setPosts(data.results);
      setTotal(data.total);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [subreddit, timeRange, page]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Reset page on filter change
  const handleSubredditChange = (val: SubredditFilter) => {
    setSubreddit(val);
    setPage(1);
  };
  const handleTimeRangeChange = (val: TimeRange) => {
    setTimeRange(val);
    setPage(1);
  };

  const totalPages = Math.ceil(total / 18);

  return (
    <>
      <Hero />

      <div className="container" style={{ paddingBottom: "48px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "32px",
          alignItems: "start",
        }}>
          {/* ── Left sidebar: Trending Topics ────────────────────────────── */}
          <aside id="trending" style={{ position: "sticky", top: "80px" }}>
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
            }}>
              <h2 style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  🔥 Trending Topics
                </span>
              </h2>

              {trendsLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: "40px", borderRadius: "var(--radius-sm)" }} />
                  ))}
                </div>
              ) : (
                <TrendList trends={trends} />
              )}
            </div>
          </aside>

          {/* ── Main: Posts grid ─────────────────────────────────────────── */}
          <section id="posts">
            {/* Section header + filters */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Top Reddit Posts
                {total > 0 && (
                  <span style={{
                    marginLeft: "10px",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    background: "rgba(255,255,255,0.06)",
                    padding: "2px 10px",
                    borderRadius: "20px",
                  }}>{total.toLocaleString()}</span>
                )}
              </h2>
              <Filters
                subreddit={subreddit}
                timeRange={timeRange}
                onSubredditChange={handleSubredditChange}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "var(--radius-lg)" }} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "80px 24px",
                color: "var(--text-muted)",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                <p style={{ fontWeight: 500 }}>No posts found.</p>
                <p style={{ fontSize: "0.875rem", marginTop: "8px" }}>
                  Try changing the filters, or trigger a scrape from the backend.
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}>
                {posts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "40px",
              }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: page === 1 ? "var(--text-muted)" : "var(--text-primary)",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >← Prev</button>

                <span style={{
                  padding: "8px 20px",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                }}>
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >Next →</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

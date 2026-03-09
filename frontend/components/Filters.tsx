/**
 * Filters.tsx – Subreddit selector and time range filter dropdowns.
 * Emits filter state changes to parent via callback props.
 */
"use client";

import type { SubredditFilter, TimeRange } from "@/types/post";

interface FiltersProps {
  subreddit: SubredditFilter;
  timeRange: TimeRange;
  onSubredditChange: (val: SubredditFilter) => void;
  onTimeRangeChange: (val: TimeRange) => void;
}

const SELECT_STYLE: React.CSSProperties = {
  appearance: "none",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  padding: "8px 36px 8px 14px",
  cursor: "pointer",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color var(--transition)",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
};

export default function Filters({
  subreddit,
  timeRange,
  onSubredditChange,
  onTimeRangeChange,
}: FiltersProps) {
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      alignItems: "center",
    }}>
      {/* Label */}
      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginRight: "4px" }}>
        Filter:
      </span>

      {/* Subreddit filter */}
      <div style={{ position: "relative" }}>
        <select
          value={subreddit}
          onChange={e => onSubredditChange(e.target.value as SubredditFilter)}
          style={SELECT_STYLE}
          aria-label="Filter by subreddit"
        >
          <option value="">All Subreddits</option>
          <option value="MachineLearning">r/MachineLearning</option>
          <option value="artificial">r/artificial</option>
          <option value="programming">r/programming</option>
          <option value="technology">r/technology</option>
          <option value="OpenAI">r/OpenAI</option>
        </select>
      </div>

      {/* Time range filter */}
      <div style={{ position: "relative" }}>
        <select
          value={timeRange}
          onChange={e => onTimeRangeChange(e.target.value as TimeRange)}
          style={SELECT_STYLE}
          aria-label="Filter by time range"
        >
          <option value="">All Time</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Clear filters button */}
      {(subreddit || timeRange) && (
        <button
          onClick={() => { onSubredditChange(""); onTimeRangeChange(""); }}
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-sm)",
            color: "#f87171",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "8px 14px",
            cursor: "pointer",
            transition: "background var(--transition)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

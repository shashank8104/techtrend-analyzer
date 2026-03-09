/**
 * api.ts – Typed fetch helpers for all backend endpoints.
 * Reads NEXT_PUBLIC_API_URL from environment, defaults to localhost:8000.
 */

import type { Post, PostsResponse, TrendsResponse, SummaryResponse, TimeRange, SubredditFilter } from "@/types/post";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 300 }, // cache for 5 minutes (ISR)
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch a paginated list of posts with optional filters. */
export async function fetchPosts(
  subreddit: SubredditFilter = "",
  timeRange: TimeRange = "",
  page = 1,
  pageSize = 20
): Promise<PostsResponse> {
  const params = new URLSearchParams();
  if (subreddit) params.set("subreddit", subreddit);
  if (timeRange) params.set("time_range", timeRange);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return apiFetch<PostsResponse>(`/posts/?${params.toString()}`);
}

/** Fetch a single post by ID. */
export async function fetchPost(id: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`);
}

/** Fetch trending technology keywords. */
export async function fetchTrending(limit = 20): Promise<TrendsResponse> {
  return apiFetch<TrendsResponse>(`/trending/?limit=${limit}`);
}

/** Fetch (or generate) an AI summary for a post. */
export async function fetchSummary(id: string): Promise<SummaryResponse> {
  return apiFetch<SummaryResponse>(`/summary/${id}`);
}

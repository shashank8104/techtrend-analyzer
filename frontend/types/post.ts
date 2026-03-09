/**
 * post.ts – TypeScript interfaces matching the backend API response shapes.
 */

export interface Post {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  comments_count: number;
  url: string;
  created_at: string;
  summary: string;
  keywords: string[];
  comments?: string[];
}

export interface Trend {
  keyword: string;
  count: number;
}

export interface PostsResponse {
  total: number;
  page: number;
  page_size: number;
  results: Post[];
}

export interface TrendsResponse {
  trends: Trend[];
}

export interface SummaryResponse {
  post_id: string;
  title: string;
  summary: string;
}

export type TimeRange = "24h" | "7d" | "30d" | "";
export type SubredditFilter =
  | "MachineLearning"
  | "artificial"
  | "programming"
  | "technology"
  | "OpenAI"
  | "";

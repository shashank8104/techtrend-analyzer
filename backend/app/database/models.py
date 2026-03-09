"""
models.py – Pydantic models / schemas for MongoDB documents.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Post(BaseModel):
    """Represents a Reddit post stored in MongoDB."""

    title: str
    subreddit: str
    score: int = 0
    comments_count: int = 0
    url: str
    reddit_id: str  # Reddit's unique post ID (used as upsert key)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    comments: list[str] = []    # top comment bodies (plain text)
    summary: str = ""           # AI-generated summary
    keywords: list[str] = []    # extracted trending keywords


class PostResponse(BaseModel):
    """API response model for a post."""

    id: str
    title: str
    subreddit: str
    score: int
    comments_count: int
    url: str
    created_at: datetime
    summary: str
    keywords: list[str]


class TrendResponse(BaseModel):
    """API response for a trending keyword."""

    keyword: str
    count: int


class SummaryResponse(BaseModel):
    """API response for a post summary."""

    post_id: str
    summary: str
    generated_at: Optional[datetime] = None

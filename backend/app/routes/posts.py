"""
posts.py – API routes for Reddit post data.

Endpoints:
  GET /posts          – Paginated list with optional subreddit & time filters
  GET /posts/{id}     – Single post detail by MongoDB _id or reddit_id
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from bson import ObjectId

from app.database.mongodb import get_database

router = APIRouter(prefix="/posts", tags=["posts"])


def _time_filter(time_range: str | None) -> dict:
    """Convert a time_range query param to a MongoDB date filter."""
    if not time_range:
        return {}
    now = datetime.utcnow()
    delta_map = {
        "24h": timedelta(hours=24),
        "7d": timedelta(days=7),
        "30d": timedelta(days=30),
    }
    delta = delta_map.get(time_range)
    if delta is None:
        return {}
    return {"created_at": {"$gte": now - delta}}


def _format_post(doc: dict) -> dict:
    """Serialize a MongoDB document to a JSON-friendly dict."""
    doc["id"] = str(doc.pop("_id"))
    doc["created_at"] = doc["created_at"].isoformat() if doc.get("created_at") else None
    return doc


@router.get("/")
async def get_posts(
    subreddit: str | None = Query(None, description="Filter by subreddit name"),
    time_range: str | None = Query(None, description="One of: 24h, 7d, 30d"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Return a paginated list of posts with optional filters."""
    query: dict = {}

    if subreddit:
        query["subreddit"] = subreddit

    query.update(_time_filter(time_range))

    skip = (page - 1) * page_size
    cursor = (
        db["posts"]
        .find(query)
        .sort("score", -1)
        .skip(skip)
        .limit(page_size)
    )
    posts = await cursor.to_list(length=page_size)
    total = await db["posts"].count_documents(query)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": [_format_post(p) for p in posts],
    }


@router.get("/{post_id}")
async def get_post(
    post_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Return a single post by MongoDB _id."""
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    doc = await db["posts"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")

    return _format_post(doc)

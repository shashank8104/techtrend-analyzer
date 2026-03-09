"""
summary.py – API route that returns (or generates) an AI summary for a post.

Endpoint:
  GET /summary/{id}  – Returns the stored summary, or generates one on-demand
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

from app.database.mongodb import get_database
from app.services.summarizer import summarize_post

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/{post_id}")
async def get_summary(
    post_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Return the AI summary for a post.
    If one doesn't exist yet, generate it on-demand and return it.
    """
    try:
        oid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    doc = await db["posts"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")

    # Return existing summary if available
    if doc.get("summary"):
        return {
            "post_id": post_id,
            "title": doc.get("title"),
            "summary": doc["summary"],
        }

    # Generate on-demand (synchronous call – acceptable for on-demand use)
    try:
        summary = await summarize_post(doc)
        await db["posts"].update_one(
            {"_id": oid},
            {"$set": {"summary": summary, "summary_generated_at": datetime.utcnow()}},
        )
        return {
            "post_id": post_id,
            "title": doc.get("title"),
            "summary": summary,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {exc}")

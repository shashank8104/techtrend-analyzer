"""
summarizer.py – Generates AI summaries for Reddit post discussions using
the HuggingFace Inference API (no local model loading — works on free hosting).
Falls back gracefully if no API token is provided.
"""

import logging
import httpx
from app.config import get_settings
from app.utils.text_cleaning import clean_for_summary
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)
settings = get_settings()

# HuggingFace Inference API endpoint
HF_API_URL = f"https://api-inference.huggingface.co/models/{settings.hf_model}"


def _get_headers() -> dict:
    """Return auth headers if HF_TOKEN is set, otherwise empty (rate-limited but works)."""
    token = getattr(settings, "hf_token", "")
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}


def summarize_text(text: str) -> str:
    """
    Call the HuggingFace Inference API to summarise text.
    No local model is downloaded — runs entirely on HF servers.
    """
    if not text or len(text.split()) < 30:
        return "Not enough content to generate a summary."

    # Truncate to 1024 chars to stay within model limits
    payload = {
        "inputs": text[:1024],
        "parameters": {
            "max_length": 130,
            "min_length": 30,
            "do_sample": False,
        },
        "options": {"wait_for_model": True},
    }

    try:
        response = httpx.post(
            HF_API_URL,
            json=payload,
            headers=_get_headers(),
            timeout=60.0,
        )
        response.raise_for_status()
        result = response.json()

        # Handle both list and dict responses
        if isinstance(result, list) and result:
            return result[0].get("summary_text", "Summary unavailable.")
        if isinstance(result, dict) and "error" in result:
            logger.warning(f"HF API error: {result['error']}")
            return "Summary temporarily unavailable — model loading."
        return "Summary unavailable."

    except Exception as exc:
        logger.error(f"Summarization failed: {exc}", exc_info=True)
        return "Summary generation failed. Please try again later."


async def summarize_post(post: dict) -> str:
    """Generate a summary for a single post document."""
    title = post.get("title", "")
    comments = post.get("comments", [])
    corpus = clean_for_summary([title] + comments)
    return summarize_text(corpus)


async def summarize_all_posts(db: AsyncIOMotorDatabase, batch_size: int = 10) -> int:
    """
    Summarise posts that have no summary yet, in batches.
    Uses HF Inference API — no local GPU/RAM needed.
    """
    posts_col = db["posts"]
    cursor = posts_col.find({"summary": ""}).limit(batch_size)
    posts = await cursor.to_list(length=batch_size)
    count = 0

    for post in posts:
        try:
            summary = await summarize_post(post)
            await posts_col.update_one(
                {"_id": post["_id"]},
                {"$set": {"summary": summary}},
            )
            count += 1
            logger.info(f"  Summarised: {post.get('title', '')[:60]}…")
        except Exception as exc:
            logger.error(f"  Failed: {exc}", exc_info=True)

    logger.info(f"✅ Summarised {count} posts.")
    return count

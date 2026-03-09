"""
summarizer.py – Generates AI summaries for Reddit post discussions using
a Hugging Face summarisation pipeline (default: facebook/bart-large-cnn).
"""

import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from transformers import pipeline
from app.config import get_settings
from app.utils.text_cleaning import clean_for_summary

logger = logging.getLogger(__name__)
settings = get_settings()

# Lazy-loaded global pipeline
_summarizer = None


def _get_pipeline():
    """Load the Hugging Face summarisation pipeline (once)."""
    global _summarizer
    if _summarizer is None:
        logger.info(f"Loading HuggingFace model '{settings.hf_model}' – this may take a while…")
        _summarizer = pipeline(
            "summarization",
            model=settings.hf_model,
            # Use CPU to avoid CUDA dependency issues; remove to use GPU if available
            device=-1,
        )
        logger.info("✅ Summarisation model loaded.")
    return _summarizer


def summarize_text(text: str) -> str:
    """
    Run the summarisation pipeline on a text string.
    Handles edge cases like very short inputs.
    """
    if not text or len(text.split()) < 30:
        return "Not enough content to generate a summary."

    pipe = _get_pipeline()
    # BART accepts up to ~1024 tokens; we pre-truncate the input
    max_input_chars = 3000
    truncated = text[:max_input_chars]

    result = pipe(
        truncated,
        max_length=130,
        min_length=30,
        do_sample=False,
    )
    return result[0]["summary_text"]


async def summarize_post(post: dict) -> str:
    """
    Generate a summary for a single post document.
    Combines title + comments as the input corpus.
    """
    title = post.get("title", "")
    comments = post.get("comments", [])
    corpus = clean_for_summary([title] + comments)
    return summarize_text(corpus)


async def summarize_all_posts(db: AsyncIOMotorDatabase, batch_size: int = 20) -> int:
    """
    Iterate over posts that have no summary yet and generate summaries.
    Processes `batch_size` posts per scheduler run to avoid timeout.
    Returns the number of posts summarised.
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
            logger.info(f"  Summarised post: {post.get('title', '')[:60]}…")
        except Exception as exc:
            logger.error(f"  Failed to summarise post {post.get('_id')}: {exc}", exc_info=True)

    logger.info(f"✅ Summarised {count} posts.")
    return count

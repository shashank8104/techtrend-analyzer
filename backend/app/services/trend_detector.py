"""
trend_detector.py – Extracts trending technology keywords from stored posts
using KeyBERT for semantic keyword extraction.
"""

import logging
from collections import Counter
from motor.motor_asyncio import AsyncIOMotorDatabase
from keybert import KeyBERT
from app.utils.text_cleaning import clean_text, remove_stopwords

logger = logging.getLogger(__name__)

# Lazy-load the KeyBERT model to avoid import-time delays
_kw_model: KeyBERT | None = None


def _get_model() -> KeyBERT:
    global _kw_model
    if _kw_model is None:
        logger.info("Loading KeyBERT model (first time may take a moment)…")
        _kw_model = KeyBERT(model="all-MiniLM-L6-v2")
    return _kw_model


def _extract_keywords_from_text(text: str, top_n: int = 5) -> list[str]:
    """
    Run KeyBERT keyword extraction on a piece of text.
    Returns a list of keyword strings.
    """
    if not text.strip():
        return []
    model = _get_model()
    keywords = model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        top_n=top_n,
        use_mmr=True,          # Maximal Marginal Relevance for diversity
        diversity=0.5,
    )
    return [kw for kw, _score in keywords]


async def detect_and_store_trends(db: AsyncIOMotorDatabase, top_n_posts: int = 200) -> list[dict]:
    """
    1. Read the latest `top_n_posts` posts from MongoDB.
    2. Aggregate their titles + cleaned comments into a corpus.
    3. Extract keywords per post and update the document.
    4. Aggregate global trending keywords by frequency.
    5. Store the top-30 trending keywords in a `trends` collection.
    Returns the list of trending keyword dicts.
    """
    posts_col = db["posts"]
    trends_col = db["trends"]

    # Fetch recent posts
    cursor = posts_col.find({}).sort("created_at", -1).limit(top_n_posts)
    posts = await cursor.to_list(length=top_n_posts)

    all_keywords: list[str] = []

    for post in posts:
        # Build per-post text corpus
        title = clean_text(post.get("title", ""))
        comments = " ".join(post.get("comments", []))
        corpus = f"{title} {comments}"
        corpus = remove_stopwords(corpus)

        keywords = _extract_keywords_from_text(corpus, top_n=5)

        # Update post document with keywords
        await posts_col.update_one(
            {"_id": post["_id"]},
            {"$set": {"keywords": keywords}},
        )
        all_keywords.extend(keywords)

    # Count global keyword frequencies
    counter = Counter(all_keywords)
    top_trends = [{"keyword": kw, "count": cnt} for kw, cnt in counter.most_common(30)]

    # Replace the trends collection with latest results
    await trends_col.delete_many({})
    if top_trends:
        await trends_col.insert_many(top_trends)

    logger.info(f"✅ Detected {len(top_trends)} trending keywords.")
    return top_trends

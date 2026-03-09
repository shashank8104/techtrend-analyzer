"""
reddit_scraper.py – Fetches posts and top comments from technology subreddits
using the PRAW library and upserts them into MongoDB.
"""

import logging
from datetime import datetime

import praw
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import get_settings
from app.utils.text_cleaning import clean_text

logger = logging.getLogger(__name__)

settings = get_settings()


def _create_reddit_client() -> praw.Reddit:
    """Initialise and return an authenticated PRAW Reddit client."""
    return praw.Reddit(
        client_id=settings.reddit_client_id,
        client_secret=settings.reddit_client_secret,
        user_agent=settings.reddit_user_agent,
        # Read-only mode – no user login required
        read_only=True,
    )


def _fetch_subreddit_posts(reddit: praw.Reddit, subreddit_name: str) -> list[dict]:
    """
    Fetch the top `posts_per_subreddit` hot posts from a single subreddit.
    Returns a list of cleaned post dicts ready for MongoDB.
    """
    posts = []
    subreddit = reddit.subreddit(subreddit_name)

    for submission in subreddit.hot(limit=settings.posts_per_subreddit):
        # Skip stickied mod posts
        if submission.stickied:
            continue

        # Collect top-level comments (up to 15)
        submission.comments.replace_more(limit=0)
        top_comments = []
        for comment in submission.comments[:15]:
            if hasattr(comment, "body") and comment.body not in ("[deleted]", "[removed]", ""):
                cleaned = clean_text(comment.body)
                if cleaned:
                    top_comments.append(cleaned)

        post_doc = {
            "reddit_id": submission.id,
            "title": submission.title,
            "subreddit": subreddit_name,
            "score": submission.score,
            "comments_count": submission.num_comments,
            "url": f"https://www.reddit.com{submission.permalink}",
            "created_at": datetime.utcfromtimestamp(submission.created_utc),
            "comments": top_comments,
            "summary": "",       # filled by summarizer later
            "keywords": [],      # filled by trend_detector later
        }
        posts.append(post_doc)

    logger.info(f"  Fetched {len(posts)} posts from r/{subreddit_name}")
    return posts


async def scrape_and_store(db: AsyncIOMotorDatabase) -> int:
    """
    Main entry point called by the scheduler.
    Scrapes all configured subreddits and upserts posts into MongoDB.
    Returns the total number of posts processed.
    """
    reddit = _create_reddit_client()
    collection = db["posts"]
    total = 0

    for subreddit_name in settings.subreddits:
        try:
            posts = _fetch_subreddit_posts(reddit, subreddit_name)
            for post in posts:
                # Upsert by reddit_id so re-runs update scores/comment counts
                await collection.update_one(
                    {"reddit_id": post["reddit_id"]},
                    {"$set": post},
                    upsert=True,
                )
            total += len(posts)
        except Exception as exc:
            logger.error(f"Error scraping r/{subreddit_name}: {exc}", exc_info=True)

    logger.info(f"✅ Scraping complete. {total} posts upserted.")
    return total

"""
jobs.py – APScheduler background job that orchestrates the full data pipeline:
  scrape → trend detection → summarisation → store.
Runs every 6 hours (configurable via settings.refresh_interval_hours).
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.config import get_settings
from app.database.mongodb import get_database
from app.services.reddit_scraper import scrape_and_store
from app.services.trend_detector import detect_and_store_trends
from app.services.summarizer import summarize_all_posts

logger = logging.getLogger(__name__)
settings = get_settings()


async def run_pipeline() -> None:
    """Full data pipeline executed on each scheduled tick."""
    logger.info("🚀 Starting scheduled pipeline…")
    db = get_database()

    # Step 1 – Scrape Reddit
    logger.info("Step 1/3 – Scraping Reddit posts…")
    await scrape_and_store(db)

    # Step 2 – Detect trends
    logger.info("Step 2/3 – Detecting trends…")
    await detect_and_store_trends(db)

    # Step 3 – Generate AI summaries (batch)
    logger.info("Step 3/3 – Generating AI summaries…")
    await summarize_all_posts(db)

    logger.info("✅ Pipeline run complete.")


def create_scheduler() -> AsyncIOScheduler:
    """
    Create and return a configured AsyncIOScheduler.
    The scheduler is NOT started here; call scheduler.start() after app startup.
    """
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_pipeline,
        trigger=IntervalTrigger(hours=settings.refresh_interval_hours),
        id="pipeline_job",
        name="TechTrend Data Pipeline",
        replace_existing=True,
        # Run immediately on first startup as well
        next_run_time=None,  # Will trigger based on interval from start
    )
    return scheduler

"""
main.py – FastAPI application factory.
Registers routers, configures CORS, manages MongoDB lifecycle,
and starts the APScheduler background job on startup.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routes import posts, trends, summary
from app.scheduler.jobs import create_scheduler, run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s – %(message)s",
)

settings = get_settings()
logger = logging.getLogger(__name__)

# Global scheduler instance
_scheduler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    global _scheduler

    # ── Startup ───────────────────────────────────────────────────────────────
    logger.info("🔄 Connecting to MongoDB…")
    try:
        await asyncio.wait_for(connect_to_mongo(), timeout=15)
        logger.info("✅ MongoDB connected")
    except asyncio.TimeoutError:
        logger.warning("MongoDB connection timed out after 15s – retrying in background")
        asyncio.create_task(connect_to_mongo())
    except Exception as e:
        logger.warning(f"MongoDB connection failed (app will start): {e}")

    logger.info("⏰ Starting background scheduler…")
    _scheduler = create_scheduler()
    _scheduler.start()

    # Run the pipeline in the background after a short delay so the server binds first
    async def _run_pipeline_background():
        await asyncio.sleep(30)  # Let server bind and Render health check pass
        logger.info("🚀 Running initial data pipeline in background…")
        try:
            await run_pipeline()
            logger.info("✅ Initial pipeline complete.")
        except Exception as exc:
            logger.warning(f"Initial pipeline run skipped or failed: {exc}")

    asyncio.create_task(_run_pipeline_background())

    yield  # ── Application running ──────────────────────────────────────────

    # ── Shutdown ──────────────────────────────────────────────────────────────
    # Shutdown
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)

    try:
        await close_mongo_connection()
    except Exception:
        pass

    logger.info("👋 Server shutdown complete.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="TechTrend Analyzer API",
        description="API for fetching trending technology posts and AI insights from Reddit.",
        version="1.0.0",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url, "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(posts.router)
    app.include_router(trends.router)
    app.include_router(summary.router)

    @app.get("/", tags=["health"])
    async def health_check():
        return {"status": "ok", "service": "TechTrend Analyzer API"}

    @app.post("/admin/scrape", tags=["admin"])
    async def trigger_scrape():
        """Manually trigger the full data pipeline (for dev/testing)."""
        from app.database.mongodb import get_database
        await run_pipeline()
        return {"status": "Pipeline triggered successfully"}

    return app


app = create_app()

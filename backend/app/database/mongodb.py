"""
mongodb.py – Async Motor client for MongoDB.
Provides get_database() helper used throughout the application.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    """Create the Motor client and verify connectivity."""
    global _client
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongo_uri)
    # Ping to verify connection
    await _client.admin.command("ping")
    logger.info("✅ Connected to MongoDB")


async def close_mongo_connection() -> None:
    """Close the Motor client gracefully."""
    global _client
    if _client:
        _client.close()
        logger.info("🔌 MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the application database handle."""
    if _client is None:
        raise RuntimeError("MongoDB client not initialised. Call connect_to_mongo() first.")
    return _client["techtrend"]

"""
trends.py – API route that returns cached trending technology keywords.

Endpoint:
  GET /trending  – Returns top trending keywords from the `trends` collection
"""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongodb import get_database

router = APIRouter(prefix="/trending", tags=["trends"])


@router.get("/")
async def get_trending(
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Return the top trending technology keywords."""
    cursor = db["trends"].find({}, {"_id": 0}).sort("count", -1).limit(limit)
    trends = await cursor.to_list(length=limit)
    return {"trends": trends}

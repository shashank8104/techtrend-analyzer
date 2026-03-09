"""
config.py – Central configuration loader using pydantic-settings.
All settings are read from environment variables (or a .env file).
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Reddit API credentials
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "TechTrendAnalyzer/1.0"

    # MongoDB
    mongo_uri: str = "mongodb://localhost:27017/techtrend"

    # Hugging Face model for summarization
    hf_model: str = "facebook/bart-large-cnn"
    # Optional HF API token for higher rate limits on Inference API
    hf_token: str = ""


    # CORS
    frontend_url: str = "http://localhost:3000"

    # Subreddits to scrape
    subreddits: list[str] = [
        "MachineLearning",
        "artificial",
        "programming",
        "technology",
        "OpenAI",
    ]

    # Posts to fetch per subreddit per run
    posts_per_subreddit: int = 100

    # Scheduler interval in hours
    refresh_interval_hours: int = 6

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    return Settings()

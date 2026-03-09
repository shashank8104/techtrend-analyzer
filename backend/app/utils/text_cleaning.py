"""
text_cleaning.py – Utilities for normalising raw Reddit post/comment text.
"""

import re
import string
import nltk
from nltk.corpus import stopwords

# Download stopwords if not already present (happens once)
try:
    _STOPWORDS = set(stopwords.words("english"))
except LookupError:
    nltk.download("stopwords", quiet=True)
    _STOPWORDS = set(stopwords.words("english"))


def remove_urls(text: str) -> str:
    """Strip http/https URLs from text."""
    return re.sub(r"https?://\S+|www\.\S+", "", text)


def remove_special_characters(text: str) -> str:
    """Remove punctuation and non-alphanumeric characters (keep spaces)."""
    # Keep letters, digits, and whitespace
    return re.sub(r"[^a-zA-Z0-9\s]", " ", text)


def normalize_whitespace(text: str) -> str:
    """Collapse multiple spaces / newlines into a single space."""
    return re.sub(r"\s+", " ", text).strip()


def remove_stopwords(text: str) -> str:
    """Remove common English stopwords from text."""
    words = text.lower().split()
    filtered = [w for w in words if w not in _STOPWORDS and len(w) > 2]
    return " ".join(filtered)


def clean_text(text: str, remove_stops: bool = False) -> str:
    """
    Full cleaning pipeline:
      1. Remove URLs
      2. Remove special characters
      3. Normalize whitespace
      4. Optionally remove stopwords
    """
    text = remove_urls(text)
    text = remove_special_characters(text)
    text = normalize_whitespace(text)
    if remove_stops:
        text = remove_stopwords(text)
    return text


def clean_for_summary(texts: list[str], max_chars: int = 3000) -> str:
    """
    Prepare a list of text snippets for AI summarisation.
    Joins, cleans, and truncates to max_chars so the model isn't overloaded.
    """
    combined = " ".join(texts)
    combined = remove_urls(combined)
    combined = normalize_whitespace(combined)
    return combined[:max_chars]

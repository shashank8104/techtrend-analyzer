
# TechTrend Analyzer – Agent Build Prompt

Use this prompt with an agentic coding system (Cursor Agent, Claude Code, GPT‑Engineer, AutoGPT, etc.) to generate the full project.

---

# MASTER INSTRUCTION

You are a senior full‑stack AI engineer.

Your task is to build a complete production‑ready web application called **TechTrend Analyzer**.

The application analyzes technology discussions from Reddit, detects trending topics, summarizes discussions using AI, and presents insights through a web dashboard.

Work incrementally and generate clean, modular, well‑documented code.

Complete backend modules first, then build the frontend.

---

# PROJECT OBJECTIVE

Build a system that:

1. Collects posts from AI and technology subreddits.
2. Stores them in a database.
3. Detects trending technologies.
4. Generates AI summaries of discussions.
5. Displays insights on a web dashboard.

---

# DATA SOURCE

Use the official Reddit API via PRAW.

Subreddits:

- r/MachineLearning
- r/artificial
- r/programming
- r/technology
- r/OpenAI

Posts per subreddit: **100**

Data refresh interval: **every 6 hours**

---

# TECH STACK

Frontend:
- Next.js

Backend:
- Python
- FastAPI

Database:
- MongoDB

NLP / AI:
- Hugging Face models

Scraping:
- PRAW (Python Reddit API Wrapper)

Deployment:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

# SYSTEM ARCHITECTURE

User Browser
↓
Next.js Frontend
↓
FastAPI Backend
↓
Data Processing Layer
↓
MongoDB Database
↓
Reddit API

---

# PROJECT STRUCTURE

root/

frontend/
backend/

docker-compose.yml
README.md
.env

---

# BACKEND STRUCTURE

backend/

app/

main.py
config.py

routes/
posts.py
trends.py
summary.py

services/
reddit_scraper.py
trend_detector.py
summarizer.py

database/
mongodb.py
models.py

scheduler/
jobs.py

utils/
text_cleaning.py

requirements.txt

---

# FRONTEND STRUCTURE

frontend/

app/
page.tsx
layout.tsx

components/
Navbar.tsx
PostCard.tsx
TrendList.tsx
SummaryCard.tsx
Filters.tsx

services/
api.ts

types/
post.ts

styles/
globals.css

---

# DATABASE SCHEMA

MongoDB collection: posts

Example document:

{
"title": "Nvidia releases new AI chip",
"subreddit": "technology",
"score": 12500,
"comments_count": 890,
"url": "reddit_link",
"created_at": "timestamp",
"comments": [],
"summary": "",
"keywords": []
}

---

# BACKEND API

Create the following endpoints:

GET /posts  
Returns latest posts

GET /trending  
Returns trending technology keywords

GET /posts/{id}  
Returns post details

GET /summary/{id}  
Returns AI summary

---

# REDDIT SCRAPER

Create a scraper using PRAW.

Tasks:

- Fetch posts from the listed subreddits
- Collect title, score, comments, URL, timestamp
- Store results in MongoDB

Limit:

100 posts per subreddit.

---

# TEXT PROCESSING

Create utilities for:

- removing URLs
- removing special characters
- normalizing text
- removing stopwords

---

# TREND DETECTION

Extract trending technologies from titles and comments.

Possible methods:

- TF‑IDF
- KeyBERT
- RAKE

Output example:

[
"AI Agents",
"Open Source LLM",
"Nvidia GPU",
"RAG Systems"
]

---

# AI SUMMARIZATION

Use an open‑source model from Hugging Face.

Recommended models:

- BART
- T5
- Pegasus

Input:

Reddit comments.

Output:

Short discussion summary.

---

# BACKGROUND JOB

Create a scheduler that runs every 6 hours.

Steps:

1. fetch Reddit posts
2. clean text
3. detect trending topics
4. generate summaries
5. store results in MongoDB

Recommended library:

APScheduler.

---

# FRONTEND DASHBOARD

Homepage should show:

Trending Topics
Top Reddit Posts

Each post card shows:

Title
Subreddit
Upvotes
Comment count

---

# POST DETAIL PAGE

Display:

Post title
Reddit link
Upvotes
Comment count
AI discussion summary

---

# FILTERS

Users should be able to filter by:

Subreddit
Time range

Time filters:

Last 24 hours
Last 7 days
Last 30 days

---

# ENVIRONMENT VARIABLES

REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=

MONGO_URI=

HF_MODEL=

---

# DEVELOPMENT PHASES

Phase 1
Backend setup and MongoDB connection

Phase 2
Reddit scraper

Phase 3
Trend detection

Phase 4
AI summarization

Phase 5
Next.js dashboard

Phase 6
Deployment

---

# CODING GUIDELINES

Follow these rules:

- modular architecture
- clean readable code
- add comments
- create reusable components
- implement error handling
- write a complete README

---

# FINAL OUTPUT

The completed project must include:

- working FastAPI backend
- Reddit scraper
- trend detection module
- AI summarization module
- MongoDB integration
- Next.js dashboard
- deployment instructions

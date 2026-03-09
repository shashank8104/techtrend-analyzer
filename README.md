# TechTrend Analyzer

> **AI-powered Reddit trends dashboard** — Collects posts from top tech subreddits, detects trending technologies using KeyBERT NLP, generates discussion summaries using BART, and presents everything on a modern Next.js dashboard.

---

## 📸 Features

- 🔍 **Live Reddit Scraping** — 500 posts across 5 tech subreddits, refreshed every 6 hours
- 📈 **Trend Detection** — KeyBERT semantic keyword extraction to surface emerging technologies
- 🤖 **AI Summaries** — HuggingFace BART model condenses Reddit discussions into concise insights
- 🎛️ **Smart Filters** — Filter by subreddit and time range (24h / 7d / 30d)
- 📊 **Responsive Dashboard** — Sleek dark-mode Next.js frontend with skeleton loaders

---

## 🏗️ Architecture

```
Browser → Next.js (Vercel) → FastAPI (Render) → MongoDB Atlas
                                    ↕
                              Reddit API (PRAW)
                              HuggingFace BART
                              APScheduler (6h)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 20+
- MongoDB (local or Atlas)
- Reddit API credentials ([create an app](https://www.reddit.com/prefs/apps))

---

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/techtrend-analyzer.git
cd techtrend-analyzer
```

Copy `.env` and fill in your credentials:

```bash
cp .env .env.local
```

```env
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=TechTrendAnalyzer/1.0 by YourUsername

MONGO_URI=mongodb://localhost:27017/techtrend

HF_MODEL=facebook/bart-large-cnn
FRONTEND_URL=http://localhost:3000
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies (~5 min, downloads torch + transformers)
pip install -r requirements.txt

# Download NLTK stopwords
python -c "import nltk; nltk.download('stopwords')"

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

On first startup, it automatically scrapes Reddit and runs the pipeline.

---

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### 4. Docker Compose (All-in-One)

```bash
# From project root
docker-compose up --build
```

Services:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| MongoDB | localhost:27017 |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/posts/` | Paginated posts (filters: `subreddit`, `time_range`, `page`) |
| `GET` | `/posts/{id}` | Single post detail |
| `GET` | `/trending/` | Top trending keywords |
| `GET` | `/summary/{id}` | AI summary for a post |
| `POST` | `/admin/scrape` | Manually trigger the pipeline |

**Filter examples:**
```
GET /posts/?subreddit=MachineLearning&time_range=7d&page=2
GET /trending/?limit=10
```

---

## 📦 Project Structure

```
TechTrend Analyzer/
├── .env                        # Environment variables template
├── docker-compose.yml          # Local orchestration
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app factory
│   │   ├── config.py           # Settings (pydantic-settings)
│   │   ├── database/
│   │   │   ├── mongodb.py      # Motor async client
│   │   │   └── models.py       # Pydantic models
│   │   ├── routes/
│   │   │   ├── posts.py        # GET /posts, /posts/{id}
│   │   │   ├── trends.py       # GET /trending
│   │   │   └── summary.py      # GET /summary/{id}
│   │   ├── services/
│   │   │   ├── reddit_scraper.py  # PRAW scraper
│   │   │   ├── trend_detector.py  # KeyBERT trend extraction
│   │   │   └── summarizer.py      # HuggingFace BART
│   │   ├── scheduler/
│   │   │   └── jobs.py         # APScheduler 6h pipeline
│   │   └── utils/
│   │       └── text_cleaning.py   # NLP text utilities
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── app/
    │   ├── layout.tsx           # Root layout + Navbar
    │   ├── page.tsx             # Dashboard homepage
    │   └── posts/[id]/page.tsx  # Post detail page
    ├── components/
    │   ├── Navbar.tsx
    │   ├── TrendList.tsx
    │   ├── PostCard.tsx
    │   ├── SummaryCard.tsx
    │   └── Filters.tsx
    ├── services/api.ts          # Typed API client
    ├── types/post.ts            # TypeScript interfaces
    └── Dockerfile
```

---

## ☁️ Deployment

### Backend → Render

1. Connect your GitHub repo to [Render](https://render.com)
2. Create a **Web Service** from the `backend/` folder
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env`

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend/`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com`

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Copy the connection string into `MONGO_URI`
3. Whitelist Render's IP (or set `0.0.0.0/0` for dev)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| Backend | FastAPI, Python 3.11 |
| Database | MongoDB (Motor async driver) |
| Scraping | PRAW (Reddit API) |
| NLP | KeyBERT, RAKE, NLTK |
| AI Model | HuggingFace BART (facebook/bart-large-cnn) |
| Scheduler | APScheduler |
| Containerisation | Docker, Docker Compose |

---

## ⚠️ Notes

- **First run downloads the BART model (~1.6 GB)**. Ensure you have a stable internet connection.
- Reddit API is rate-limited; do not set the scrape interval below 1 hour.
- The `/admin/scrape` endpoint has no authentication — add API key protection before exposing publicly.

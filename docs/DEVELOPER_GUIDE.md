# Zampify AI Developer Guide

Welcome to the Zampify AI developer documentation! This guide covers the local setup, architecture, and running instructions to get you started with development.

## 🏗 System Architecture

Zampify AI uses a modern, multi-tier architecture designed for speed, scalability, and AI integration:

- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui.
- **Backend:** FastAPI (Python), SQLAlchemy (async), ARQ (Redis task queue).
- **Database:** PostgreSQL (Primary Data), Redis (Message Broker / Task Queue).
- **AI Models:** Featherless API (Qwen 72B) for extraction and reasoning.

The backend consists of an API server and background workers (ARQ) that process invoices and ingest emails asynchronously.

---

## 🛠 Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.10+** (Recommend using `uv` or `pip` + `venv`)
- **Node.js 18+** (for Next.js frontend)
- **Docker & Docker Compose** (for running local PostgreSQL and Redis)
- **Git**

---

## 🚀 Local Environment Setup

### 1. Database & Cache (Docker)
You need PostgreSQL and Redis running locally. We provide a `docker-compose.yml` for convenience.

```bash
# In the root of the project
docker compose up -d redis postgres
```

### 2. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables (.env)**
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql+asyncpg://zampify:zampify@localhost:5432/zampify
DATABASE_SYNC_URL=postgresql://zampify:zampify@localhost:5432/zampify
REDIS_URL=redis://localhost:6380
SECRET_KEY=your-local-secret-key
FEATHERLESS_API_KEY=your-featherless-api-key
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_MODEL=Qwen/Qwen2.5-72B-Instruct
DEBUG=true
```

**Seed Initial Data (Optional)**
```bash
python scripts/seed.py
```

### 3. Frontend Setup (Next.js)

```bash
cd frontend
npm install
```

**Environment Variables (.env.local)**
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1
```

---

## 🏃 Running the Application Locally

To run the full stack locally, you need to start 4 separate processes. Open a new terminal for each:

**1. FastAPI API Server**
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**2. Background Task Worker (ARQ)**
Processes AI extraction, OCR, and validation tasks asynchronously.
```bash
cd backend
.\venv\Scripts\Activate.ps1
arq app.workers.settings.WorkerSettings --watch app
```

**3. Email Ingestion Poller**
Listens for new incoming emails with invoice attachments.
```bash
cd backend
.\venv\Scripts\Activate.ps1
python -m app.services.email_ingestion
```

**4. Next.js Frontend Server**
```bash
cd frontend
npm run dev
```

The application will now be available at **http://localhost:3000**.

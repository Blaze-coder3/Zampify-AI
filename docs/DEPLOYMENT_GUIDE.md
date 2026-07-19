# Zampify AI Deployment Guide (Free Tier)

This guide walks you through deploying the complete Zampify AI stack for **100% free** without requiring a credit card using Render, Vercel, and Upstash.

## Architecture

- **Frontend:** Hosted on [Vercel](https://vercel.com).
- **Backend (API + Workers):** Hosted as a Web Service on [Render](https://render.com).
- **Database (PostgreSQL):** Hosted on [Render](https://render.com).
- **Cache / Task Queue (Redis):** Hosted on [Upstash](https://upstash.com).

---

## Step 1: Redis Configuration (Upstash)
Our background task processor (ARQ) relies on Redis. We use Upstash because it provides a completely free Redis tier without a credit card.

1. Go to [Upstash](https://upstash.com/) and sign up with your GitHub account.
2. Click **Create Database**, select **Redis**.
3. Name it `zampify-redis`, choose any free region (preferably close to your database, e.g., US West/Oregon), and click **Create**.
4. Scroll down to the **Connect** section.
5. Select the **Python** tab, and explicitly select the **`redis`** sub-tab (Do *not* select `@upstash/redis` which is for REST).
6. Copy the connection string provided (it looks like `rediss://default:YOUR_PASSWORD@ENDPOINT.upstash.io:6379`). You will need this in Step 2.

---

## Step 2: Backend Deployment (Render)
Render offers a free Web Service tier suitable for our FastAPI backend. We deploy it manually to bypass the credit card requirement associated with Blueprints.

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your `Zampify-AI` GitHub repository.
4. Configure the Web Service:
   - **Name:** `zampify-backend`
   - **Environment:** Python
   - **Root Directory:** `backend`
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
5. Expand the **Advanced** section and add the following Environment Variables:
   - `DATABASE_URL`: `postgresql+asyncpg://...` (Your Render Postgres DB string)
   - `DATABASE_SYNC_URL`: `postgresql://...` (Your Render Postgres DB string)
   - `REDIS_URL`: `rediss://...` (The URL you copied from Upstash)
   - `SECRET_KEY`: `a-secure-random-string-for-production`
   - `FEATHERLESS_API_KEY`: (Your AI Provider Key)
   - `FEATHERLESS_BASE_URL`: `https://api.featherless.ai/v1`
   - `FEATHERLESS_MODEL`: `Qwen/Qwen2.5-72B-Instruct`
   - `IMAP_USERNAME`: (Email address for inbox ingestion)
   - `IMAP_PASSWORD`: (App Password for email inbox)
   - `IMAP_SERVER`: `imap.gmail.com`
6. Click **Create Web Service**. 
7. Once deployed, note down the provided URL (e.g., `https://zampify-backend.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel)
Vercel is optimized for Next.js applications and offers a generous free tier.

1. Go to [Vercel](https://vercel.com) and log in with GitHub.
2. Click **Add New -> Project**.
3. Import your `Zampify-AI` repository.
4. Under the Project configuration:
   - Ensure the Framework Preset is **Next.js**.
   - Edit the **Root Directory** and set it to `frontend`.
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL`: `https://YOUR-RENDER-BACKEND-URL/api/v1`
   - `NEXT_PUBLIC_WS_URL`: `wss://YOUR-RENDER-BACKEND-URL/api/v1` (Note the `wss://` protocol)
6. Click **Deploy**.

## Post-Deployment Validation
Once Vercel gives you your frontend URL, visit the site. Try logging in, navigating the dashboard, and uploading a document to verify that the frontend, backend, database, and Redis queue are successfully talking to each other!

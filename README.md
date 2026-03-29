<![CDATA[# 🌐 WealthVision AI — Geospatial Wealth Estimation Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-PostGIS-336791?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

An **AI-driven full-stack platform** that estimates household wealth from satellite/street-level imagery using deep learning, geospatial analysis, and interactive 3D map visualizations. Built for government policy customization and urban planning.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Wealth Estimation** | PyTorch-based deep learning model for image-to-wealth scoring |
| 🗺️ **3D Geospatial Dashboard** | Interactive MapLibre GL + React-Leaflet maps with terrain & sky rendering |
| 📊 **Analytics Dashboard** | Real-time charts, wealth distribution heatmaps, and prediction tracking |
| 🔐 **JWT Authentication** | Secure user registration, login, and role-based access |
| 📤 **Image Upload Pipeline** | EXIF metadata extraction, S3/MinIO storage, and async processing |
| ⚡ **Rate Limiting** | SlowAPI-powered request throttling per user |
| 🧬 **Explainability Heatmaps** | AI model interpretability via attention/activation overlays |
| 🌍 **Geospatial POI Enrichment** | OpenStreetMap Overpass API integration for nearby infrastructure data |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│          Next.js 16 + Tailwind CSS + Three.js        │
│     MapLibre GL · React-Leaflet · Framer Motion      │
│              Deployed on Vercel                      │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                    BACKEND                           │
│         FastAPI + SQLAlchemy + Alembic                │
│     Celery Workers · Redis · PyTorch Inference       │
│        Deployed on Vercel (Serverless)               │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  DATA LAYER                          │
│     PostgreSQL + PostGIS  ·  MinIO / S3 Storage      │
│         Redis (Queue & Cache)                        │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Folder Structure

```
WealthVision-AI/
├── frontend/                # Next.js 16 App Router
│   ├── app/                 # Pages & layouts
│   │   ├── dashboard/       # Main geospatial dashboard
│   │   ├── login/           # Authentication page
│   │   ├── ingest/          # Image upload & processing
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities & API client
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                 # FastAPI REST API
│   ├── app/
│   │   ├── ai/              # PyTorch wealth estimation models
│   │   ├── api/             # Route handlers (auth, upload, prediction, geo)
│   │   ├── core/            # Config, security, rate limiting
│   │   ├── db/              # SQLAlchemy models & database session
│   │   └── schemas/         # Pydantic request/response schemas
│   ├── alembic/             # Database migrations
│   ├── static/              # Uploaded images & assets
│   ├── main.py              # FastAPI application entry point
│   └── requirements.txt     # Python dependencies
│
├── infrastructure/          # DB init scripts & PostGIS extensions
├── docker-compose.yml       # Local full-stack orchestration
├── .env.example             # Environment variable template
└── README.md
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **PostgreSQL** with PostGIS extension (or Docker)
- **Redis** (optional, for Celery async tasks)

### Option 1: Manual Setup

**Backend (FastAPI)**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the dev server
python -m uvicorn main:app --reload
```

> API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Frontend (Next.js)**

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

> App: [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Compose

```bash
# Copy environment template
cp .env.example .env

# Start all services
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| MinIO Dashboard | [http://localhost:9001](http://localhost:9001) |

---

## ☁️ Deploy on Vercel

This project is split into **two separate Vercel deployments**: one for the **frontend** (Next.js) and one for the **backend** (FastAPI as a serverless function).

### 📋 Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works)
2. [Vercel CLI](https://vercel.com/docs/cli) installed:
   ```bash
   npm install -g vercel
   ```
3. A **PostgreSQL database** hosted externally (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or [Vercel Postgres](https://vercel.com/storage/postgres))
4. A **Redis instance** (e.g., [Upstash](https://upstash.com) — free tier) for Celery (optional)
5. An **S3-compatible storage** (e.g., AWS S3, Cloudflare R2) for image uploads

---

### 🖥️ Step 1: Deploy Frontend on Vercel

#### A. Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** and select `Amit123103/WealthVision-AI`
3. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Next.js |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.next` |
   | **Install Command** | `npm install` |

4. Add **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-project.vercel.app` |

5. Click **Deploy** 🚀

#### B. Via Vercel CLI

```bash
# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (follow the prompts)
vercel

# When asked:
# → Set up and deploy? Yes
# → Which scope? Select your account
# → Link to existing project? No
# → Project name? wealthvision-frontend
# → Directory with code? ./
# → Override settings? No

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend-project.vercel.app

# Deploy to production
vercel --prod
```

---

### ⚙️ Step 2: Deploy Backend on Vercel

Vercel supports Python serverless functions. We need to create a small configuration to expose FastAPI as a serverless function.

#### A. Create Vercel Configuration Files

Create the following files **inside the `backend/` directory**:

**`backend/vercel.json`**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

**`backend/requirements.txt`** (already exists — ensure `torch` and `torchvision` are removed or replaced with CPU-only versions for Vercel's 250MB limit):

> ⚠️ **Important:** Vercel serverless functions have a **250MB** size limit. `torch` and `torchvision` exceed this. For production, either:
> - Use `torch` CPU-only: `--extra-index-url https://download.pytorch.org/whl/cpu`
> - Move AI inference to a separate service (AWS Lambda, Modal, Replicate)
> - Use ONNX Runtime (`onnxruntime`) as a lightweight alternative

Create a Vercel-specific requirements file:

**`backend/requirements-vercel.txt`**

```txt
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
asyncpg==0.29.0
alembic==1.12.1
pydantic[email]==2.5.2
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
slowapi==0.1.8
httpx==0.25.1
Pillow==10.1.0
boto3==1.33.2
```

#### B. Update CORS for Vercel Domains

In `backend/main.py`, update the CORS middleware to include your Vercel frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-frontend-project.vercel.app",  # Add your Vercel frontend URL
        "https://*.vercel.app",  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### C. Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** and select `Amit123103/WealthVision-AI`
3. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Other |
   | **Root Directory** | `backend` |

4. Add **Environment Variables**:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `SECRET_KEY` | `your-production-secret-key` | JWT signing key (use a strong random string) |
   | `ALGORITHM` | `HS256` | JWT algorithm |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiry |
   | `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` | Your hosted PostgreSQL URL |
   | `CELERY_BROKER_URL` | `redis://...` | Upstash Redis URL (optional) |
   | `CELERY_RESULT_BACKEND` | `redis://...` | Upstash Redis URL (optional) |
   | `S3_ENDPOINT` | `https://s3.amazonaws.com` | S3-compatible endpoint |
   | `S3_ACCESS_KEY` | `your-access-key` | S3 access key |
   | `S3_SECRET_KEY` | `your-secret-key` | S3 secret key |
   | `S3_BUCKET_NAME` | `wealth-images` | S3 bucket name |
   | `AWS_REGION` | `us-east-1` | AWS region |

5. Click **Deploy** 🚀

#### D. Deploy via Vercel CLI

```bash
# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# When asked:
# → Set up and deploy? Yes
# → Which scope? Select your account
# → Link to existing project? No
# → Project name? wealthvision-backend
# → Directory with code? ./
# → Override settings? No

# Set all environment variables
vercel env add SECRET_KEY
vercel env add DATABASE_URL
vercel env add ALGORITHM
vercel env add ACCESS_TOKEN_EXPIRE_MINUTES
# ... add all variables listed above

# Deploy to production
vercel --prod
```

---

### 🔗 Step 3: Connect Frontend to Backend

After both are deployed, update the frontend environment variable:

```bash
# Set the backend URL in your frontend project
cd frontend
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://wealthvision-backend.vercel.app
# Select: Production, Preview, Development

# Redeploy to pick up the new variable
vercel --prod
```

Or update it in the Vercel Dashboard:
1. Go to your **frontend** project → **Settings** → **Environment Variables**
2. Set `NEXT_PUBLIC_API_URL` = `https://wealthvision-backend.vercel.app`
3. Click **Redeploy** from the Deployments tab

---

### ✅ Step 4: Verify Deployment

| Check | URL | Expected |
|-------|-----|----------|
| Frontend | `https://wealthvision-frontend.vercel.app` | Landing page loads |
| Backend Health | `https://wealthvision-backend.vercel.app/health` | `{"status": "ok"}` |
| API Docs | `https://wealthvision-backend.vercel.app/docs` | Swagger UI |
| Auth Test | `POST /api/v1/auth/register` | User creation works |

---

## 🗄️ Database Setup (Cloud)

For Vercel deployment, you need a hosted PostgreSQL database. Here are recommended providers:

### Neon (Recommended — Free Tier)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project → Copy the connection string
3. Add PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
4. Use the connection string as `DATABASE_URL` in Vercel

### Supabase (Alternative)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project → Go to **Settings** → **Database**
3. Copy the connection string (use "connection pooling" URL for serverless)
4. PostGIS is pre-enabled on Supabase

### Vercel Postgres

1. Go to your Vercel project → **Storage** → **Create Database**
2. Select **Postgres** → Follow setup
3. Connection string is auto-injected as environment variable

---

## 🧠 AI Model Integration

The AI module at `backend/app/ai/wealth_estimator.py` currently uses a **dummy implementation** with random scores. To deploy real weights:

1. Train or obtain a PyTorch/ONNX wealth estimation model
2. Upload weights to S3 or include in the repo
3. Update `.env`:
   ```
   MODEL_WEIGHTS_PATH=./app/ai/your_model_weights.pt
   ```
4. Update the `WealthEstimator` class constructor to load real weights

> **Note:** For Vercel serverless, consider using **ONNX Runtime** instead of PyTorch for smaller bundle size and faster cold starts.

---

## 🔧 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ | — | JWT signing secret |
| `ALGORITHM` | ❌ | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `30` | Token expiry |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `CELERY_BROKER_URL` | ❌ | — | Redis URL for task queue |
| `CELERY_RESULT_BACKEND` | ❌ | — | Redis URL for results |
| `S3_ENDPOINT` | ❌ | — | S3-compatible storage endpoint |
| `S3_ACCESS_KEY` | ❌ | — | S3 access key |
| `S3_SECRET_KEY` | ❌ | — | S3 secret key |
| `S3_BUCKET_NAME` | ❌ | `wealth-images` | S3 bucket name |
| `AWS_REGION` | ❌ | `us-east-1` | AWS region |
| `MODEL_WEIGHTS_PATH` | ❌ | `./app/ai/dummy_weights.pt` | Path to AI model weights |
| `NEXT_PUBLIC_API_URL` | ✅ | — | Backend API URL (frontend only) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 18, TypeScript, Tailwind CSS |
| **3D/Maps** | MapLibre GL JS, React-Leaflet, Three.js, React Three Fiber |
| **Animations** | Framer Motion |
| **State Management** | Zustand, TanStack React Query |
| **Backend** | FastAPI, SQLAlchemy, Alembic |
| **Authentication** | JWT (python-jose), Passlib |
| **Database** | PostgreSQL + PostGIS, GeoAlchemy2 |
| **AI/ML** | PyTorch, TorchVision, Pillow |
| **Task Queue** | Celery + Redis |
| **Storage** | MinIO / AWS S3 |
| **Deployment** | Vercel, Docker |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Amit** — [@Amit123103](https://github.com/Amit123103)

---

<p align="center">
  Made with ❤️ using AI & Open Source
</p>
]]>

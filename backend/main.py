import os
import random
import asyncio
import psycopg2
from pathlib import Path
from urllib.parse import urlparse
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from app.db.database import engine, Base
from app.core.config import settings
from app.api import auth, upload, prediction, dashboard, advanced, geo, v2
from app.core.rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.db import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup: Initialization logic here ---
    try:
        # 1. Auto-create database if missing
        parsed = urlparse(settings.DATABASE_URL)
        db_name = parsed.path.lstrip('/')
        conn = psycopg2.connect(
            dbname="postgres",
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        if not cur.fetchone():
            cur.execute(f"CREATE DATABASE {db_name}")
            print(f"Successfully auto-created database: {db_name}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Warning: Database auto-creation phase skipped: {e}")

    # 2. Synchronize Database Schema
    Base.metadata.create_all(bind=engine)

    # 3. Apply V2 Patch Migrations
    try:
        with engine.begin() as conn:
            for col in ["explainability_data", "data_sources_used"]:
                try:
                    conn.execute(text(f"ALTER TABLE predictions ADD COLUMN {col} JSON"))
                except Exception: pass
    except Exception as e:
        print(f"Migration phase skipped: {e}")

    # 4. Initialize Static Directories
    static_path = Path(__file__).parent / "static"
    uploads_path = static_path / "uploads"
    uploads_path.mkdir(parents=True, exist_ok=True)
    
    yield
    # --- Shutdown logic if needed ---

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Image-Based Estimation of Household Wealth",
    version="1.0.0",
    lifespan=lifespan
)

# Static Files
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")
app.mount("/uploads", StaticFiles(directory=str(static_path / "uploads")), name="uploads")

# Middleware & Globals
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])
app.include_router(prediction.router, prefix="/api/v1/prediction", tags=["prediction"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(geo.router, prefix="/api/v1/geo", tags=["geospatial"])
app.include_router(advanced.router, prefix="/api/v1", tags=["advanced"])
app.include_router(v2.router, prefix="/api/v2", tags=["v2_intelligence"])

@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}

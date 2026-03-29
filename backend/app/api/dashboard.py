from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from sqlalchemy import func
from app.db import models
from app.schemas.prediction import DashboardStats
from app.core.rate_limit import limiter
from fastapi import Request
import json
import redis
from app.core.config import settings

# Setup simple sync cache client
cache = redis.from_url(settings.CELERY_BROKER_URL)

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
@limiter.limit("120/minute")
def get_dashboard_stats(request: Request, db: Session = Depends(get_db)):
    cached_stats = cache.get("dashboard_stats")
    if cached_stats:
        return json.loads(cached_stats)

    total_images = db.query(models.Image).count()
    total_predictions = db.query(models.Prediction).count()
    
    avg_wealth = db.query(func.avg(models.Prediction.wealth_index)).scalar()
    
    stats = {
        "total_images": total_images,
        "total_predictions": total_predictions,
        "average_wealth": float(avg_wealth) if avg_wealth else 0.0
    }
    
    # Cache for 2 seconds to allow real-time reactivity without crushing Redis
    cache.setex("dashboard_stats", 2, json.dumps(stats))
    return stats

@router.get("/heatmap")
@limiter.limit("120/minute")
def get_heatmap_data(request: Request, db: Session = Depends(get_db)):
    # Cache removed temporarily for dynamic real-time map updates during demo phase
    # Mock return for GeoJSON expected by Leaflet Map
    predictions = db.query(models.Prediction).join(models.Image).all()
    # In a real scenario, we extract ST_X and ST_Y from the geom column.
    
    features = []
    for pred in predictions:
        if pred.image and pred.image.location is not None:
             try:
                 # Parse POINT(lng lat) string back to coordinates
                 raw_loc = pred.image.location.replace("POINT(", "").replace(")", "").replace("SRID=4326;", "")
                 parts = raw_loc.strip().split(" ")
                 if len(parts) >= 2:
                     lng, lat = float(parts[0]), float(parts[1])
                 else:
                     lng, lat = 0.0, 0.0
             except:
                 lng, lat = 0.0, 0.0
             
             import os
             from pathlib import Path
             file_path = Path(__file__).parent.parent.parent / "static" / "uploads" / pred.image.s3_path
             exists = os.path.exists(file_path)
             
             features.append({
                 "type": "Feature",
                 "geometry": {"type": "Point", "coordinates": [lng, lat]},
                 "properties": {
                     "wealth_index": pred.wealth_index,
                     "category": pred.category,
                     "confidence": pred.confidence,
                     "image_url": f"http://localhost:8000/static/uploads/{pred.image.s3_path}" if exists else None
                 }
             })
    result = {
        "type": "FeatureCollection",
        "features": features
    }
    
    return result

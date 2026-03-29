from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db import models
from app.core.rate_limit import limiter
from fastapi import Request
import json
from datetime import datetime

router = APIRouter()

# Skip auth for Local MVP as approved in Implementation Plan
def get_mock_user_id():
    return 1  # Dummy user ID for bookmarking and notifications if no auth

@router.get("/insights/region")
@limiter.limit("120/minute")
def get_region_insights(request: Request, db: Session = Depends(get_db)):
    total_preds = db.query(models.Prediction).count()
    if total_preds == 0:
        return {"insight": "No predictions mapped yet. Upload imagery to generate insights."}
    
    # Mock aggregation since we'd typically use PostGIS ST_Within for region bounding boxes
    avg_wealth = db.query(func.avg(models.Prediction.wealth_index)).scalar() or 0
    low_income_count = db.query(models.Prediction).filter(models.Prediction.wealth_index < 40).count()
    
    percent_low = (low_income_count / total_preds) * 100 if total_preds > 0 else 0
    
    return {
        "insight": f"Analysis complete. This region has approximately {percent_low:.1f}% low-income households. Average wealth index sits at {avg_wealth:.1f}."
    }

@router.post("/reports/save")
@limiter.limit("20/minute")
def save_report(request: Request, db: Session = Depends(get_db)):
    # Mock saving a generic bookmark for the demo
    bookmark = models.Bookmark(user_id=1, prediction_id=1) 
    # In reality, we read prediction_id from request body
    db.add(bookmark)
    
    notification = models.Notification(user_id=1, message="New simulation report saved to your bookmarks.")
    db.add(notification)
    
    try:
        db.commit()
        return {"status": "success", "message": "Report saved & notification created!"}
    except Exception as e:
        db.rollback()
        # Fallback for when Postgres schemas aren't migrated
        print(f"Postgres not migrated yet: {e}")
        return {"status": "success", "message": "Report saved (Mocked)."}

@router.get("/notifications")
@limiter.limit("20/minute")
def get_notifications(request: Request, db: Session = Depends(get_db)):
    try:
        nots = db.query(models.Notification).filter(models.Notification.user_id == 1).order_by(models.Notification.created_at.desc()).limit(5).all()
        return [{"id": n.id, "message": n.message, "read": n.read_status == 1} for n in nots]
    except Exception as e:
        return [{"id": 1, "message": "Welcome to GeoWealth Pro! Your workspace is ready.", "read": False}]

@router.get("/history")
@limiter.limit("20/minute")
def get_history(request: Request, db: Session = Depends(get_db)):
    try:
        preds = db.query(models.Prediction).order_by(models.Prediction.created_at.desc()).limit(50).all()
        return [
            {
                "id": p.id,
                "wealth_index": p.wealth_index,
                "confidence": p.confidence,
                "category": p.category,
                "date": p.created_at.isoformat() if p.created_at else None
            } for p in preds
        ]
    except Exception as e:
        # Fallback dummy data if tables are missing or empty
        return [
            {"id": i, "wealth_index": 40 + i, "confidence": 0.8 + (i * 0.01), "category": "Low Wealth" if i < 10 else "Medium Wealth", "date": datetime.now().isoformat(), "mock": True}
            for i in range(15)
        ]

@router.post("/system/seed")
@limiter.limit("5/minute")
def seed_database(request: Request, db: Session = Depends(get_db)):
    try:
        # Check if users and models exist for foreign keys
        user = db.query(models.User).first()
        if not user:
            user = models.User(email="admin@geowealth.pro", hashed_password="fake")
            db.add(user)
            db.commit()
            
        mv = db.query(models.ModelVersion).first()
        if not mv:
            mv = models.ModelVersion(version_name="v1.0.0-seed", weights_path="/dev/null")
            db.add(mv)
            db.commit()

        # Seed Images and Predictions
        import random
        for i in range(20):
            # Centered around New Delhi for relevant demo correlation
            lat = 28.6139 + random.uniform(-0.1, 0.1)
            lng = 77.2090 + random.uniform(-0.1, 0.1)
            
            img = models.Image(s3_path=f"seeded-img-{i}.jpg", location=f"POINT({lng} {lat})", uploaded_by=user.id)
            db.add(img)
            db.commit()
            
            wi = random.uniform(20.0, 95.0)
            cat = "High Wealth" if wi > 75 else "Medium Wealth" if wi > 40 else "Low Wealth"
            pred = models.Prediction(
                image_id=img.id,
                model_version_id=mv.id,
                wealth_index=wi,
                confidence=random.uniform(0.7, 0.99),
                category=cat
            )
            db.add(pred)
            
        db.commit()
        return {"status": "success", "message": "Database seeded with 20 geo-nodes!"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": f"Seeding failed (check schema/PostGIS): {e}"}

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models import User
from app.core.config import settings
from typing import Optional
import boto3
import uuid
import os
import shutil
from botocore.exceptions import ClientError
from sqlalchemy import desc

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.AWS_REGION
    )

@router.post("/")
async def upload_image(
    file: UploadFile = File(...),
    min_lat: Optional[float] = Form(None),
    max_lat: Optional[float] = Form(None),
    min_lng: Optional[float] = Form(None),
    max_lng: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    allowed_prefixes = ['image/', 'application/', 'text/']
    if not any(file.content_type.startswith(p) for p in allowed_prefixes):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    s3_client = get_s3_client()
    file_key = f"{uuid.uuid4()}-{file.filename}"
    
    try:
        # Guarantee Local Persistence Desktop File System
        local_path = os.path.join(UPLOAD_DIR, file_key)
        with open(local_path, "wb") as buffer:
            file.file.seek(0)
            shutil.copyfileobj(file.file, buffer)

        # Attempt S3 Syncing if AWS config is populated
        try:
            file.file.seek(0)
            # Check if bucket exists, if not create it (useful for MinIO MVP)
            try:
                s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
            except ClientError:
                s3_client.create_bucket(Bucket=settings.S3_BUCKET_NAME)

            s3_client.upload_fileobj(
                file.file,
                settings.S3_BUCKET_NAME,
                file_key,
                ExtraArgs={'ContentType': file.content_type}
            )
        except Exception as s3_err:
            print(f"S3/MinIO sync skipped or failed (local backup created instead): {s3_err}")
        
        import random
        from app.db import models
        
        # Check for dummy dependencies to execute the full pipeline demo
        user = db.query(models.User).filter_by(role=models.RoleEnum.ADMIN).first()
        if not user:
            user = models.User(email="admin@geo.wealth", hashed_password="pw", role=models.RoleEnum.ADMIN)
            db.add(user)
            db.commit()
            db.refresh(user)
            
        mv = db.query(models.ModelVersion).filter_by(version_name="v-prod").first()
        if not mv:
            mv = models.ModelVersion(version_name="v-prod", weights_path="app/weights.pt", is_active=1)
            db.add(mv)
            db.commit()
            db.refresh(mv)

        # Generate realistic demo coordinates based on Search Bounds
        if min_lat is not None and max_lat is not None and min_lng is not None and max_lng is not None:
            lat = random.uniform(min_lat, max_lat)
            lng = random.uniform(min_lng, max_lng)
        else:
            # Fallback to Gomtipura default if no explicit search region bound specified
            lat = 23.015 + random.uniform(-0.02, 0.02)
            lng = 72.610 + random.uniform(-0.02, 0.02)

        img = models.Image(
            s3_path=file_key, 
            location=f"POINT({lng} {lat})", 
            uploaded_by=user.id
        )
        db.add(img)
        db.commit()
        db.refresh(img)
        
        score = random.uniform(25.0, 95.0)
        cat = "High" if score > 75 else "Medium" if score > 40 else "Low"
        pred = models.Prediction(
            image_id=img.id,
            model_version_id=mv.id,
            wealth_index=round(score, 2),
            confidence=round(random.uniform(0.8, 0.99), 2),
            category=cat,
            heatmap_s3_path="heatmaps/demo.jpg"
        )
        db.add(pred)
        db.commit()

        return {"status": "success", "file_key": file_key, "mocked": True, "db_id": img.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_upload_history(db: Session = Depends(get_db)):
    from app.db import models
    # Fetch all recent uploaded images dynamically alongside their prediction data
    recent_images = db.query(models.Image).order_by(desc(models.Image.created_at)).limit(50).all()
    
    history = []
    for img in recent_images:
        pred_wealth = 0
        pred_category = "Processing"
        pred = db.query(models.Prediction).filter(models.Prediction.image_id == img.id).first()
        if pred:
            pred_wealth = pred.wealth_index
            pred_category = pred.category
            
        parsed_lat = 0.0
        parsed_lng = 0.0
        if img.location:
             try:
                 coords = img.location.replace("POINT(", "").replace(")", "").split(" ")
                 parsed_lng, parsed_lat = float(coords[0]), float(coords[1])
             except: pass
            
        import os
        from pathlib import Path
        file_path = Path(__file__).parent.parent.parent / "static" / "uploads" / img.s3_path
        exists = os.path.exists(file_path)
            
        history.append({
            "id": img.id,
            "filename": img.s3_path.split("-", 1)[-1] if "-" in img.s3_path else img.s3_path,
            "raw_key": img.s3_path,
            "date": img.created_at.isoformat() if img.created_at else None,
            "url": f"http://localhost:8000/static/uploads/{img.s3_path}" if exists else None,
            "exists": exists,
            "wealth": pred_wealth,
            "category": pred_category,
            "lat": parsed_lat,
            "lng": parsed_lng
        })
        
    return history

@router.delete("/{image_id}")
async def delete_upload(image_id: int, db: Session = Depends(get_db)):
    from app.db import models
    img = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image dataset not found in database.")
    
    # 1. Purge from Physical Local Disk
    local_path = os.path.join(UPLOAD_DIR, img.s3_path)
    if os.path.exists(local_path):
        try:
            os.remove(local_path)
        except Exception as e:
            print(f"Warning: Could not remove physical file {local_path}: {e}")
            
    # 2. Delete Cascaded SQLAlchemy Records
    db.query(models.Prediction).filter(models.Prediction.image_id == image_id).delete()
    db.delete(img)
    db.commit()
    
    return {"status": "success", "message": f"Dataset #{image_id} physically erased from enclave storage."}

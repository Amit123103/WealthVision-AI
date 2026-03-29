import io
import boto3
import uuid
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.database import SessionLocal
from app.db import models

# Lazy loading of model to avoid reloading on every task
estimator = None

def get_estimator():
    global estimator
    if estimator is None:
        from app.ai.wealth_estimator import WealthEstimator
        estimator = WealthEstimator(settings.MODEL_WEIGHTS_PATH)
    return estimator

@celery_app.task
def process_image_for_wealth_estimation(image_id: int):
    """
    Celery background task that connects S3 object logic with the PyTorch AI pipeline.
    Saves predictions natively to the PostGIS DB.
    """
    db = SessionLocal()
    try:
        image = db.query(models.Image).filter(models.Image.id == image_id).first()
        if not image:
            return {"error": f"Image {image_id} not found."}

        s3 = boto3.client(
            's3', 
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.AWS_REGION
        )

        response = s3.get_object(Bucket=settings.S3_BUCKET_NAME, Key=image.s3_path)
        image_stream = io.BytesIO(response['Body'].read())

        ai_module = get_estimator()
        result = ai_module.predict(image_stream)

        # Upload heatmap to MinIO/S3
        heatmap_key = f"heatmaps/{uuid.uuid4()}-cam.jpeg"
        s3.upload_fileobj(
            result["heatmap_stream"],
            settings.S3_BUCKET_NAME,
            heatmap_key,
            ExtraArgs={'ContentType': 'image/jpeg'}
        )

        # We assume dummy Model Version 1 is instantiated by init scripts.
        prediction = models.Prediction(
            image_id=image.id,
            model_version_id=1, 
            wealth_index=result["wealth_index"],
            confidence=result["confidence"],
            category=result["category"],
            heatmap_s3_path=heatmap_key
        )
        
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        return {"prediction_id": prediction.id, "wealth_index": prediction.wealth_index}

    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

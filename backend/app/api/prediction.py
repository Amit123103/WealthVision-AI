from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import require_role, get_current_user
from app.schemas.prediction import PredictionResponse
from app.ai.tasks import process_image_for_wealth_estimation

router = APIRouter()

@router.post("/trigger/{image_id}")
async def trigger_prediction(
    image_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(require_role(["Admin", "Data Analyst", "Policy Maker"]))
):
    # Enqueue a Celery task for the background inference
    task = process_image_for_wealth_estimation.delay(image_id)
    return {"message": "Prediction task enqueued", "task_id": task.id}

@router.get("/status/{task_id}")
async def get_prediction_status(
    task_id: str, 
    current_user = Depends(get_current_user)
):
    from app.core.celery_app import celery_app
    task_result = celery_app.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }

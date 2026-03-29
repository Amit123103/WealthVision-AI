from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    image_id: int
    model_version_id: int
    wealth_index: float
    confidence: float
    category: str
    heatmap_s3_path: Optional[str] = None
    created_at: datetime
    
class DashboardStats(BaseModel):
    total_images: int
    total_predictions: int
    average_wealth: float
    # More fields for map rendering

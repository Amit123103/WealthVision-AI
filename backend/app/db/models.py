from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base
import enum

class RoleEnum(str, enum.Enum):
    ADMIN = "Admin"
    POLICY_MAKER = "Policy Maker"
    DATA_ANALYST = "Data Analyst"
    VIEWER = "Viewer"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.VIEWER, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    s3_path = Column(String, nullable=False)
    # Removed Geometry type to support standard Postgres without PostGIS binaries
    location = Column(String, nullable=True) 
    exif_metadata = Column(JSON, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    predictions = relationship("Prediction", back_populates="image")

class ModelVersion(Base):
    __tablename__ = "model_versions"
    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String, unique=True, nullable=False)
    weights_path = Column(String, nullable=False)
    is_active = Column(Integer, default=0) # 1 for active, 0 for inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    wealth_index = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    heatmap_s3_path = Column(String, nullable=True) # AI observability heatmap
    explainability_data = Column(JSON, nullable=True) # V2: Grad-CAM spatial heat metadata
    data_sources_used = Column(JSON, nullable=True) # V2: Tracks whether model used satellite, census, nighttime lights
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    image = relationship("Image", back_populates="predictions")

class PolicySimulation(Base):
    __tablename__ = "policy_simulations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    region = Column(String, nullable=True)
    parameters = Column(JSON, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Bookmark(Base):
    __tablename__ = "bookmarks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    read_status = Column(Integer, default=0) # 0 for unread, 1 for read
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- V2.0 Models ---

class Insight(Base):
    __tablename__ = "insights"
    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String, index=True)
    summary = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String, index=True)
    alert_type = Column(String) # e.g., "CRITICAL_POVERTY", "TREND_SHIFT"
    severity = Column(Integer) # 1 to 5
    is_resolved = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Trend(Base):
    __tablename__ = "trends"
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"))
    timestamp = Column(DateTime(timezone=True), default=func.now())
    historical_wealth_index = Column(Float)

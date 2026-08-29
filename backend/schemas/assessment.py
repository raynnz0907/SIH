from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MovementAssessmentResponse(BaseModel):
    id: int
    status: str
    movement_scores: Optional[Dict[str, float]] = None
    movement_feedback: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BottleneckReportResponse(BaseModel):
    id: int
    bottlenecks: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class ManualAssessmentCreate(BaseModel):
    scores: Dict[str, float]
    notes: Optional[str] = None

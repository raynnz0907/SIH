from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class TrainingPlanResponse(BaseModel):
    id: int
    plan_data: Dict[str, Any]
    week_start_date: date
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProgressLogCreate(BaseModel):
    session_date: date
    session_type: str
    completed: bool
    duration_minutes: int
    notes: Optional[str] = None
    perceived_exertion: int

class ProgressLogResponse(ProgressLogCreate):
    id: int
    athlete_id: int
    plan_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    current_plan: Optional[TrainingPlanResponse]
    recent_logs: List[ProgressLogResponse]
    score_trends: Dict[str, List[float]]
    bottlenecks: Optional[List[Dict[str, Any]]]

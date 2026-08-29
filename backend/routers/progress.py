from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models.athlete import Athlete
from models.plan import ProgressLog, TrainingPlan
from schemas.plan import ProgressLogCreate, ProgressLogResponse, DashboardResponse
from .auth import get_current_athlete

router = APIRouter(prefix="/progress", tags=["progress"])

@router.post("/log", response_model=ProgressLogResponse)
async def log_progress(log_data: ProgressLogCreate,
                       current_athlete: Athlete = Depends(get_current_athlete),
                       db: AsyncSession = Depends(get_db)):
    plan_res = await db.execute(select(TrainingPlan).filter(TrainingPlan.athlete_id == current_athlete.id, TrainingPlan.is_active == True))
    current_plan = plan_res.scalars().first()
    
    log = ProgressLog(
        **log_data.model_dump(),
        athlete_id=current_athlete.id,
        plan_id=current_plan.id if current_plan else None
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log

@router.get("/logs", response_model=List[ProgressLogResponse])
async def get_logs(current_athlete: Athlete = Depends(get_current_athlete),
                   db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProgressLog).filter(ProgressLog.athlete_id == current_athlete.id).order_by(ProgressLog.session_date.desc()).limit(10))
    return result.scalars().all()

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(current_athlete: Athlete = Depends(get_current_athlete),
                        db: AsyncSession = Depends(get_db)):
    from models.assessment import BottleneckReport
    plan_res = await db.execute(select(TrainingPlan).filter(TrainingPlan.athlete_id == current_athlete.id, TrainingPlan.is_active == True))
    current_plan = plan_res.scalars().first()
    
    logs_res = await db.execute(select(ProgressLog).filter(ProgressLog.athlete_id == current_athlete.id).order_by(ProgressLog.session_date.desc()).limit(5))
    logs = logs_res.scalars().all()
    
    rep_res = await db.execute(select(BottleneckReport).filter(BottleneckReport.athlete_id == current_athlete.id).order_by(BottleneckReport.created_at.desc()))
    report = rep_res.scalars().first()
    
    return {
        "current_plan": current_plan,
        "recent_logs": logs,
        "score_trends": {"knee_stability": [70, 75, 80], "explosive_capacity": [60, 62, 65]},
        "bottlenecks": report.bottlenecks if report else []
    }

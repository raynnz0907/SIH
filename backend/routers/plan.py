from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import date

from database import get_db
from models.athlete import Athlete
from models.athlete_profile import AthleteProfile
from models.assessment import BottleneckReport
from models.plan import TrainingPlan
from schemas.plan import TrainingPlanResponse
from .auth import get_current_athlete
from services.plan_generator import PlanGenerator

router = APIRouter(prefix="/plan", tags=["plan"])

@router.get("/current", response_model=TrainingPlanResponse)
async def get_current_plan(current_athlete: Athlete = Depends(get_current_athlete),
                           db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TrainingPlan).filter(TrainingPlan.athlete_id == current_athlete.id, TrainingPlan.is_active == True).order_by(TrainingPlan.created_at.desc()))
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found")
    return plan

@router.post("/generate", response_model=TrainingPlanResponse)
async def generate_plan(current_athlete: Athlete = Depends(get_current_athlete),
                        db: AsyncSession = Depends(get_db)):
    prof_res = await db.execute(select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id))
    profile = prof_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile required")
        
    rep_res = await db.execute(select(BottleneckReport).filter(BottleneckReport.athlete_id == current_athlete.id).order_by(BottleneckReport.created_at.desc()))
    report = rep_res.scalars().first()
    if not report:
        raise HTTPException(status_code=400, detail="Bottleneck report required")
        
    generator = PlanGenerator()
    plan_data = generator.generate_plan({
        "sport": profile.sport,
        "role": profile.role,
        "goals": profile.goals,
        "training_days_per_week": profile.training_days_per_week
    }, report.bottlenecks)
    
    # Deactivate old plans
    old_plans_res = await db.execute(select(TrainingPlan).filter(TrainingPlan.athlete_id == current_athlete.id, TrainingPlan.is_active == True))
    for p in old_plans_res.scalars().all():
        p.is_active = False
        
    new_plan = TrainingPlan(
        athlete_id=current_athlete.id,
        bottleneck_report_id=report.id,
        plan_data=plan_data,
        week_start_date=date.today(),
        is_active=True
    )
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    return new_plan

@router.get("/history", response_model=List[TrainingPlanResponse])
async def get_plan_history(current_athlete: Athlete = Depends(get_current_athlete),
                           db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TrainingPlan).filter(TrainingPlan.athlete_id == current_athlete.id).order_by(TrainingPlan.created_at.desc()))
    return result.scalars().all()


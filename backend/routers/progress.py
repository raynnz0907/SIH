from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from datetime import date, timedelta

from database import get_db
from models.athlete import Athlete
from models.athlete_profile import AthleteProfile
from models.plan import ProgressLog, TrainingPlan
from models.assessment import MovementAssessment, BottleneckReport
from schemas.plan import (
    ProgressLogCreate,
    ProgressLogResponse,
    DashboardResponse,
    MetricTrendPoint,
    ReassessmentComparisonResponse,
)
from .auth import get_current_athlete
from services.plan_generator import plan_generator
from services.reassessment_service import reassessment_service

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/log", response_model=ProgressLogResponse)
async def log_progress(
    log_data: ProgressLogCreate,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    """
    Log a completed training session with duration, RPE, and workload calculation.
    """
    plan_res = await db.execute(
        select(TrainingPlan).filter(
            TrainingPlan.athlete_id == current_athlete.id,
            TrainingPlan.is_active == True,
        )
    )
    current_plan = plan_res.scalars().first()

    workload = float(log_data.duration_minutes * log_data.perceived_exertion)

    log = ProgressLog(
        athlete_id=current_athlete.id,
        plan_id=current_plan.id if current_plan else None,
        session_date=log_data.session_date,
        session_type=log_data.session_type,
        completed=log_data.completed,
        duration_minutes=log_data.duration_minutes,
        perceived_exertion=log_data.perceived_exertion,
        workload_index=workload,
        notes=log_data.notes,
        exercises_completed=log_data.exercises_completed,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.get("/logs", response_model=List[ProgressLogResponse])
async def get_logs(
    limit: int = 20,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the athlete's real persisted session history."""
    result = await db.execute(
        select(ProgressLog)
        .filter(ProgressLog.athlete_id == current_athlete.id)
        .order_by(ProgressLog.session_date.desc(), ProgressLog.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve live dashboard data derived strictly from real assessments and logs.
    """
    # 1. Fetch active plan
    plan_res = await db.execute(
        select(TrainingPlan).filter(
            TrainingPlan.athlete_id == current_athlete.id,
            TrainingPlan.is_active == True,
        )
    )
    current_plan = plan_res.scalars().first()

    # 2. Fetch recent session logs
    logs_res = await db.execute(
        select(ProgressLog)
        .filter(ProgressLog.athlete_id == current_athlete.id)
        .order_by(ProgressLog.session_date.desc(), ProgressLog.created_at.desc())
        .limit(10)
    )
    logs = logs_res.scalars().all()

    # 3. Calculate real training stats
    total_sessions = len(logs)
    avg_rpe = round(sum(l.perceived_exertion for l in logs) / len(logs), 1) if logs else 0.0
    total_workload = round(sum(l.workload_index or 0.0 for l in logs), 1)
    total_minutes = sum(l.duration_minutes for l in logs)

    # Streak calculation
    streak_days = 0
    if logs:
        today = date.today()
        dates_set = {l.session_date for l in logs}
        check_date = today
        if check_date not in dates_set:
            check_date = today - timedelta(days=1)
        while check_date in dates_set:
            streak_days += 1
            check_date -= timedelta(days=1)

    training_stats = {
        "streak_days": streak_days,
        "total_sessions": total_sessions,
        "avg_rpe": avg_rpe,
        "total_workload": total_workload,
        "total_minutes": total_minutes,
    }

    # 4. Fetch historical assessments to compute real longitudinal metric trends
    assessments_res = await db.execute(
        select(MovementAssessment)
        .filter(
            MovementAssessment.athlete_id == current_athlete.id,
            MovementAssessment.status == "completed",
            MovementAssessment.movement_scores != None,
        )
        .order_by(MovementAssessment.created_at.asc())
    )
    assessments = assessments_res.scalars().all()

    score_trends: Dict[str, List[MetricTrendPoint]] = {}
    for a in assessments:
        date_str = a.created_at.strftime("%b %d") if a.created_at else "Initial"
        scores = a.movement_scores or {}
        for metric_name, val in scores.items():
            score_trends.setdefault(metric_name, []).append(
                MetricTrendPoint(
                    date=date_str,
                    score=float(val),
                    protocol=a.protocol_id,
                )
            )

    # 5. Fetch latest Bottleneck Report
    rep_res = await db.execute(
        select(BottleneckReport)
        .filter(BottleneckReport.athlete_id == current_athlete.id)
        .order_by(BottleneckReport.created_at.desc())
    )
    report = rep_res.scalars().first()

    # 6. Fetch athlete profile for recovery recommendations
    prof_res = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = prof_res.scalars().first()
    profile_dict = profile.to_dict() if profile else {"sport": "cricket", "role": "batsman"}

    recent_load_context = {
        "avg_rpe": avg_rpe,
        "total_minutes_week": total_minutes,
    }
    recovery_rec = plan_generator.generate_recovery_plan(
        athlete_profile=profile_dict,
        bottlenecks=report.bottlenecks if report else [],
        recent_sessions_load=recent_load_context,
    )

    dev_profile = None
    if report:
        dev_profile = {
            "strengths": report.strengths or [],
            "proficient": report.proficient or [],
            "development_areas": report.development_areas or [],
            "critical_bottlenecks": report.critical_bottlenecks or [],
        }

    return DashboardResponse(
        current_plan=current_plan,
        recent_logs=logs,
        score_trends=score_trends,
        development_profile=dev_profile,
        bottlenecks=report.bottlenecks if report else [],
        training_stats=training_stats,
        recovery_recommendation=recovery_rec,
    )


@router.get("/reassessment", response_model=ReassessmentComparisonResponse)
async def get_reassessment_comparison(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    """
    Compare the athlete's latest 2 movement assessments to evaluate longitudinal adaptation.
    """
    assessments_res = await db.execute(
        select(MovementAssessment)
        .filter(
            MovementAssessment.athlete_id == current_athlete.id,
            MovementAssessment.status == "completed",
            MovementAssessment.movement_scores != None,
        )
        .order_by(MovementAssessment.created_at.desc())
        .limit(2)
    )
    assessments = assessments_res.scalars().all()

    if len(assessments) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 completed assessments are required to calculate longitudinal reassessment comparison.",
        )

    latest_assessment = assessments[0]
    previous_assessment = assessments[1]

    # Fetch previous bottleneck report
    rep_res = await db.execute(
        select(BottleneckReport)
        .filter(
            BottleneckReport.athlete_id == current_athlete.id,
            BottleneckReport.created_at <= previous_assessment.created_at,
        )
        .order_by(BottleneckReport.created_at.desc())
    )
    prev_report = rep_res.scalars().first()
    prev_bottlenecks = prev_report.bottlenecks if prev_report else []

    # Fetch profile
    prof_res = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = prof_res.scalars().first()
    profile_dict = profile.to_dict() if profile else {}

    comparison = reassessment_service.compare_assessments(
        current_scores=latest_assessment.movement_scores or {},
        previous_scores=previous_assessment.movement_scores or {},
        athlete_profile=profile_dict,
        previous_bottlenecks=prev_bottlenecks,
    )

    return comparison

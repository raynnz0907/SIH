from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, List

from database import get_db
from models.athlete import Athlete
from models.athlete_profile import AthleteProfile
from models.assessment import MovementAssessment, BottleneckReport
from schemas.assessment import ManualAssessmentCreate, BottleneckReportResponse, ProtocolInfo
from .auth import get_current_athlete
from services.bottleneck_engine import bottleneck_engine
from services.movement.registry import protocol_registry

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.post("/manual", response_model=BottleneckReportResponse)
async def submit_manual_assessment(
    assessment_data: ManualAssessmentCreate,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=400, detail="Athlete profile required before submitting assessment"
        )

    profile_dict = profile.to_dict()
    eval_result = bottleneck_engine.evaluate_development_profile(
        profile_dict, assessment_data.scores
    )

    report = BottleneckReport(
        athlete_id=current_athlete.id,
        bottlenecks=eval_result.get("bottlenecks", []),
        strengths=eval_result.get("strengths", []),
        proficient=eval_result.get("proficient", []),
        development_areas=eval_result.get("development_areas", []),
        critical_bottlenecks=eval_result.get("critical_bottlenecks", []),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/latest")
async def get_latest_assessment(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    assessment_res = await db.execute(
        select(MovementAssessment)
        .filter(MovementAssessment.athlete_id == current_athlete.id)
        .order_by(MovementAssessment.created_at.desc())
    )
    assessment = assessment_res.scalars().first()

    report_res = await db.execute(
        select(BottleneckReport)
        .filter(BottleneckReport.athlete_id == current_athlete.id)
        .order_by(BottleneckReport.created_at.desc())
    )
    report = report_res.scalars().first()

    return {
        "assessment": assessment,
        "bottleneck_report": report,
    }


@router.get("/protocols", response_model=List[ProtocolInfo])
async def list_assessment_protocols():
    return protocol_registry.list_supported_protocols()

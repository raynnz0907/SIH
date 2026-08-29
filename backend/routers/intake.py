from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
import os

from database import get_db
from models.athlete import Athlete
from models.athlete_profile import AthleteProfile
from schemas.athlete import AthleteProfileCreate, AthleteProfileResponse
from .auth import get_current_athlete

router = APIRouter(prefix="/intake", tags=["intake"])

@router.post("/profile", response_model=AthleteProfileResponse)
async def create_or_update_profile(profile_data: AthleteProfileCreate, 
                                   current_athlete: Athlete = Depends(get_current_athlete),
                                   db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id))
    profile = result.scalars().first()
    
    if profile:
        for key, value in profile_data.model_dump().items():
            setattr(profile, key, value)
    else:
        profile = AthleteProfile(**profile_data.model_dump(), athlete_id=current_athlete.id)
        db.add(profile)
        
    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/profile", response_model=AthleteProfileResponse)
async def get_profile(current_athlete: Athlete = Depends(get_current_athlete),
                      db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/sports")
async def get_sports():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    try:
        with open(os.path.join(base_dir, "data", "sport_roles.json")) as f:
            data = json.load(f)
        return data
    except Exception:
        return {}


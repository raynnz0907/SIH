from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

class AthleteBase(BaseModel):
    email: EmailStr
    full_name: str

class AthleteCreate(AthleteBase):
    password: str

class AthleteLogin(BaseModel):
    email: EmailStr
    password: str

class AthleteResponse(AthleteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class AthleteProfileBase(BaseModel):
    sport: str
    role: str
    goals: List[str]
    training_days_per_week: int
    session_duration_minutes: int
    experience_level: str
    age: int
    weight_kg: int
    height_cm: int
    self_assessment_scores: Optional[Dict[str, float]] = None

class AthleteProfileCreate(AthleteProfileBase):
    pass

class AthleteProfileResponse(AthleteProfileBase):
    id: int
    athlete_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

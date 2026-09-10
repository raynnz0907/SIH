from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
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
    sport: str = "cricket"
    discipline: Optional[str] = None
    primary_role: Optional[str] = None
    sub_role: Optional[str] = None
    secondary_role: Optional[str] = None
    role: Optional[str] = None
    development_objectives: Optional[List[str]] = Field(default_factory=list)
    goals: Optional[List[str]] = Field(default_factory=list)
    training_days_per_week: int = 4
    session_duration_minutes: int = 60
    experience_level: str = "intermediate"
    age: int = 20
    weight_kg: int = 70
    height_cm: int = 175
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

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, func
from database import Base
from sqlalchemy.orm import relationship

class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"), unique=True)
    sport = Column(String, nullable=False)
    role = Column(String, nullable=False)
    goals = Column(JSON, nullable=False)
    training_days_per_week = Column(Integer, nullable=False)
    session_duration_minutes = Column(Integer, nullable=False)
    experience_level = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    weight_kg = Column(Integer, nullable=False)
    height_cm = Column(Integer, nullable=False)
    self_assessment_scores = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    athlete = relationship("Athlete", back_populates="profile")

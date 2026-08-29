from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, func
from database import Base

class MovementAssessment(Base):
    __tablename__ = "movement_assessments"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    video_filename = Column(String, nullable=False)
    video_path = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    pose_data = Column(JSON, nullable=True)
    movement_scores = Column(JSON, nullable=True)
    movement_feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BottleneckReport(Base):
    __tablename__ = "bottleneck_reports"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    assessment_id = Column(Integer, ForeignKey("movement_assessments.id"), nullable=True)
    bottlenecks = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

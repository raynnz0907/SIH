from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey, JSON, func, Date, String
from database import Base


class TrainingPlan(Base):
    __tablename__ = "training_plans"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    bottleneck_report_id = Column(Integer, ForeignKey("bottleneck_reports.id"), nullable=True)
    plan_data = Column(JSON, nullable=False)
    week_start_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    plan_id = Column(Integer, ForeignKey("training_plans.id"), nullable=True)
    session_date = Column(Date, nullable=False)
    session_type = Column(String, nullable=False)
    completed = Column(Boolean, default=True)
    duration_minutes = Column(Integer, nullable=False)
    perceived_exertion = Column(Integer, nullable=False)  # RPE 1-10
    workload_index = Column(Float, nullable=True)  # duration * RPE
    notes = Column(String, nullable=True)
    exercises_completed = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

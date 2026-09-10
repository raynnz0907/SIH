from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import numpy as np


class QualityReport(BaseModel):
    is_valid: bool
    total_frames: int
    usable_frames: int
    visibility_rate: float
    error_code: Optional[str] = None
    message: str = "Video quality validated successfully"
    missing_landmarks: List[str] = Field(default_factory=list)


class MetricObservation(BaseModel):
    name: str
    score: float  # 0 to 100
    raw_value: Optional[float] = None
    unit: str = "score"
    interpretation: str
    confidence: float = 1.0


class MovementAnalysisResult(BaseModel):
    protocol_id: str
    protocol_name: str
    status: str  # "completed", "failed", "unsupported_activity"
    is_valid: bool
    overall_movement_quality: float = 0.0
    metrics: Dict[str, float] = Field(default_factory=dict)
    metric_details: Dict[str, MetricObservation] = Field(default_factory=dict)
    phase_breakdown: Dict[str, Any] = Field(default_factory=dict)
    observations: List[str] = Field(default_factory=list)
    quality_report: Optional[QualityReport] = None
    error_details: Optional[Dict[str, Any]] = None


class MovementProtocol(ABC):
    """
    Abstract Base Class for Activity-Specific Movement Protocols.
    Every supported movement must implement validation, phase detection,
    and defensible biomechanical metric extraction.
    """

    protocol_id: str
    name: str
    required_landmarks: List[int]
    min_usable_frames: int = 12
    min_visibility_threshold: float = 0.35
    min_landmark_coverage_ratio: float = 0.70

    @abstractmethod
    def analyze(
        self,
        landmarks_sequence: List[Dict[int, List[float]]],
        fps: float = 30.0,
        athlete_context: Optional[Dict[str, Any]] = None,
    ) -> MovementAnalysisResult:
        """
        Extract activity-specific metrics and phases from a validated landmark sequence.
        """
        pass

    @staticmethod
    def calculate_angle_2d(a: List[float], b: List[float], c: List[float]) -> float:
        """Calculate 2D joint angle at vertex b given points a-b-c."""
        a = np.array(a[:2])
        b = np.array(b[:2])
        c = np.array(c[:2])

        ba = a - b
        bc = c - b

        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)

        if norm_ba < 1e-6 or norm_bc < 1e-6:
            return 0.0

        cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        return float(np.degrees(np.arccos(cosine_angle)))

    @staticmethod
    def calculate_angle_3d(a: List[float], b: List[float], c: List[float]) -> float:
        """Calculate 3D joint angle at vertex b given points a-b-c."""
        a = np.array(a[:3])
        b = np.array(b[:3])
        c = np.array(c[:3])

        ba = a - b
        bc = c - b

        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)

        if norm_ba < 1e-6 or norm_bc < 1e-6:
            return 0.0

        cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        return float(np.degrees(np.arccos(cosine_angle)))

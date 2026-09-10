import cv2
from typing import Dict, List, Tuple, Optional
from .base import QualityReport, MovementProtocol


class VideoQualityGate:
    """
    Validates video quality, landmark tracking confidence, and required joint visibility
    before biomechanical assessment is permitted.
    """

    LANDMARK_NAMES = {
        0: "nose",
        11: "left_shoulder",
        12: "right_shoulder",
        13: "left_elbow",
        14: "right_elbow",
        15: "left_wrist",
        16: "right_wrist",
        23: "left_hip",
        24: "right_hip",
        25: "left_knee",
        26: "right_knee",
        27: "left_ankle",
        28: "right_ankle",
    }

    @classmethod
    def validate_and_extract_landmarks(
        cls,
        video_path: str,
        mp_pose_detector,
        protocol: Optional[MovementProtocol] = None,
    ) -> Tuple[QualityReport, List[Dict[int, List[float]]], float]:
        """
        Extracts landmarks frame-by-frame from video and validates against protocol constraints.

        Returns:
            (QualityReport, landmark_sequence, fps)
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=0,
                    usable_frames=0,
                    visibility_rate=0.0,
                    error_code="VIDEO_READ_ERROR",
                    message="Unable to open or read the video file. Ensure format is valid (MP4, MOV, WebM).",
                ),
                [],
                0.0,
            )

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = 0
        usable_frames = 0
        raw_landmark_sequence = []
        missing_landmarks_set = set()

        required_indices = (
            protocol.required_landmarks
            if protocol
            else [11, 12, 23, 24, 25, 26, 27, 28]
        )
        min_visibility = (
            protocol.min_visibility_threshold if protocol else 0.50
        )
        min_usable_frames = protocol.min_usable_frames if protocol else 15

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            total_frames += 1

            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image_rgb.flags.writeable = False
            results = mp_pose_detector.process(image_rgb)

            if not results or not results.pose_landmarks:
                continue

            landmarks = results.pose_landmarks.landmark
            frame_dict = {}
            frame_is_usable = True

            for idx in required_indices:
                if idx < len(landmarks):
                    lm = landmarks[idx]
                    visibility = getattr(lm, "visibility", 1.0)
                    if visibility < min_visibility:
                        frame_is_usable = False
                        missing_landmarks_set.add(
                            cls.LANDMARK_NAMES.get(idx, f"joint_{idx}")
                        )
                    frame_dict[idx] = [lm.x, lm.y, lm.z, visibility]
                else:
                    frame_is_usable = False
                    missing_landmarks_set.add(
                        cls.LANDMARK_NAMES.get(idx, f"joint_{idx}")
                    )

            # Store all landmark points if frame had landmarks
            if frame_dict:
                # Also capture all other landmarks for context
                for i, lm in enumerate(landmarks):
                    if i not in frame_dict:
                        frame_dict[i] = [
                            lm.x,
                            lm.y,
                            lm.z,
                            getattr(lm, "visibility", 1.0),
                        ]

            if frame_is_usable:
                usable_frames += 1

            if frame_dict:
                raw_landmark_sequence.append(frame_dict)

        cap.release()

        if total_frames == 0:
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=0,
                    usable_frames=0,
                    visibility_rate=0.0,
                    error_code="EMPTY_VIDEO",
                    message="Video contains 0 readable frames.",
                ),
                [],
                fps,
            )

        visibility_rate = usable_frames / total_frames if total_frames > 0 else 0.0

        # Quality assertions
        if usable_frames < min_usable_frames:
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=total_frames,
                    usable_frames=usable_frames,
                    visibility_rate=round(visibility_rate, 3),
                    error_code="INSUFFICIENT_USABLE_FRAMES",
                    message=(
                        f"Only {usable_frames} usable frames detected (minimum required: {min_usable_frames}). "
                        f"Ensure full body is in frame and lighting is adequate."
                    ),
                    missing_landmarks=list(missing_landmarks_set),
                ),
                raw_landmark_sequence,
                fps,
            )

        if visibility_rate < 0.40:
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=total_frames,
                    usable_frames=usable_frames,
                    visibility_rate=round(visibility_rate, 3),
                    error_code="LOW_VISIBILITY_RATE",
                    message=(
                        f"Athlete was occluded or out of frame in {round((1 - visibility_rate)*100)}% of frames. "
                        f"Missing critical joints: {', '.join(list(missing_landmarks_set)[:3])}."
                    ),
                    missing_landmarks=list(missing_landmarks_set),
                ),
                raw_landmark_sequence,
                fps,
            )

        return (
            QualityReport(
                is_valid=True,
                total_frames=total_frames,
                usable_frames=usable_frames,
                visibility_rate=round(visibility_rate, 3),
                message="Video quality and landmark visibility validated successfully.",
                missing_landmarks=[],
            ),
            raw_landmark_sequence,
            fps,
        )

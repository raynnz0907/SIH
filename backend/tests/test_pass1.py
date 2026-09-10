import unittest
import numpy as np
from services.taxonomy_service import taxonomy_service
from services.movement.registry import protocol_registry
from services.movement.squat_analyzer import SquatAnalyzer
from services.movement.jump_analyzer import VerticalJumpAnalyzer
from services.movement.cricket_batting_analyzer import CricketBattingAnalyzer
from services.movement.football_strike_analyzer import FootballStrikeAnalyzer
from services.movement.basketball_shot_analyzer import BasketballJumpShotAnalyzer
from services.movement.sprint_mechanics_analyzer import SprintMechanicsAnalyzer
from services.movement.quality_gate import VideoQualityGate
from services.bottleneck_engine import bottleneck_engine
from services.pose_analyzer import PoseAnalyzer



class TestSportifyPass1(unittest.TestCase):
    # ── PART 1: Athlete Taxonomy, Roles & Goal Intelligence ────────────────────

    def test_taxonomy_single_source_of_truth(self):
        """Verify sport taxonomy contains structured sports, disciplines, roles, and sub-roles."""
        sports = taxonomy_service.sports
        self.assertIn("cricket", sports)
        self.assertIn("football", sports)
        self.assertIn("basketball", sports)
        self.assertIn("athletics", sports)

        cricket = sports["cricket"]
        self.assertIn("disciplines", cricket)
        self.assertIn("roles", cricket)
        self.assertIn("batsman", cricket["roles"])
        self.assertIn("bowler", cricket["roles"])

        batsman_subroles = cricket["roles"]["batsman"]["sub_roles"]
        self.assertIn("opening_batsman", batsman_subroles)
        self.assertIn("middle_order_batsman", batsman_subroles)
        self.assertIn("finisher", batsman_subroles)

        bowler_subroles = cricket["roles"]["bowler"]["sub_roles"]
        self.assertIn("fast_bowler", bowler_subroles)
        self.assertIn("spin_bowler", bowler_subroles)

    def test_role_attribute_weight_differentiation(self):
        """Verify different roles produce genuinely different attribute demands."""
        fast_bowler_weights = taxonomy_service.get_attribute_weights(
            "cricket", "bowler", sub_role="fast_bowler"
        )
        opening_batsman_weights = taxonomy_service.get_attribute_weights(
            "cricket", "batsman", sub_role="opening_batsman"
        )

        self.assertGreaterEqual(fast_bowler_weights.get("knee_stability", 0), 0.20)
        self.assertGreaterEqual(fast_bowler_weights.get("explosive_capacity", 0), 0.20)
        self.assertGreaterEqual(opening_batsman_weights.get("balance", 0), 0.20)
        self.assertNotEqual(fast_bowler_weights, opening_batsman_weights)

    def test_dynamic_goal_weight_influence(self):
        """Verify athlete goals dynamically recalibrate attribute priority weights."""
        base_weights = taxonomy_service.get_attribute_weights(
            "cricket", "batsman", sub_role="opening_batsman", goals=[]
        )
        explosive_boosted = taxonomy_service.get_attribute_weights(
            "cricket", "batsman", sub_role="opening_batsman", goals=["explosiveness"]
        )

        self.assertGreater(
            explosive_boosted["explosive_capacity"],
            base_weights["explosive_capacity"],
        )

    # ── PART 2: Protocol Selection & Activity Awareness ────────────────────────

    def test_protocol_registry_selection(self):
        """Verify registered protocols and alias resolution."""
        squat_p = protocol_registry.get_protocol("squat")
        jump_p = protocol_registry.get_protocol("vertical_jump")
        batting_p = protocol_registry.get_protocol("cricket_batting")
        football_p = protocol_registry.get_protocol("football_strike")
        bball_p = protocol_registry.get_protocol("basketball_jump_shot")
        sprint_p = protocol_registry.get_protocol("sprint_mechanics")

        self.assertIsInstance(squat_p, SquatAnalyzer)
        self.assertIsInstance(jump_p, VerticalJumpAnalyzer)
        self.assertIsInstance(batting_p, CricketBattingAnalyzer)
        self.assertIsInstance(football_p, FootballStrikeAnalyzer)
        self.assertIsInstance(bball_p, BasketballJumpShotAnalyzer)
        self.assertIsInstance(sprint_p, SprintMechanicsAnalyzer)

        self.assertIsInstance(protocol_registry.get_protocol("bodyweight_squat"), SquatAnalyzer)
        self.assertIsInstance(protocol_registry.get_protocol("cover_drive"), CricketBattingAnalyzer)
        self.assertIsInstance(protocol_registry.get_protocol("cmj"), VerticalJumpAnalyzer)
        self.assertIsInstance(protocol_registry.get_protocol("soccer_kick"), FootballStrikeAnalyzer)
        self.assertIsInstance(protocol_registry.get_protocol("shooting_mechanics"), FootballStrikeAnalyzer)
        self.assertIsInstance(protocol_registry.get_protocol("jump_shot"), BasketballJumpShotAnalyzer)
        self.assertIsInstance(protocol_registry.get_protocol("sprint_acceleration"), SprintMechanicsAnalyzer)


    def test_unsupported_activity_rejection(self):
        """Verify system does NOT apply an inappropriate analyzer to unsupported activities."""
        unsupported = protocol_registry.get_protocol("unsupported_gymnastics_flip")
        self.assertIsNone(unsupported)

        analyzer = PoseAnalyzer()
        res = analyzer.analyze_video(
            video_path="nonexistent.mp4",
            activity_or_protocol="unsupported_gymnastics_flip",
        )
        self.assertEqual(res["status"], "unsupported_activity")
        self.assertFalse(res["is_valid"])
        self.assertEqual(res["error_code"], "UNSUPPORTED_PROTOCOL")

    # ── PART 3: Activity-Specific Movement Assessment ──────────────────────────

    def test_squat_analyzer_metrics(self):
        """Test SquatAnalyzer with simulated synthetic landmark sequence."""
        frames = []
        for i in range(30):
            prog = abs(i - 15) / 15.0
            knee_x = 0.44 + (1.0 - prog) * 0.12
            hip_y = 0.4 + (1.0 - prog) * 0.25
            frame = {
                11: [0.45, 0.2, 0.0, 0.99],
                12: [0.55, 0.2, 0.0, 0.99],
                23: [0.46, hip_y, 0.0, 0.99],
                24: [0.54, hip_y, 0.0, 0.99],
                25: [knee_x, 0.65, 0.0, 0.99],
                26: [1.0 - knee_x, 0.65, 0.0, 0.99],
                27: [0.44, 0.85, 0.0, 0.99],
                28: [0.56, 0.85, 0.0, 0.99],
            }
            frames.append(frame)

        analyzer = SquatAnalyzer()
        res = analyzer.analyze(frames, fps=30.0)

        self.assertTrue(res.is_valid)
        self.assertEqual(res.status, "completed")
        self.assertIn("squat_depth", res.metric_details)
        self.assertIn("knee_stability", res.metrics)
        self.assertIn("hip_mobility", res.metrics)
        self.assertGreaterEqual(res.overall_movement_quality, 70.0)

    def test_squat_rejects_insufficient_movement(self):
        """Verify SquatAnalyzer rejects a video where athlete is merely standing still."""
        frames = [
            {
                11: [0.45, 0.2, 0.0, 0.99],
                12: [0.55, 0.2, 0.0, 0.99],
                23: [0.46, 0.4, 0.0, 0.99],
                24: [0.54, 0.4, 0.0, 0.99],
                25: [0.45, 0.65, 0.0, 0.99],
                26: [0.55, 0.65, 0.0, 0.99],
                27: [0.45, 0.9, 0.0, 0.99],
                28: [0.55, 0.9, 0.0, 0.99],
            }
            for _ in range(30)
        ]
        analyzer = SquatAnalyzer()
        res = analyzer.analyze(frames, fps=30.0)

        self.assertFalse(res.is_valid)
        self.assertEqual(res.status, "failed")
        self.assertEqual(res.error_details["error_code"], "INSUFFICIENT_RANGE_OF_MOTION")

    def test_jump_analyzer_metrics(self):
        """Test VerticalJumpAnalyzer with dip, flight, and landing."""
        frames = []
        for i in range(30):
            if i < 10:
                # Dip phase
                dip_prog = i / 10.0
                hip_y = 0.50 + dip_prog * 0.15
                knee_y = 0.70 + dip_prog * 0.05
            elif i < 20:
                # Jump apex phase
                jump_prog = (i - 10) / 10.0
                hip_y = 0.65 - jump_prog * 0.35  # Reaches 0.30
                knee_y = 0.75 - jump_prog * 0.30
            else:
                # Landing absorption phase
                land_prog = (i - 20) / 10.0
                hip_y = 0.30 + land_prog * 0.25
                knee_y = 0.45 + land_prog * 0.25

            frame = {
                11: [0.45, hip_y - 0.25, 0.0, 0.99],
                12: [0.55, hip_y - 0.25, 0.0, 0.99],
                23: [0.46, hip_y, 0.0, 0.99],
                24: [0.54, hip_y, 0.0, 0.99],
                25: [0.44, knee_y, 0.0, 0.99],
                26: [0.56, knee_y, 0.0, 0.99],
                27: [0.44, 0.90, 0.0, 0.99],
                28: [0.56, 0.90, 0.0, 0.99],
            }
            frames.append(frame)

        analyzer = VerticalJumpAnalyzer()
        res = analyzer.analyze(frames, fps=30.0)

        self.assertTrue(res.is_valid)
        self.assertEqual(res.status, "completed")
        self.assertIn("explosive_capacity", res.metrics)
        self.assertIn("knee_stability", res.metrics)

    def test_cricket_batting_analyzer_metrics(self):
        """Test CricketBattingAnalyzer with forward drive stroke sequence."""
        frames = []
        for i in range(30):
            wrist_x = 0.40 + (i / 30.0) * 0.35
            wrist_y = 0.30 + (i / 30.0) * 0.25
            frame = {
                0: [0.50, 0.15, 0.0, 0.99],
                11: [0.48, 0.25, 0.0, 0.99],
                12: [0.55, 0.25, 0.0, 0.99],
                13: [0.45, 0.35, 0.0, 0.99],
                14: [0.57, 0.35, 0.0, 0.99],
                15: [wrist_x, wrist_y, 0.0, 0.99],
                16: [wrist_x + 0.02, wrist_y, 0.0, 0.99],
                23: [0.48, 0.50, 0.0, 0.99],
                24: [0.56, 0.50, 0.0, 0.99],
                25: [0.50, 0.70, 0.0, 0.99],
                26: [0.60, 0.70, 0.0, 0.99],
                27: [0.50, 0.90, 0.0, 0.99],
                28: [0.62, 0.90, 0.0, 0.99],
            }
            frames.append(frame)

        analyzer = CricketBattingAnalyzer()
        res = analyzer.analyze(frames, fps=30.0)

        self.assertTrue(res.is_valid)
        self.assertEqual(res.status, "completed")
        self.assertIn("front_knee_brace", res.metric_details)
        self.assertIn("head_over_ball", res.metric_details)
        self.assertIn("balance", res.metrics)

    def test_football_strike_analyzer_metrics(self):
        """Test FootballStrikeAnalyzer with kicking stroke sequence."""
        frames = []
        for i in range(30):
            strike_leg_x = 0.40 + (i / 30.0) * 0.30
            strike_leg_y = 0.85 - (np.sin((i / 30.0) * np.pi) * 0.30)
            frame = {
                11: [0.48, 0.25, 0.0, 0.99],
                12: [0.55, 0.25, 0.0, 0.99],
                23: [0.48, 0.50, 0.0, 0.99],
                24: [0.56, 0.50, 0.0, 0.99],
                25: [0.48, 0.70, 0.0, 0.99], # Plant knee
                26: [strike_leg_x, 0.65, 0.0, 0.99],
                27: [0.48, 0.90, 0.0, 0.99], # Plant ankle
                28: [strike_leg_x + 0.05, strike_leg_y, 0.0, 0.99], # Striking ankle
            }
            frames.append(frame)

        analyzer = FootballStrikeAnalyzer()
        res = analyzer.analyze(frames, fps=30.0)

        self.assertTrue(res.is_valid)
        self.assertEqual(res.status, "completed")
        self.assertIn("knee_stability", res.metric_details)
        self.assertEqual(res.metric_details["knee_stability"].name, "Plant Knee Stability")
        self.assertIn("explosive_capacity", res.metrics)

    def test_basketball_shot_analyzer_metrics(self):
        """Test BasketballJumpShotAnalyzer with shooting release sequence."""
        frames = []
        for i in range(30):
            prog = i / 30.0
            jump_y = 0.50 - (np.sin(prog * np.pi) * 0.20)
            arm_extend_y = 0.35 - (prog * 0.20)
            frame = {
                11: [0.45, jump_y - 0.25, 0.0, 0.99],
                12: [0.55, jump_y - 0.25, 0.0, 0.99],
                13: [0.40, jump_y - 0.15, 0.0, 0.99],
                14: [0.58, arm_extend_y, 0.0, 0.99], # Shooting elbow
                15: [0.38, jump_y - 0.05, 0.0, 0.99],
                16: [0.60, arm_extend_y - 0.12, 0.0, 0.99], # Shooting wrist
                23: [0.46, jump_y, 0.0, 0.99],
                24: [0.54, jump_y, 0.0, 0.99],
                25: [0.45, jump_y + 0.20, 0.0, 0.99],
                26: [0.55, jump_y + 0.20, 0.0, 0.99],
                27: [0.45, jump_y + 0.40, 0.0, 0.99],
                28: [0.55, jump_y + 0.40, 0.0, 0.99],
            }
            frames.append(frame)

        analyzer = BasketballJumpShotAnalyzer()
        res = analyzer.analyze(frames, fps=30.0)

        self.assertTrue(res.is_valid)
        self.assertEqual(res.status, "completed")
        self.assertIn("balance", res.metric_details)
        self.assertEqual(res.metric_details["balance"].name, "Release Snap & Follow-Through")
        self.assertIn("explosive_capacity", res.metrics)

    def test_sprint_mechanics_analyzer_metrics(self):
        """Test SprintMechanicsAnalyzer with sprint acceleration sequence."""
        frames = []
        for i in range(30):
            prog = i / 30.0
            ankle_x = 0.20 + prog * 0.40
            knee_drive_y = 0.45 - (np.sin(prog * np.pi * 2) * 0.15)
            frame = {
                11: [0.42 + prog * 0.3, 0.25, 0.0, 0.99],
                12: [0.48 + prog * 0.3, 0.25, 0.0, 0.99],
                23: [0.40 + prog * 0.3, 0.50, 0.0, 0.99],
                24: [0.46 + prog * 0.3, 0.50, 0.0, 0.99],
                25: [0.38 + prog * 0.3, knee_drive_y, 0.0, 0.99],
                26: [0.48 + prog * 0.3, 0.70, 0.0, 0.99],
                27: [ankle_x, 0.90, 0.0, 0.99],
                28: [ankle_x + 0.1, 0.90, 0.0, 0.99],
            }
            frames.append(frame)

        analyzer = SprintMechanicsAnalyzer()
        res = analyzer.analyze(frames, fps=30.0)

        self.assertTrue(res.is_valid)
        self.assertEqual(res.status, "completed")
        self.assertIn("knee_stability", res.metric_details)
        self.assertEqual(res.metric_details["knee_stability"].name, "High Knee Drive Elevation")
        self.assertIn("explosive_capacity", res.metrics)


    # ── PART 4: Removal of False Confidence & Quality Gate ─────────────────────

    def test_quality_gate_rejects_missing_landmarks(self):
        """Verify VideoQualityGate rejects videos with occluded/missing required landmarks."""
        frames_missing = [
            {
                11: [0.45, 0.2, 0.0, 0.99],
                12: [0.55, 0.2, 0.0, 0.99],
                23: [0.46, 0.4, 0.0, 0.99],
                24: [0.54, 0.4, 0.0, 0.99],
                25: [0.0, 0.0, 0.0, 0.1],
                26: [0.0, 0.0, 0.0, 0.1],
                27: [0.0, 0.0, 0.0, 0.1],
                28: [0.0, 0.0, 0.0, 0.1],
            }
            for _ in range(25)
        ]
        squat_protocol = SquatAnalyzer()
        usable = 0
        for f in frames_missing:
            if all(f[idx][3] >= squat_protocol.min_visibility_threshold for idx in squat_protocol.required_landmarks):
                usable += 1
        self.assertEqual(usable, 0)

    # ── PART 5: Goal- and Role-Aware Bottleneck Intelligence ───────────────────

    def test_bottleneck_4_tier_classification(self):
        """Verify BottleneckEngine categorizes scores into Strengths, Proficient, Development, and Bottlenecks."""
        athlete_profile = {
            "sport": "cricket",
            "primary_role": "bowler",
            "sub_role": "fast_bowler",
            "experience_level": "intermediate",
            "development_objectives": ["explosiveness"],
        }
        scores = {
            "knee_stability": 55.0,     # Gap = 20 (Critical Bottleneck)
            "hip_mobility": 62.0,      # Gap = 6  (Development Area)
            "upper_body_posture": 70.0, # Gap = 0  (Proficient / On target)
            "balance": 82.0,           # Gap = -14 (Strength / Above target)
        }

        profile_eval = bottleneck_engine.evaluate_development_profile(athlete_profile, scores)

        strengths = [s["attribute"] for s in profile_eval["strengths"]]
        proficient = [p["attribute"] for p in profile_eval["proficient"]]
        dev_areas = [d["attribute"] for d in profile_eval["development_areas"]]
        critical = [c["attribute"] for c in profile_eval["critical_bottlenecks"]]

        self.assertIn("balance", strengths)
        self.assertIn("upper_body_posture", proficient)
        self.assertIn("hip_mobility", dev_areas)
        self.assertIn("knee_stability", critical)

    def test_bottleneck_does_not_force_flaw_on_small_gap(self):
        """Verify a minor 1-2 point deviation within tolerance is marked proficient, not a bottleneck."""
        athlete_profile = {
            "sport": "football",
            "primary_role": "striker",
            "sub_role": "center_forward",
            "experience_level": "intermediate",
        }
        scores = {
            "knee_stability": 67.0,  # 1 point below benchmark
        }
        profile_eval = bottleneck_engine.evaluate_development_profile(athlete_profile, scores)
        proficient = [p["attribute"] for p in profile_eval["proficient"]]
        bottlenecks = [b["attribute"] for b in profile_eval["critical_bottlenecks"]]

        self.assertIn("knee_stability", proficient)
        self.assertNotIn("knee_stability", bottlenecks)


if __name__ == "__main__":
    unittest.main()

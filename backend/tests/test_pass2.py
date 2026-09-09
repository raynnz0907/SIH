import unittest
from datetime import date
from services.taxonomy_service import taxonomy_service
from services.exercise_service import exercise_service
from services.bottleneck_engine import bottleneck_engine
from services.plan_generator import plan_generator
from services.reassessment_service import reassessment_service


class TestSportifyPass2(unittest.TestCase):
    # ── 1. Role & Sub-Role Influence on Development Priorities ─────────────────

    def test_role_and_subrole_influence_priorities(self):
        """Verify role and sub-role assign different weights to identical movement scores."""
        scores = {
            "knee_stability": 50.0,
            "explosive_capacity": 50.0,
            "balance": 50.0,
        }

        # Fast Bowler has high knee stability and explosive demand
        fast_bowler_profile = {
            "sport": "cricket",
            "primary_role": "bowler",
            "sub_role": "fast_bowler",
            "experience_level": "intermediate",
        }
        fb_eval = bottleneck_engine.evaluate_development_profile(fast_bowler_profile, scores)
        fb_bottlenecks = fb_eval["bottlenecks"]
        fb_top_attr = fb_bottlenecks[0]["attribute"]

        # Spin Bowler has high balance and mobility demand
        spin_bowler_profile = {
            "sport": "cricket",
            "primary_role": "bowler",
            "sub_role": "spin_bowler",
            "experience_level": "intermediate",
        }
        sb_eval = bottleneck_engine.evaluate_development_profile(spin_bowler_profile, scores)
        sb_bottlenecks = sb_eval["bottlenecks"]
        sb_top_attr = sb_bottlenecks[0]["attribute"]

        self.assertIn(fb_top_attr, ["knee_stability", "explosive_capacity"])
        self.assertIn(sb_top_attr, ["balance", "hip_mobility"])
        self.assertNotEqual(fb_top_attr, sb_top_attr)

    # ── 2. Athlete Goals Influence on Development Priorities ───────────────────

    def test_athlete_goals_boost_priorities(self):
        """Verify athlete selected goals boost the priority weight of matching attributes."""
        scores = {
            "knee_stability": 50.0,
            "explosive_capacity": 50.0,
            "hip_mobility": 50.0,
        }
        profile_no_goal = {
            "sport": "cricket",
            "primary_role": "batsman",
            "sub_role": "opening_batsman",
            "experience_level": "intermediate",
            "development_objectives": [],
        }
        eval_no_goal = bottleneck_engine.evaluate_development_profile(profile_no_goal, scores)
        exp_item_no_goal = next(b for b in eval_no_goal["bottlenecks"] if b["attribute"] == "explosive_capacity")

        profile_with_explosive_goal = {
            "sport": "cricket",
            "primary_role": "batsman",
            "sub_role": "opening_batsman",
            "experience_level": "intermediate",
            "development_objectives": ["explosiveness"],
        }
        eval_with_goal = bottleneck_engine.evaluate_development_profile(profile_with_explosive_goal, scores)
        exp_item_with_goal = next(b for b in eval_with_goal["bottlenecks"] if b["attribute"] == "explosive_capacity")

        self.assertGreater(exp_item_with_goal["priority"], exp_item_no_goal["priority"])

    # ── 3. Strengths Are Recognized and Not Prescribed as Weaknesses ───────────

    def test_strengths_not_prescribed_as_weaknesses(self):
        """Verify attributes exceeding benchmarks are classified as Key Strengths and excluded from bottlenecks."""
        profile = {
            "sport": "football",
            "primary_role": "striker",
            "sub_role": "center_forward",
            "experience_level": "intermediate",
        }
        scores = {
            "upper_body_posture": 85.0,
            "knee_stability": 50.0,
        }
        eval_res = bottleneck_engine.evaluate_development_profile(profile, scores)

        strength_attrs = [s["attribute"] for s in eval_res["strengths"]]
        bottleneck_attrs = [b["attribute"] for b in eval_res["critical_bottlenecks"]]

        self.assertIn("upper_body_posture", strength_attrs)
        self.assertNotIn("upper_body_posture", bottleneck_attrs)
        self.assertIn("knee_stability", bottleneck_attrs)

    # ── 4. Exercise Library Activation & Grounded Selection ───────────────────

    def test_exercise_service_retrieval(self):
        """Verify ExerciseService queries structured exercises from the catalog."""
        all_exercises = exercise_service.all_exercises
        self.assertGreaterEqual(len(all_exercises), 30)

        explosive_exs = exercise_service.get_exercises_for_attribute("explosive_capacity")
        self.assertTrue(len(explosive_exs) > 0)
        for ex in explosive_exs:
            self.assertIn("explosive_capacity", ex["targets_attributes"])

    # ── 5. Exercise Selection Respects Athlete Constraints ─────────────────────

    def test_exercise_selection_respects_difficulty_and_equipment(self):
        """Verify exercise filtering respects beginner vs advanced difficulty and equipment."""
        beginner_exs = exercise_service.get_exercises_for_attribute(
            "knee_stability", difficulty="beginner"
        )
        for ex in beginner_exs:
            self.assertNotEqual(ex.get("difficulty"), "advanced")

        bodyweight_exs = exercise_service.get_exercises_for_attribute(
            "knee_stability", equipment=["bodyweight"]
        )
        for ex in bodyweight_exs:
            self.assertIn("bodyweight", ex.get("equipment", ["bodyweight"]))

    # ── 6. Training Plans Reflect Identified Development Priorities ────────────

    def test_plan_generation_reflects_development_priorities(self):
        """Verify that training plan main exercises target the athlete's primary bottleneck."""
        profile = {
            "sport": "cricket",
            "primary_role": "bowler",
            "sub_role": "fast_bowler",
            "experience_level": "intermediate",
            "training_days_per_week": 3,
            "session_duration_minutes": 60,
        }
        bottlenecks = [
            {"attribute": "explosive_capacity", "name": "Explosive Capacity", "gap": 25.0, "score": 50.0, "benchmark": 75.0}
        ]

        plan = plan_generator.generate_plan(athlete_profile=profile, bottlenecks=bottlenecks)

        self.assertIn("weeks", plan)
        self.assertEqual(len(plan["weeks"]), 4)

        week1_sessions = plan["weeks"][0]["sessions"]
        self.assertEqual(len(week1_sessions), 3)

        all_target_attrs = []
        for s in week1_sessions:
            for ex in s["main_exercises"]:
                all_target_attrs.append(ex.get("targets_bottleneck"))

        self.assertIn("explosive_capacity", all_target_attrs)

    # ── 7. Grounded Recovery Recommendations from Training Context ────────────

    def test_dynamic_recovery_reflects_training_load(self):
        """Verify recovery protocol reacts dynamically to high training strain vs baseline."""
        profile = {"sport": "cricket", "role": "fast_bowler"}
        bottlenecks = [{"attribute": "knee_stability", "name": "Knee Stability"}]

        low_load = {"avg_rpe": 5.0, "total_minutes_week": 180}
        rec_low = plan_generator.generate_recovery_plan(profile, bottlenecks, recent_sessions_load=low_load)
        self.assertEqual(rec_low["load_context"]["strain_status"], "Optimal Adaptation")

        high_load = {"avg_rpe": 8.5, "total_minutes_week": 360}
        rec_high = plan_generator.generate_recovery_plan(profile, bottlenecks, recent_sessions_load=high_load)
        self.assertEqual(rec_high["load_context"]["strain_status"], "High Strain")
        self.assertTrue(any("High training strain detected" in h for h in rec_high["daily_habits"]))

    # ── 8. Longitudinal Reassessment Comparison & Bottleneck Resolution ───────

    def test_reassessment_delta_and_bottleneck_resolution(self):
        """Verify comparing two assessments calculates deltas and marks resolved bottlenecks."""
        profile = {
            "sport": "cricket",
            "primary_role": "bowler",
            "sub_role": "fast_bowler",
            "experience_level": "intermediate",
        }
        initial_scores = {
            "knee_stability": 50.0,
            "explosive_capacity": 65.0,
            "upper_body_posture": 70.0,
        }
        prev_bottlenecks = [
            {"attribute": "knee_stability", "gap": 25.0}
        ]

        reassessment_scores = {
            "knee_stability": 76.0,
            "explosive_capacity": 72.0,
            "upper_body_posture": 70.0,
        }

        comparison = reassessment_service.compare_assessments(
            current_scores=reassessment_scores,
            previous_scores=initial_scores,
            athlete_profile=profile,
            previous_bottlenecks=prev_bottlenecks,
        )

        self.assertGreater(comparison["average_delta"], 0)
        self.assertEqual(comparison["overall_trajectory"], "Advancing")

        improved_names = [m["metric"] for m in comparison["improved_metrics"]]
        self.assertIn("knee_stability", improved_names)

        resolved_attrs = [r["attribute"] for r in comparison["resolved_bottlenecks"]]
        self.assertIn("knee_stability", resolved_attrs)


if __name__ == "__main__":
    unittest.main()

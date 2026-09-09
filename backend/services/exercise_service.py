import json
import os
from typing import Dict, List, Optional, Any


class ExerciseService:
    """
    Ground-truth catalog and prescription service for exercises.
    Selects structured exercises based on development priorities,
    athlete experience level, available equipment, and sport demands.
    """

    _instance = None
    _exercises: List[Dict[str, Any]] = []
    _by_id: Dict[str, Dict[str, Any]] = {}
    _by_attribute: Dict[str, List[Dict[str, Any]]] = {}
    _by_category: Dict[str, List[Dict[str, Any]]] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ExerciseService, cls).__new__(cls)
            cls._instance._load_library()
        return cls._instance

    def _load_library(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        path = os.path.join(base_dir, "data", "exercise_library.json")
        try:
            with open(path, "r", encoding="utf-8") as f:
                self._exercises = json.load(f)
        except Exception:
            self._exercises = []

        self._by_id = {ex["id"]: ex for ex in self._exercises}
        self._by_attribute = {}
        self._by_category = {}

        for ex in self._exercises:
            cat = ex.get("category", "general")
            self._by_category.setdefault(cat, []).append(ex)

            for attr in ex.get("targets_attributes", []):
                self._by_attribute.setdefault(attr, []).append(ex)

    @property
    def all_exercises(self) -> List[Dict[str, Any]]:
        return self._exercises

    def get_by_id(self, exercise_id: str) -> Optional[Dict[str, Any]]:
        return self._by_id.get(exercise_id)

    def get_exercises_for_attribute(
        self,
        attribute: str,
        difficulty: Optional[str] = None,
        category: Optional[str] = None,
        equipment: Optional[List[str]] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Filter exercises from the catalog matching a target biomechanical attribute,
        difficulty level, and equipment constraint.
        """
        pool = self._by_attribute.get(attribute, [])
        if not pool:
            # Fallback to category if attribute not explicitly matched
            pool = self._by_category.get(category, self._exercises) if category else self._exercises

        filtered = []
        for ex in pool:
            if category and ex.get("category") != category and category != "all":
                continue
            if difficulty and difficulty != "all":
                ex_diff = ex.get("difficulty", "intermediate")
                # Beginner can do beginner; Intermediate can do beginner/intermediate; Advanced can do all
                if difficulty == "beginner" and ex_diff == "advanced":
                    continue
                if difficulty == "intermediate" and ex_diff == "advanced":
                    continue
            if equipment and equipment != ["all"]:
                ex_equip = ex.get("equipment", ["bodyweight"])
                # If exercise requires equipment not in available set
                if not any(eq in equipment or eq == "bodyweight" for eq in ex_equip):
                    continue
            filtered.append(ex)

        return filtered[:limit] if limit else filtered

    def build_session_exercises(
        self,
        session_type: str,
        primary_bottlenecks: List[Dict[str, Any]],
        experience_level: str = "intermediate",
        session_duration_minutes: int = 60,
        athlete_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Constructs a structured session (warmup, main exercises, cooldown)
        drawn strictly from the exercise library catalog.
        """
        target_attrs = [b.get("attribute") for b in primary_bottlenecks if b.get("attribute")]
        if not target_attrs:
            target_attrs = ["explosive_capacity", "knee_stability"]

        # Number of main exercises based on session duration
        num_main = 4 if session_duration_minutes >= 60 else 3 if session_duration_minutes >= 45 else 2

        main_exercises = []
        used_ids = set()

        # 1. Fill 60%+ of main exercises from primary development bottlenecks
        for attr in target_attrs:
            matches = self.get_exercises_for_attribute(
                attribute=attr,
                difficulty=experience_level,
                limit=2,
            )
            for ex in matches:
                if ex["id"] not in used_ids and len(main_exercises) < num_main:
                    used_ids.add(ex["id"])
                    cue = ex.get("coaching_cues", ["Maintain proper form"])[0]
                    main_exercises.append(
                        {
                            "id": ex["id"],
                            "name": ex["name"],
                            "sets": 3 if experience_level != "advanced" else 4,
                            "reps": ex.get("sets_reps_default", "3x8-10").split("x")[-1] if "x" in ex.get("sets_reps_default", "") else "8-10",
                            "intensity_level": "Medium" if experience_level == "beginner" else "High",
                            "rest_seconds": ex.get("rest_default", 90),
                            "coaching_cue": cue,
                            "targets_bottleneck": attr,
                            "primary_muscles": ex.get("primary_muscles", []),
                            "equipment": ex.get("equipment", ["bodyweight"]),
                        }
                    )

        # 2. If main exercises still has slots, fill from session type category
        cat_map = {
            "Strength": "strength",
            "Speed": "speed",
            "Agility": "agility",
            "Plyometric": "plyometrics",
            "Mobility": "mobility",
            "Recovery": "recovery",
        }
        fallback_cat = cat_map.get(session_type, "strength")
        pool = self._by_category.get(fallback_cat, self._exercises)
        for ex in pool:
            if ex["id"] not in used_ids and len(main_exercises) < num_main:
                used_ids.add(ex["id"])
                cue = ex.get("coaching_cues", ["Focus on control"])[0]
                target_attr = ex.get("targets_attributes", ["general"])[0]
                main_exercises.append(
                    {
                        "id": ex["id"],
                        "name": ex["name"],
                        "sets": 3,
                        "reps": ex.get("sets_reps_default", "3x10").split("x")[-1] if "x" in ex.get("sets_reps_default", "") else "10",
                        "intensity_level": "Medium",
                        "rest_seconds": ex.get("rest_default", 60),
                        "coaching_cue": cue,
                        "targets_bottleneck": target_attr,
                        "primary_muscles": ex.get("primary_muscles", []),
                        "equipment": ex.get("equipment", ["bodyweight"]),
                    }
                )

        # 3. Dynamic warmups and cooldowns based on mobility catalog
        mobility_pool = self._by_category.get("mobility", [])
        warmup_cues = [m["name"] + " (10-12 reps)" for m in mobility_pool[:3]] if mobility_pool else [
            "5 min light dynamic jog",
            "Leg swings (15 each side)",
            "Hip circles (10 each side)",
        ]
        cooldown_cues = [m["name"] + " (60s hold)" for m in mobility_pool[3:5]] if len(mobility_pool) >= 5 else [
            "Full body static stretching (5 min)",
            "Deep diaphragmatic breathing (3 min)",
        ]

        return {
            "warmup": warmup_cues,
            "main_exercises": main_exercises,
            "cooldown": cooldown_cues,
        }


exercise_service = ExerciseService()

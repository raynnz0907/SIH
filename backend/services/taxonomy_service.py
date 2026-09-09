import json
import os
from typing import Dict, List, Optional, Any


class TaxonomyService:
    """
    Unified Single Source of Truth for sports, disciplines, roles,
    sub-roles, attribute demands, benchmarks, and development objectives.
    """

    _instance = None
    _data = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TaxonomyService, cls).__new__(cls)
            cls._instance._load_taxonomy()
        return cls._instance

    def _load_taxonomy(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        taxonomy_path = os.path.join(base_dir, "data", "sport_taxonomy.json")
        try:
            with open(taxonomy_path, "r", encoding="utf-8") as f:
                self._data = json.load(f)
        except Exception:
            self._data = {"sports": {}, "development_objectives": {}}

    @property
    def sports(self) -> Dict[str, Any]:
        return self._data.get("sports", {})

    @property
    def development_objectives(self) -> Dict[str, Any]:
        return self._data.get("development_objectives", {})

    def get_sport(self, sport_id: str) -> Optional[Dict[str, Any]]:
        return self.sports.get(sport_id.lower())

    def get_role_data(self, sport_id: str, role_id: str) -> Optional[Dict[str, Any]]:
        sport = self.get_sport(sport_id)
        if not sport:
            return None
        roles = sport.get("roles", {})
        norm_role = role_id.lower().replace(" ", "_").replace("-", "_")
        return roles.get(norm_role)

    def get_sub_role_data(
        self,
        sport_id: str,
        role_id: str,
        sub_role_id: Optional[str] = None,
        sub_role: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        role_data = self.get_role_data(sport_id, role_id)
        if not role_data:
            return None

        sub_roles = role_data.get("sub_roles", {})
        if not sub_roles:
            return None

        target_sub = sub_role_id or sub_role
        if target_sub:
            norm_sub = target_sub.lower().replace(" ", "_").replace("-", "_")
            if norm_sub in sub_roles:
                return sub_roles[norm_sub]

        # Default to the first sub-role if none or not found
        return next(iter(sub_roles.values()))

    def get_benchmarks(
        self,
        sport_id: str,
        role_id: str,
        sub_role_id: Optional[str] = None,
        sub_role: Optional[str] = None,
        experience_level: str = "intermediate",
    ) -> Dict[str, float]:
        """
        Retrieve baseline attribute benchmarks for an athlete's sport, role, sub-role, and level.
        """
        sub_role_data = self.get_sub_role_data(
            sport_id, role_id, sub_role_id=sub_role_id, sub_role=sub_role
        )
        if not sub_role_data:
            return {
                "knee_stability": 70.0,
                "hip_mobility": 70.0,
                "upper_body_posture": 70.0,
                "movement_symmetry": 70.0,
                "explosive_capacity": 70.0,
                "balance": 70.0,
                "flexibility": 65.0,
            }

        benchmarks_by_level = sub_role_data.get("benchmarks", {})
        norm_exp = experience_level.lower()
        if norm_exp not in benchmarks_by_level:
            norm_exp = "intermediate"

        return benchmarks_by_level.get(norm_exp, {})

    def get_attribute_weights(
        self,
        sport_id: str,
        role_id: str,
        sub_role_id: Optional[str] = None,
        sub_role: Optional[str] = None,
        goals: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """
        Dynamically calculate role attribute weights, incorporating athlete goals/objectives.
        """
        sub_role_data = self.get_sub_role_data(
            sport_id, role_id, sub_role_id=sub_role_id, sub_role=sub_role
        )
        raw_weights = (
            dict(sub_role_data.get("attribute_weights", {}))
            if sub_role_data
            else {
                "knee_stability": 0.20,
                "hip_mobility": 0.20,
                "upper_body_posture": 0.15,
                "movement_symmetry": 0.15,
                "explosive_capacity": 0.15,
                "balance": 0.15,
            }
        )

        if goals:
            for goal_id in goals:
                norm_goal = goal_id.lower().replace(" ", "_").replace("-", "_")
                obj_def = self.development_objectives.get(norm_goal)
                if not obj_def:
                    for key, val in self.development_objectives.items():
                        if key in norm_goal or norm_goal in key or val["name"].lower() == goal_id.lower():
                            obj_def = val
                            break

                if obj_def:
                    boost = obj_def.get("weight_boost", 0.15)
                    for target_attr in obj_def.get("targeted_attributes", []):
                        current = raw_weights.get(target_attr, 0.10)
                        raw_weights[target_attr] = current + boost

        total = sum(raw_weights.values())
        if total > 0:
            return {k: round(v / total, 4) for k, v in raw_weights.items()}
        return raw_weights


taxonomy_service = TaxonomyService()

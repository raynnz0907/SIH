from typing import Dict, List, Optional, Any
from .taxonomy_service import taxonomy_service


class BottleneckEngine:
    """
    Goal- and Role-Aware Development Intelligence Layer.
    Synthesizes movement metrics against role demand benchmarks and athlete goals.
    Categorizes metrics into Strengths, Proficient, Development Areas, and Critical Bottlenecks.
    """

    def __init__(self):
        self.taxonomy = taxonomy_service

    def identify_bottlenecks(
        self, athlete_profile: Dict[str, Any], movement_scores: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        findings = self.evaluate_development_profile(athlete_profile, movement_scores)
        # Return prioritized list of bottlenecks (critical and development areas)
        return findings.get("bottlenecks", [])

    def evaluate_development_profile(
        self, athlete_profile: Dict[str, Any], movement_scores: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Complete 4-tier evaluation: Strengths, Proficient, Development Areas, and Critical Bottlenecks.
        """
        sport = athlete_profile.get("sport", "football")
        role = athlete_profile.get("primary_role") or athlete_profile.get("role", "striker")
        sub_role = athlete_profile.get("sub_role")
        exp = athlete_profile.get("experience_level", "intermediate")
        goals = (
            athlete_profile.get("development_objectives")
            or athlete_profile.get("goals")
            or []
        )

        benchmarks = self.taxonomy.get_benchmarks(
            sport, role, sub_role=sub_role, experience_level=exp
        )
        weights = self.taxonomy.get_attribute_weights(
            sport, role, sub_role=sub_role, goals=goals
        )
        sub_role_data = self.taxonomy.get_sub_role_data(sport, role, sub_role=sub_role)
        role_title = sub_role_data.get("title") if sub_role_data else role.replace("_", " ").title()

        strengths = []
        proficient = []
        development_areas = []
        bottlenecks = []

        # Tolerance threshold: a gap <= 3 points is considered within acceptable variance
        TOLERANCE = 3.0

        for attr, score in movement_scores.items():
            bench = benchmarks.get(attr, 70.0)
            weight = weights.get(attr, 0.15)
            gap = bench - score
            attr_label = attr.replace("_", " ").title()

            # Importance explanation
            explanation = (
                f"{attr_label} is a core demand for {role_title} ({round(weight*100)}% weighting)."
            )

            item = {
                "attribute": attr,
                "name": attr_label,
                "score": round(score, 1),
                "benchmark": round(bench, 1),
                "gap": round(gap, 1),
                "weight": round(weight, 3),
                "role_relevance_explanation": explanation,
            }

            if gap < -5.0:
                # Score is 5+ points above benchmark -> Strength
                item["category"] = "strength"
                item["status"] = "Above Target"
                strengths.append(item)
            elif abs(gap) <= TOLERANCE:
                # Score is within tolerance -> Proficient
                item["category"] = "proficient"
                item["status"] = "On Target"
                proficient.append(item)
            elif gap <= 12.0:
                # Moderate deficit (3 - 12 pts) -> Development Area
                priority_score = (gap / 100.0) * weight
                item["category"] = "development_area"
                item["priority"] = round(priority_score, 4)
                item["severity"] = "moderate"
                development_areas.append(item)
            else:
                # Significant deficit (>12 pts) -> Critical Bottleneck
                priority_score = (gap / 100.0) * (weight * 1.5)
                item["category"] = "critical_bottleneck"
                item["priority"] = round(priority_score, 4)
                item["severity"] = "critical"
                bottlenecks.append(item)

        # Merge and sort bottlenecks and development areas by priority
        combined_bottlenecks = bottlenecks + development_areas
        combined_bottlenecks.sort(key=lambda x: x.get("priority", 0), reverse=True)

        return {
            "sport": sport,
            "role": role_title,
            "strengths": strengths,
            "proficient": proficient,
            "development_areas": development_areas,
            "critical_bottlenecks": bottlenecks,
            "bottlenecks": combined_bottlenecks,
        }

    def from_manual_assessment(
        self, athlete_profile: Dict[str, Any], manual_scores: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        return self.identify_bottlenecks(athlete_profile, manual_scores)


bottleneck_engine = BottleneckEngine()

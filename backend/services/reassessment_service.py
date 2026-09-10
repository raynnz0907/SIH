from typing import Dict, List, Optional, Any
from .bottleneck_engine import bottleneck_engine


class ReassessmentService:
    """
    Longitudinal Reassessment & Progression Comparison Engine.
    Compares consecutive assessments, calculates delta adaptations,
    evaluates resolution of previous bottlenecks, and triggers updated priorities.
    """

    def compare_assessments(
        self,
        current_scores: Dict[str, float],
        previous_scores: Dict[str, float],
        athlete_profile: Dict[str, Any],
        previous_bottlenecks: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Calculates metric deltas, resolution status of previous bottlenecks,
        and updated 4-tier development priorities.
        """
        metric_deltas = {}
        improved_metrics = []
        stable_metrics = []
        regressed_metrics = []

        all_keys = set(current_scores.keys()).union(set(previous_scores.keys()))

        for key in all_keys:
            cur_val = current_scores.get(key, 0.0)
            prev_val = previous_scores.get(key, 0.0)
            delta = round(cur_val - prev_val, 1)

            entry = {
                "metric": key,
                "name": key.replace("_", " ").title(),
                "previous_score": prev_val,
                "current_score": cur_val,
                "delta": delta,
            }

            if delta >= 5.0:
                entry["status"] = "improved"
                improved_metrics.append(entry)
            elif delta <= -5.0:
                entry["status"] = "regressed"
                regressed_metrics.append(entry)
            else:
                entry["status"] = "stable"
                stable_metrics.append(entry)

            metric_deltas[key] = entry

        # Check resolution of previous bottlenecks
        resolved_bottlenecks = []
        persisting_bottlenecks = []

        prev_bottleneck_attrs = {
            b.get("attribute") for b in (previous_bottlenecks or []) if b.get("attribute")
        }

        # Evaluate updated development profile on current scores
        current_profile_eval = bottleneck_engine.evaluate_development_profile(
            athlete_profile, current_scores
        )

        current_critical_attrs = {
            b.get("attribute")
            for b in current_profile_eval.get("critical_bottlenecks", [])
        }
        current_dev_attrs = {
            d.get("attribute")
            for d in current_profile_eval.get("development_areas", [])
        }
        current_strengths = {
            s.get("attribute") for s in current_profile_eval.get("strengths", [])
        }
        current_proficient = {
            p.get("attribute") for p in current_profile_eval.get("proficient", [])
        }

        for attr in prev_bottleneck_attrs:
            attr_name = attr.replace("_", " ").title()
            if attr in current_strengths or attr in current_proficient:
                resolved_bottlenecks.append(
                    {
                        "attribute": attr,
                        "name": attr_name,
                        "status": "Resolved / Reached Target",
                        "new_score": current_scores.get(attr),
                    }
                )
            elif attr in current_critical_attrs or attr in current_dev_attrs:
                persisting_bottlenecks.append(
                    {
                        "attribute": attr,
                        "name": attr_name,
                        "status": "In Progress",
                        "new_score": current_scores.get(attr),
                    }
                )

        # Emerging priorities (new critical bottlenecks not in previous priority list)
        emerging_priorities = [
            b
            for b in current_profile_eval.get("critical_bottlenecks", [])
            if b.get("attribute") not in prev_bottleneck_attrs
        ]

        # Calculate average delta across all shared metrics
        shared_deltas = [
            m["delta"] for m in metric_deltas.values() if m["previous_score"] > 0
        ]
        avg_delta = round(sum(shared_deltas) / len(shared_deltas), 1) if shared_deltas else 0.0

        return {
            "average_delta": avg_delta,
            "overall_trajectory": "Advancing" if avg_delta > 2.0 else "Stable" if avg_delta >= -2.0 else "Needs Adjustment",
            "metric_deltas": metric_deltas,
            "improved_metrics": improved_metrics,
            "stable_metrics": stable_metrics,
            "regressed_metrics": regressed_metrics,
            "resolved_bottlenecks": resolved_bottlenecks,
            "persisting_bottlenecks": persisting_bottlenecks,
            "emerging_priorities": emerging_priorities,
            "updated_development_profile": current_profile_eval,
        }


reassessment_service = ReassessmentService()

import json
import os

class BottleneckEngine:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        with open(os.path.join(base_dir, "data", "sport_roles.json")) as f:
            self.sport_roles = json.load(f)
        with open(os.path.join(base_dir, "data", "movement_benchmarks.json")) as f:
            self.benchmarks = json.load(f)
            
    def identify_bottlenecks(self, athlete_profile: dict, movement_scores: dict) -> list:
        sport = athlete_profile.get("sport", "football")
        role = athlete_profile.get("role", "striker")
        exp = athlete_profile.get("experience_level", "beginner")
        
        role_data = self.sport_roles.get(sport, {}).get(role, {})
        benchmark_data = self.benchmarks.get(sport, {}).get(role, {}).get(exp, {})
        
        weights = role_data.get("attribute_weights", {})
        
        bottlenecks = []
        for attr, score in movement_scores.items():
            bench = benchmark_data.get(attr, 70)
            weight = weights.get(attr, 0.1)
            
            gap = bench - score
            if gap > 0:
                bottleneck_score = (gap / 100) * weight
                bottlenecks.append({
                    "attribute": attr,
                    "score": score,
                    "benchmark": bench,
                    "gap": gap,
                    "role_relevance_explanation": f"Important for {role} in {sport}",
                    "priority": bottleneck_score
                })
                
        bottlenecks.sort(key=lambda x: x["priority"], reverse=True)
        return bottlenecks[:5]
    
    def from_manual_assessment(self, athlete_profile: dict, manual_scores: dict) -> list:
        return self.identify_bottlenecks(athlete_profile, manual_scores)

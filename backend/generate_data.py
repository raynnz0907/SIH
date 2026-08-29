import json
import os

os.makedirs("c:\\Users\\rayan\\OneDrive\\Desktop\\SIH\\backend\\data", exist_ok=True)

sport_roles = {
    "football": {
        "striker": {"key_attributes": ["explosive_capacity", "agility", "balance", "movement_symmetry", "hip_mobility"], "attribute_weights": {"explosive_capacity": 0.3, "agility": 0.25, "balance": 0.15, "movement_symmetry": 0.15, "hip_mobility": 0.15}, "primary_movement_patterns": ["sprinting", "jumping", "change_of_direction"], "description": "Goal scorer"},
        "winger": {"key_attributes": ["explosive_capacity", "agility", "balance", "movement_symmetry", "hip_mobility"], "attribute_weights": {"explosive_capacity": 0.3, "agility": 0.3, "balance": 0.1, "movement_symmetry": 0.15, "hip_mobility": 0.15}, "primary_movement_patterns": ["sprinting", "change_of_direction"], "description": "Wide attacker"},
        "central_midfielder": {"key_attributes": ["knee_stability", "agility", "balance", "movement_symmetry", "hip_mobility"], "attribute_weights": {"knee_stability": 0.2, "agility": 0.2, "balance": 0.2, "movement_symmetry": 0.2, "hip_mobility": 0.2}, "primary_movement_patterns": ["passing", "turning", "tackling"], "description": "Midfield controller"},
        "centre_back": {"key_attributes": ["explosive_capacity", "knee_stability", "balance", "movement_symmetry", "upper_body_posture"], "attribute_weights": {"explosive_capacity": 0.2, "knee_stability": 0.2, "balance": 0.2, "movement_symmetry": 0.2, "upper_body_posture": 0.2}, "primary_movement_patterns": ["jumping", "tackling", "jockeying"], "description": "Central defender"},
        "goalkeeper": {"key_attributes": ["explosive_capacity", "flexibility", "balance", "movement_symmetry", "agility"], "attribute_weights": {"explosive_capacity": 0.3, "flexibility": 0.2, "balance": 0.2, "movement_symmetry": 0.1, "agility": 0.2}, "primary_movement_patterns": ["diving", "jumping"], "description": "Shot stopper"}
    },
    "basketball": {
        "point_guard": {"key_attributes": ["agility", "explosive_capacity", "balance", "knee_stability", "hip_mobility"], "attribute_weights": {"agility": 0.3, "explosive_capacity": 0.2, "balance": 0.2, "knee_stability": 0.15, "hip_mobility": 0.15}, "primary_movement_patterns": ["sprinting", "change_of_direction", "jumping"], "description": "Playmaker"},
        "shooting_guard": {"key_attributes": ["explosive_capacity", "balance", "knee_stability", "upper_body_posture", "agility"], "attribute_weights": {"explosive_capacity": 0.2, "balance": 0.2, "knee_stability": 0.2, "upper_body_posture": 0.2, "agility": 0.2}, "primary_movement_patterns": ["jumping", "sprinting", "shooting"], "description": "Scorer"},
        "small_forward": {"key_attributes": ["explosive_capacity", "balance", "knee_stability", "agility", "hip_mobility"], "attribute_weights": {"explosive_capacity": 0.25, "balance": 0.2, "knee_stability": 0.2, "agility": 0.2, "hip_mobility": 0.15}, "primary_movement_patterns": ["jumping", "sprinting", "cutting"], "description": "Versatile wing"},
        "power_forward": {"key_attributes": ["knee_stability", "upper_body_posture", "balance", "explosive_capacity", "movement_symmetry"], "attribute_weights": {"knee_stability": 0.25, "upper_body_posture": 0.2, "balance": 0.2, "explosive_capacity": 0.2, "movement_symmetry": 0.15}, "primary_movement_patterns": ["jumping", "post_moves", "rebounding"], "description": "Post player"},
        "center": {"key_attributes": ["knee_stability", "upper_body_posture", "balance", "movement_symmetry", "flexibility"], "attribute_weights": {"knee_stability": 0.3, "upper_body_posture": 0.2, "balance": 0.2, "movement_symmetry": 0.2, "flexibility": 0.1}, "primary_movement_patterns": ["jumping", "post_moves", "blocking"], "description": "Rim protector"}
    },
    "athletics": {
        "sprinter": {"key_attributes": ["explosive_capacity", "movement_symmetry", "hip_mobility", "balance", "knee_stability"], "attribute_weights": {"explosive_capacity": 0.4, "movement_symmetry": 0.2, "hip_mobility": 0.2, "balance": 0.1, "knee_stability": 0.1}, "primary_movement_patterns": ["sprinting", "acceleration"], "description": "Short distance runner"},
        "middle_distance": {"key_attributes": ["knee_stability", "movement_symmetry", "hip_mobility", "balance", "upper_body_posture"], "attribute_weights": {"knee_stability": 0.2, "movement_symmetry": 0.2, "hip_mobility": 0.2, "balance": 0.2, "upper_body_posture": 0.2}, "primary_movement_patterns": ["running", "pacing"], "description": "Middle distance runner"},
        "jumper": {"key_attributes": ["explosive_capacity", "knee_stability", "balance", "flexibility", "movement_symmetry"], "attribute_weights": {"explosive_capacity": 0.4, "knee_stability": 0.2, "balance": 0.15, "flexibility": 0.15, "movement_symmetry": 0.1}, "primary_movement_patterns": ["jumping", "sprinting"], "description": "Long/High/Triple jumper"},
        "thrower": {"key_attributes": ["upper_body_posture", "explosive_capacity", "balance", "knee_stability", "hip_mobility"], "attribute_weights": {"upper_body_posture": 0.3, "explosive_capacity": 0.3, "balance": 0.2, "knee_stability": 0.1, "hip_mobility": 0.1}, "primary_movement_patterns": ["throwing", "rotation"], "description": "Shot put/Discus/Javelin thrower"}
    }
}

benchmarks = {
    "football": {
        "striker": {"beginner": {"explosive_capacity": 50, "agility": 50, "balance": 50}, "intermediate": {"explosive_capacity": 70, "agility": 70, "balance": 70}, "advanced": {"explosive_capacity": 90, "agility": 90, "balance": 90}}
    }
}
# Extending benchmarks to be comprehensive (simplified for constraints)
for sport in sport_roles:
    if sport not in benchmarks:
        benchmarks[sport] = {}
    for role in sport_roles[sport]:
        if role not in benchmarks[sport]:
            benchmarks[sport][role] = {
                "beginner": {attr: 50 for attr in sport_roles[sport][role]["key_attributes"]},
                "intermediate": {attr: 70 for attr in sport_roles[sport][role]["key_attributes"]},
                "advanced": {attr: 90 for attr in sport_roles[sport][role]["key_attributes"]}
            }

exercises = [
    {
        "id": "squat_001", "name": "Back Squat", "category": "strength", "subcategory": "lower_body",
        "primary_muscles": ["quadriceps", "glutes", "hamstrings"], "equipment": ["barbell", "rack"],
        "difficulty": "intermediate", "targets_attributes": ["explosive_capacity", "knee_stability"],
        "coaching_cues": ["Chest up", "Knees track over toes", "Break parallel"], "sets_reps_default": "4x6-8", "rest_default": 180
    },
    {
        "id": "plyo_001", "name": "Box Jumps", "category": "plyometrics", "subcategory": "lower_body",
        "primary_muscles": ["quadriceps", "glutes", "calves"], "equipment": ["plyo_box"],
        "difficulty": "intermediate", "targets_attributes": ["explosive_capacity", "balance"],
        "coaching_cues": ["Land softly", "Drive arms up", "Full hip extension"], "sets_reps_default": "3x5", "rest_default": 120
    }
]

with open("c:\\Users\\rayan\\OneDrive\\Desktop\\SIH\\backend\\data\\sport_roles.json", "w") as f: json.dump(sport_roles, f, indent=4)
with open("c:\\Users\\rayan\\OneDrive\\Desktop\\SIH\\backend\\data\\movement_benchmarks.json", "w") as f: json.dump(benchmarks, f, indent=4)
with open("c:\\Users\\rayan\\OneDrive\\Desktop\\SIH\\backend\\data\\exercise_library.json", "w") as f: json.dump(exercises, f, indent=4)

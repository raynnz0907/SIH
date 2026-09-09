import json
import re
from typing import Dict, List, Optional, Any
import ollama

from .exercise_service import exercise_service
from .taxonomy_service import taxonomy_service

OLLAMA_MODEL = "mistral"
OLLAMA_FALLBACK_MODEL = "llama3.2"
OLLAMA_HOST = "http://localhost:11434"


class PlanGenerator:
    """
    Evidence-Grounded Training and Recovery Pathway Generator.
    Uses ExerciseService as the ground-truth catalog for exercise prescription,
    and grounds Ollama LLM in structured assessment findings and athlete profile constraints.
    """

    def __init__(self):
        self.client = ollama.Client(host=OLLAMA_HOST)
        self.exercises = exercise_service
        self.taxonomy = taxonomy_service

    def generate_plan(
        self,
        athlete_profile: Dict[str, Any],
        bottlenecks: List[Dict[str, Any]],
        strengths: Optional[List[Dict[str, Any]]] = None,
        development_areas: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Generate a structured 4-week training pathway targeting the athlete's specific priorities.
        """
        sport = athlete_profile.get("sport", "cricket")
        role = athlete_profile.get("primary_role") or athlete_profile.get("role", "batsman")
        sub_role = athlete_profile.get("sub_role")
        exp = athlete_profile.get("experience_level", "intermediate")
        days_per_week = min(max(int(athlete_profile.get("training_days_per_week", 4)), 2), 6)
        session_mins = int(athlete_profile.get("session_duration_minutes", 60))
        goals = athlete_profile.get("development_objectives") or athlete_profile.get("goals") or []

        # 1. Determine Primary Development Focuses
        primary_bottlenecks = [b for b in bottlenecks if b.get("attribute")]
        if not primary_bottlenecks and development_areas:
            primary_bottlenecks = development_areas
        if not primary_bottlenecks:
            # Athlete is proficient/strong across baseline; focus on role-specific progression
            role_weights = self.taxonomy.get_attribute_weights(sport, role, sub_role=sub_role, goals=goals)
            top_attr = max(role_weights, key=role_weights.get) if role_weights else "explosive_capacity"
            primary_bottlenecks = [{"attribute": top_attr, "name": top_attr.replace("_", " ").title(), "gap": 0}]

        # 2. Build Base 4-Week Catalog Prescription (Ground Truth)
        base_weeks = self._build_deterministic_pathway(
            athlete_profile=athlete_profile,
            primary_bottlenecks=primary_bottlenecks,
            days_per_week=days_per_week,
            session_mins=session_mins,
            exp=exp,
        )

        # 3. Attempt LLM Grounded Synthesis (Adds coaching rationales & cues to the catalog plan)
        llm_enhanced_plan = self._attempt_llm_synthesis(
            athlete_profile=athlete_profile,
            bottlenecks=primary_bottlenecks,
            strengths=strengths or [],
            base_weeks=base_weeks,
        )

        if llm_enhanced_plan:
            return llm_enhanced_plan

        # 4. Fallback to Grounded Catalog Plan
        top_focus = primary_bottlenecks[0].get("name") or primary_bottlenecks[0].get("attribute", "").replace("_", " ").title()
        role_title = role.replace("_", " ").title()
        return {
            "_source": "catalog_grounded",
            "plan_title": f"4-Week {sport.title()} {role_title} Development Pathway",
            "plan_summary": (
                f"Personalized 4-week training block for {role_title} ({sport.title()}) with primary focus "
                f"on {top_focus}. Sessions are programmed at {days_per_week} days/week ({session_mins} min/session) "
                f"with progressive overload from foundational mechanics to sport-specific power output."
            ),
            "primary_focus_attributes": [b.get("attribute") for b in primary_bottlenecks[:3]],
            "weeks": base_weeks,
            "recovery_protocol": self.generate_recovery_plan(athlete_profile, primary_bottlenecks),
        }

    def _build_deterministic_pathway(
        self,
        athlete_profile: Dict[str, Any],
        primary_bottlenecks: List[Dict[str, Any]],
        days_per_week: int,
        session_mins: int,
        exp: str,
    ) -> List[Dict[str, Any]]:
        """
        Assembles 4 progressive weeks using real exercise records from ExerciseService.
        """
        top_attr = primary_bottlenecks[0].get("attribute", "explosive_capacity")

        # Session distribution mapped to primary bottleneck
        session_types_map = {
            "explosive_capacity": ["Plyometric", "Speed", "Strength", "Agility", "Speed", "Recovery"],
            "knee_stability": ["Strength", "Mobility", "Strength", "Agility", "Strength", "Recovery"],
            "hip_mobility": ["Mobility", "Strength", "Mobility", "Agility", "Strength", "Recovery"],
            "upper_body_posture": ["Strength", "Mobility", "Strength", "Speed", "Strength", "Recovery"],
            "movement_symmetry": ["Strength", "Agility", "Plyometric", "Strength", "Speed", "Recovery"],
            "balance": ["Strength", "Agility", "Mobility", "Plyometric", "Strength", "Recovery"],
        }
        session_types = session_types_map.get(
            top_attr, ["Strength", "Speed", "Agility", "Plyometric", "Strength", "Recovery"]
        )

        week_themes = [
            "Phase 1: Movement Quality & Foundational Mechanics",
            "Phase 2: Load Accumulation & Dynamic Control",
            "Phase 3: Rate of Force Development & Peak Output",
            "Phase 4: Consolidation, Sport Integration & Reassessment",
        ]

        weeks = []
        for week_num in range(1, 5):
            sessions = []
            for day_idx in range(days_per_week):
                s_type = session_types[day_idx % len(session_types)]
                session_data = self.exercises.build_session_exercises(
                    session_type=s_type,
                    primary_bottlenecks=primary_bottlenecks,
                    experience_level=exp,
                    session_duration_minutes=session_mins,
                    athlete_context=athlete_profile,
                )

                # Progressive intensity scaling across 4 weeks
                exercises = []
                for ex in session_data["main_exercises"]:
                    ex_copy = dict(ex)
                    if week_num == 1:
                        ex_copy["intensity_level"] = "Medium"
                    elif week_num == 2:
                        ex_copy["intensity_level"] = "Medium-High"
                    elif week_num == 3:
                        ex_copy["intensity_level"] = "High"
                        ex_copy["sets"] = ex_copy.get("sets", 3) + (1 if exp == "advanced" else 0)
                    elif week_num == 4:
                        ex_copy["intensity_level"] = "Max Precision"
                    exercises.append(ex_copy)

                sessions.append(
                    {
                        "day": day_idx + 1,
                        "session_name": f"{s_type} Focus — Week {week_num}",
                        "type": s_type,
                        "duration_minutes": session_mins,
                        "rationale": f"Targets {top_attr.replace('_', ' ')} progression through {s_type.lower()} stimulus.",
                        "warmup": session_data["warmup"],
                        "main_exercises": exercises,
                        "cooldown": session_data["cooldown"],
                        "recovery_notes": f"Week {week_num} session. Log RPE and recovery status post-workout.",
                    }
                )

            weeks.append(
                {
                    "week_number": week_num,
                    "week_theme": week_themes[week_num - 1],
                    "sessions": sessions,
                }
            )

        return weeks

    def _attempt_llm_synthesis(
        self,
        athlete_profile: Dict[str, Any],
        bottlenecks: List[Dict[str, Any]],
        strengths: List[Dict[str, Any]],
        base_weeks: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """
        Calls Ollama to enhance plan summary and coaching cues without inventing exercises.
        """
        sport = athlete_profile.get("sport", "cricket")
        role = athlete_profile.get("primary_role") or athlete_profile.get("role", "batsman")
        exp = athlete_profile.get("experience_level", "intermediate")
        goals = athlete_profile.get("development_objectives") or athlete_profile.get("goals") or []

        bottleneck_lines = [
            f"  - {b.get('name', b.get('attribute'))}: Score {b.get('score')}/100 (Benchmark: {b.get('benchmark')}). {b.get('role_relevance_explanation', '')}"
            for b in bottlenecks[:3]
        ]
        strength_lines = [
            f"  - {s.get('name', s.get('attribute'))}: Score {s.get('score')}/100 (Above benchmark)"
            for s in strengths[:3]
        ]

        prompt = f"""You are a world-class athletic performance director. Synthesize a 4-week coaching pathway using ONLY the structured athlete profile and catalog plan below:

Athlete Profile:
Sport: {sport.title()} | Role: {role.replace('_', ' ').title()} | Level: {exp.title()}
Goals: {', '.join(goals) if goals else 'Role Performance Optimization'}

Verified Development Priorities (Bottlenecks):
{chr(10).join(bottleneck_lines) or '  - General Athletic Progression'}

Key Strengths (Preserve & Reinforce):
{chr(10).join(strength_lines) or '  - Movement baseline stable'}

Ground-Truth Catalog Plan Structure:
- 4 weeks, {len(base_weeks[0]['sessions'])} sessions per week.

Strict Rules:
- Do NOT invent ungrounded exercises; preserve the catalog exercise names.
- Do NOT prescribe corrective work for identified Key Strengths.
- Return ONLY valid JSON:
{{
  "plan_title": "string",
  "plan_summary": "3-sentence clear summary of development pathway",
  "primary_focus_attributes": ["{bottlenecks[0].get('attribute', 'explosive_capacity') if bottlenecks else 'general'}"],
  "weeks": [
    {{
      "week_number": 1,
      "week_theme": "string",
      "sessions": [
        {{
          "day": 1,
          "session_name": "string",
          "type": "Strength|Speed|Agility|Mobility|Plyometric|Recovery",
          "duration_minutes": {athlete_profile.get('session_duration_minutes', 60)},
          "rationale": "specific connection to {role} in {sport}",
          "warmup": ["warmup 1", "warmup 2"],
          "main_exercises": [
            {{
              "name": "{base_weeks[0]['sessions'][0]['main_exercises'][0]['name']}",
              "sets": 3,
              "reps": "8-10",
              "intensity_level": "Medium",
              "rest_seconds": 90,
              "coaching_cue": "specific biomechanical cue",
              "targets_bottleneck": "{bottlenecks[0].get('attribute', 'knee_stability') if bottlenecks else 'general'}"
            }}
          ],
          "cooldown": ["cooldown 1", "cooldown 2"],
          "recovery_notes": "string"
        }}
      ]
    }}
  ]
}}"""

        for model in [OLLAMA_MODEL, OLLAMA_FALLBACK_MODEL]:
            try:
                response = self.client.chat(
                    model=model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are an elite sports coach. Respond ONLY with valid JSON. "
                                "Never invent unobserved flaws or ungrounded exercises."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    options={"temperature": 0.2, "num_predict": 4096},
                )
                raw = response["message"]["content"].strip()
                raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip()
                raw = re.sub(r"```$", "", raw, flags=re.MULTILINE).strip()
                m = re.search(r"\{.*\}", raw, re.DOTALL)
                if m:
                    plan = json.loads(m.group())
                    if "weeks" in plan and len(plan["weeks"]) >= 1:
                        # Ensure full 4 weeks are present (if LLM truncated, merge with catalog base)
                        if len(plan["weeks"]) < 4:
                            plan["weeks"] = base_weeks
                        plan["_source"] = f"ollama:{model}"
                        plan["recovery_protocol"] = self.generate_recovery_plan(athlete_profile, bottlenecks)
                        return plan
            except Exception:
                continue

        return None

    def generate_recovery_plan(
        self,
        athlete_profile: Dict[str, Any],
        bottlenecks: Optional[List[Dict[str, Any]]] = None,
        recent_sessions_load: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generates dynamic recovery protocols connected to the athlete's actual training load and context.
        """
        sport = athlete_profile.get("sport", "cricket")
        role = athlete_profile.get("primary_role") or athlete_profile.get("role", "athlete")
        top_focus = (
            bottlenecks[0].get("attribute", "").replace("_", " ")
            if bottlenecks
            else "general conditioning"
        )

        # Evaluate recent training context if available
        avg_rpe = recent_sessions_load.get("avg_rpe", 6.0) if recent_sessions_load else 6.0
        total_minutes = recent_sessions_load.get("total_minutes_week", 240) if recent_sessions_load else 240
        is_high_load = avg_rpe >= 7.5 or total_minutes >= 300

        habits = [
            "Sleep 8–9 hours per night with consistent sleep/wake times for CNS restoration.",
            f"Hydrate: 35 ml/kg bodyweight daily + 500 ml per training session for {sport.title()}.",
            "Post-workout window: 25–35g high-quality protein + complex carbohydrates within 45 min.",
        ]

        if is_high_load:
            habits.insert(
                0,
                "⚠️ High training strain detected (Average RPE ≥ 7.5) — prioritize active recovery and +30 min extra sleep.",
            )

        active_recovery = [
            {
                "name": "Targeted Soft Tissue Release",
                "duration_minutes": 15,
                "exercises": [
                    "Thoracic spine roller extension (2 min)",
                    "Hamstring and glute foam rolling (2 min each side)",
                    "IT band and quad release (2 min each side)",
                    "Calf and Achilles soft rolling (2 min each side)",
                ],
                "when": "Post-session or evening before bed",
            },
            {
                "name": f"Dynamic Mobility Flow ({top_focus.title()} Focus)",
                "duration_minutes": 20,
                "exercises": [
                    "90/90 hip stretch with forward hinge (90s each side)",
                    "World's greatest stretch with thoracic reach (5 reps each side)",
                    "Deep goblet squat hold with breath expansion (60s hold)",
                    "Cat-cow with spinal segmentation (10 cycles)",
                ],
                "when": "On scheduled recovery / rest days",
            },
        ]

        return {
            "load_context": {
                "avg_recent_rpe": avg_rpe,
                "total_weekly_minutes": total_minutes,
                "strain_status": "High Strain" if is_high_load else "Optimal Adaptation",
            },
            "daily_habits": habits,
            "active_recovery_sessions": active_recovery,
            "weekly_recovery_schedule": {
                "day_1": "Post-workout 10-min soft tissue flush + hydration",
                "day_2": "Active recovery: 20-min low-intensity bike or swim (Zone 1)",
                "day_3": f"Mobility flow targeting {top_focus} restrictions",
                "day_4": "Full nervous system rest + contrast therapy or gentle yoga",
            },
            "injury_prevention_focus": (
                f"Given your priority in {top_focus}, complete 5 minutes of targeted activation "
                f"and prehab before every high-intensity {role.replace('_', ' ')} session."
            ),
        }


plan_generator = PlanGenerator()

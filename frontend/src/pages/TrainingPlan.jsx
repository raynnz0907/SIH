import { useState } from 'react';
import WeeklyCalendar from '../components/plan/WeeklyCalendar';
import SessionCard from '../components/plan/SessionCard';
import { Target, Activity, Calendar } from 'lucide-react';

export default function TrainingPlan() {
  const [activeWeek, setActiveWeek] = useState(1);

  // Mock plan data
  const mockPlan = {
    focusAreas: ['Explosiveness', 'Knee Stability'],
    totalSessions: 16,
    weeks: [
      {
        weekNum: 1,
        days: [
          { day: 'Mon', type: 'strength', completed: true, duration: 45 },
          { day: 'Tue', type: 'plyometrics', completed: false, duration: 60, current: true },
          { day: 'Wed', type: 'rest', completed: false, duration: 0 },
          { day: 'Thu', type: 'agility', completed: false, duration: 45 },
          { day: 'Fri', type: 'strength', completed: false, duration: 50 },
          { day: 'Sat', type: 'sport', completed: false, duration: 90 },
          { day: 'Sun', type: 'rest', completed: false, duration: 0 },
        ]
      },
      // Assume weeks 2, 3, 4 are similarly structured
    ]
  };

  const mockSession = {
    name: 'Power & Stability Focus',
    type: 'plyometrics',
    duration: 60,
    rationale: 'Targets your critical bottleneck in explosiveness while reinforcing knee stability during landing.',
    warmup: '5m Light jog, 5m dynamic stretching (leg swings, lunges).',
    exercises: [
      { name: 'Box Jumps', sets: 4, reps: 5, intensity: 'Max Effort', rest: '90s', cue: 'Focus on soft landing, knees out.' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: 8, intensity: '75% 1RM', rest: '60s', cue: 'Keep torso upright.' },
      { name: 'Broad Jumps', sets: 4, reps: 4, intensity: 'Max Effort', rest: '90s', cue: 'Explode through hips.' },
      { name: 'Single-leg RDL', sets: 3, reps: 10, intensity: 'Moderate', rest: '60s', cue: 'Maintain back flat.' }
    ],
    cooldown: '10m foam rolling (quads, calves), static hamstring stretch.'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Training Plan</h1>
          <p className="text-gray-400 mt-1">4-Week Block • Phase 1</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg border border-subtle">
            <Target className="w-5 h-5 text-danger" />
            <span className="text-sm font-medium">Focus: Explosiveness</span>
          </div>
          <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg border border-subtle">
            <Activity className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium">Focus: Knee Stability</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-subtle rounded-2xl p-6">
        <div className="flex gap-4 mb-6 border-b border-subtle pb-4">
          {[1, 2, 3, 4].map(w => (
            <button 
              key={w}
              onClick={() => setActiveWeek(w)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeWeek === w ? 'bg-primary text-white' : 'text-gray-400 hover:bg-subtle hover:text-white'}`}
            >
              Week {w}
            </button>
          ))}
        </div>
        
        <WeeklyCalendar days={mockPlan.weeks[0].days} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Today's Session
        </h2>
        <SessionCard session={mockSession} />
      </div>
    </div>
  );
}

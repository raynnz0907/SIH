import React, { useState, useEffect } from 'react';
import { useAthleteStore } from '../store/athleteStore';
import { planAPI, progressAPI } from '../api/client';
import {
  DumbbellIcon,
  ClockIcon,
  CheckIcon,
  TargetIcon,
  ZapIcon,
  CalendarIcon,
  FlameIcon,
  PlusIcon,
  ArrowRightIcon,
  CloseIcon,
  InfoIcon,
} from '../components/common/Icons';

export default function TrainingPlan() {
  const currentPlan = useAthleteStore((state) => state.currentPlan);
  const setPlan = useAthleteStore((state) => state.setPlan);
  const profile = useAthleteStore((state) => state.profile);

  const [planData, setPlanData] = useState(currentPlan?.plan_data || null);
  const [loading, setLoading] = useState(!currentPlan);
  const [generating, setGenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedSession, setSelectedSession] = useState(null);

  // Logging Workout Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    session_type: 'Strength',
    duration_minutes: 60,
    perceived_exertion: 7,
    notes: '',
  });
  const [loggingSuccess, setLoggingSuccess] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await planAPI.getCurrent();
        if (res) {
          setPlan(res);
          setPlanData(res.plan_data);
        }
      } catch (err) {
        console.log('No active plan found, generating initial plan...');
        handleGeneratePlan();
      } finally {
        setLoading(false);
      }
    }
    if (!currentPlan) {
      fetchPlan();
    } else {
      setPlanData(currentPlan.plan_data);
      setLoading(false);
    }
  }, [currentPlan, setPlan]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await planAPI.generate();
      setPlan(res);
      setPlanData(res.plan_data);
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenLogModal = (session) => {
    setSelectedSession(session);
    setLogForm({
      session_type: session?.type || 'Strength',
      duration_minutes: session?.duration_minutes || profile?.session_duration_minutes || 60,
      perceived_exertion: 7,
      notes: `Completed ${session?.session_name || 'scheduled workout'}.`,
    });
    setLoggingSuccess(false);
    setIsLogModalOpen(true);
  };

  const handleSubmitLog = async (e) => {
    e?.preventDefault();
    try {
      await progressAPI.logSession({
        session_date: new Date().toISOString().split('T')[0],
        session_type: logForm.session_type,
        duration_minutes: Number(logForm.duration_minutes),
        perceived_exertion: Number(logForm.perceived_exertion),
        notes: logForm.notes,
        completed: true,
      });
      setLoggingSuccess(true);
      setTimeout(() => {
        setIsLogModalOpen(false);
        setLoggingSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          {generating ? 'Synthesizing 4-Week Pathway from Exercise Library...' : 'Loading Training Pathway...'}
        </p>
      </div>
    );
  }

  const weeks = planData?.weeks || [];
  const currentWeekData = weeks.find((w) => w.week_number === selectedWeek) || weeks[0];
  const sessions = currentWeekData?.sessions || [];

  return (
    <div className="space-y-8 select-none">
      {/* ── TOP HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="sportify-card p-5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold font-tech text-white tracking-[0.2em] uppercase px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15">
                4-Week Development Pathway
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">
                {profile?.sport || 'Cricket'} • {profile?.sub_role?.replace(/_/g, ' ') || profile?.primary_role || 'Athlete'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-wide uppercase text-white">
              {planData?.plan_title || 'Personalized Training Pathway'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
              {planData?.plan_summary || 'Targeted progressive overload calibrated to your development priorities.'}
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="btn-secondary text-xs px-4 py-2.5 flex items-center justify-center gap-2 w-full active-press"
          >
            <ZapIcon className="w-3.5 h-3.5 text-slate-300" />
            <span>Regenerate Pathway</span>
          </button>
        </div>
      </div>

      {/* ── 4-WEEK PHASE SELECTOR TABS ─────────────────────────────────────── */}
      <div className="grid grid-cols-4 p-1 rounded-xl bg-white/[0.04] border border-white/10 gap-1">
        {weeks.map((wk) => {
          const active = selectedWeek === wk.week_number;
          return (
            <button
              key={wk.week_number}
              type="button"
              onClick={() => setSelectedWeek(wk.week_number)}
              className={`py-1.5 px-1 rounded-lg text-center transition-all active-press ${
                active
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-[11px] font-bold font-tech uppercase">
                W0{wk.week_number}
              </div>
              <div className="text-[9px] font-mono truncate opacity-75">
                {wk.sessions?.length || 4} sess
              </div>
            </button>
          );
        })}
      </div>

      {/* ── SESSIONS LIST FOR SELECTED WEEK ────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xs font-bold font-heading tracking-wider uppercase text-white">
            {currentWeekData?.week_theme || `Week ${selectedWeek} Schedule`}
          </h2>
          <p className="text-[10px] text-slate-400 font-sans">
            Calibrated against verified exercise library catalog.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sessions.map((session, idx) => (
            <div
              key={idx}
              className="sportify-card p-3.5 border-white/[0.08] space-y-3 hover:border-white/20 transition-all"
            >
              {/* Session Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center text-white font-bold font-mono text-xs shrink-0">
                    D{session.day || idx + 1}
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-white font-heading truncate">
                      {session.session_name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans truncate">
                      {session.rationale}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.06] shrink-0">
                  <ClockIcon className="w-3 h-3 text-slate-300" />
                  <span>{session.duration_minutes || 60}m</span>
                </div>
              </div>

              {/* Main Exercises List */}
              <div className="space-y-1.5">
                {session.main_exercises?.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white font-tech truncate">
                        {ex.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/15 text-slate-200 shrink-0">
                        {ex.sets} × {ex.reps}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>Rest: {ex.rest_seconds || 90}s</span>
                      <span className="uppercase text-slate-300">
                        {ex.targets_bottleneck?.replace(/_/g, ' ') || 'Strength'}
                      </span>
                    </div>

                    {ex.coaching_cue && (
                      <p className="text-[10px] text-slate-400 italic font-sans border-l border-white/15 pl-1.5 mt-1">
                        "{ex.coaching_cue}"
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Warmup & Cooldown Summary */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-white/[0.01] border border-white/[0.04]">
                  <span className="font-tech text-slate-300 uppercase block font-bold mb-0.5">
                    Warm-Up
                  </span>
                  <p className="text-slate-400 truncate">
                    {session.warmup?.join(' • ') || '5m dynamic prep'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.01] border border-white/[0.04]">
                  <span className="font-tech text-emerald-400 uppercase block font-bold mb-0.5">
                    Cool-Down
                  </span>
                  <p className="text-slate-400 truncate">
                    {session.cooldown?.join(' • ') || 'Static flush & reset'}
                  </p>
                </div>
              </div>

              {/* Log Button */}
              <button
                type="button"
                onClick={() => handleOpenLogModal(session)}
                className="w-full h-10 btn-primary text-xs flex items-center justify-center gap-1.5 active-press"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── LOG WORKOUT MODAL ──────────────────────────────────────────────── */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="sportify-card max-w-md w-full p-4.5 rounded-t-2xl sm:rounded-2xl border-white/[0.1] shadow-2xl relative max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold font-heading uppercase tracking-wide text-white">
                  Log Completed Session
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  {selectedSession?.session_name || 'Workout Logging'}
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {loggingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white font-heading">
                  Workout Successfully Logged!
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Workload index & streak metrics updated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLog} className="space-y-4">
                <div>
                  <label className="text-xs font-bold font-tech uppercase text-slate-400 block mb-1">
                    Session Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={logForm.duration_minutes}
                    onChange={(e) =>
                      setLogForm({ ...logForm, duration_minutes: e.target.value })
                    }
                    className="w-full sportify-input text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold font-tech uppercase text-slate-400 mb-1">
                    <span>Perceived Exertion (RPE)</span>
                    <span className="text-white font-mono text-sm">{logForm.perceived_exertion} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={logForm.perceived_exertion}
                    onChange={(e) =>
                      setLogForm({ ...logForm, perceived_exertion: e.target.value })
                    }
                    className="w-full accent-white cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1 (Light)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Max Effort)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold font-tech uppercase text-slate-400 block mb-1">
                    Session Notes
                  </label>
                  <textarea
                    rows={3}
                    value={logForm.notes}
                    onChange={(e) =>
                      setLogForm({ ...logForm, notes: e.target.value })
                    }
                    placeholder="How did movement mechanics and power output feel?"
                    className="w-full sportify-input text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="w-1/3 py-3 rounded-xl btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-xl btn-primary text-xs flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Confirm & Persist Log</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

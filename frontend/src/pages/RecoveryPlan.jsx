import React, { useState, useEffect } from 'react';
import { useAthleteStore } from '../store/athleteStore';
import { planAPI } from '../api/client';
import {
  ShieldIcon,
  HeartPulseIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  ZapIcon,
  TargetIcon,
  FlameIcon,
} from '../components/common/Icons';

export default function RecoveryPlan() {
  const profile = useAthleteStore((state) => state.profile);
  const [recoveryData, setRecoveryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecovery() {
      try {
        const res = await planAPI.getRecovery();
        if (res) setRecoveryData(res);
      } catch (err) {
        console.error('Failed to load recovery protocol:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecovery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Calculating Load Strain & Recovery Protocols...
        </p>
      </div>
    );
  }

  const loadContext = recoveryData?.load_context || {};
  const isHighStrain = loadContext.strain_status === 'High Strain';
  const habits = recoveryData?.daily_habits || [];
  const activeSessions = recoveryData?.active_recovery_sessions || [];
  const schedule = recoveryData?.weekly_recovery_schedule || {};
  const injuryPrehab = recoveryData?.injury_prevention_focus;

  return (
    <div className="space-y-3.5 select-none">
      {/* ── TOP HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="sportify-card p-4 relative overflow-hidden">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold font-tech text-emerald-400 tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/25">
              Recovery Center
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {loadContext.strain_status || 'Optimal Adaptation'}
            </span>
          </div>

          <div>
            <h1 className="text-base font-extrabold font-heading tracking-tight uppercase text-white">
              Strain Diagnostics & Restoration
            </h1>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-0.5">
              Recovery protocols calculated from your recent session volume and average RPE.
            </p>
          </div>

          <div
            className={`p-2.5 rounded-xl border text-center ${
              isHighStrain
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            <div className="text-[9px] font-tech uppercase tracking-wider text-slate-400">
              Current Load State
            </div>
            <div
              className={`text-base font-bold font-mono ${
                isHighStrain ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {loadContext.strain_status || 'Optimal'}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Avg RPE: {loadContext.avg_recent_rpe?.toFixed(1) || 6.0} • {loadContext.total_weekly_minutes || 240} Mins
            </div>
          </div>
        </div>
      </div>

      {/* ── DAILY RESTORATION HABITS & INJURY PREHAB ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Daily Habits */}
        <div className="sportify-card p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-heading tracking-wide uppercase text-white">
              Daily Restoration Habits
            </h3>
            <span className="text-[9px] font-mono text-slate-400">
              {habits.length} Habits
            </span>
          </div>

          <div className="space-y-1.5">
            {habits.map((habit, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-start gap-2 text-[11px] text-slate-200"
              >
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug font-sans">{habit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Injury Prehab Card */}
        <div className="sportify-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold font-tech text-amber-400 uppercase tracking-widest">
              Prehab Focus
            </span>
            <TargetIcon className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h3 className="text-xs font-bold font-heading tracking-wide uppercase text-white">
            Joint Activation & Defense
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            {injuryPrehab ||
              'Complete 5 minutes of targeted stabilization and dynamic mobilization before high-intensity sessions.'}
          </p>
        </div>
      </div>

      {/* ── ACTIVE RECOVERY SESSIONS ───────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold font-heading tracking-wider uppercase text-white">
          Active Recovery Protocols
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeSessions.map((session, idx) => (
            <div key={idx} className="sportify-card p-3.5 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h4 className="text-xs font-bold text-white font-heading">
                  {session.name}
                </h4>
                <span className="text-xs font-mono text-slate-200 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/15">
                  {session.duration_minutes} Mins
                </span>
              </div>

              <div className="space-y-2">
                {session.exercises?.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300 font-sans"
                  >
                    • {ex}
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Timing: {session.when}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WEEKLY SCHEDULE ────────────────────────────────────────────────── */}
      <div className="sportify-card p-4 space-y-2">
        <h3 className="text-xs font-bold font-heading tracking-wide uppercase text-white">
          Weekly Recovery Schedule
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {Object.keys(schedule).map((dayKey) => (
            <div
              key={dayKey}
              className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]"
            >
              <span className="text-[9px] font-bold font-tech text-slate-400 uppercase tracking-widest block mb-0.5">
                {dayKey.replace(/_/g, ' ')}
              </span>
              <p className="text-[11px] text-slate-300 leading-snug font-sans truncate">
                {schedule[dayKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

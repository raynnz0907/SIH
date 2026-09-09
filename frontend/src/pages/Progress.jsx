import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { progressAPI } from '../api/client';
import { normalizeSport } from '../config/sportAssessmentConfig';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CheckIcon,
  TargetIcon,
  CalendarIcon,
  FlameIcon,
  ZapIcon,
  ShieldIcon,
  ArrowRightIcon,
  ClockIcon,
  DumbbellIcon,
  ActivityIcon,
} from '../components/common/Icons';

export default function Progress() {
  const profile = useAthleteStore((state) => state.profile);
  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  const [dashboardData, setDashboardData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [reassessment, setReassessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reassessment'); // 'reassessment' | 'history'

  useEffect(() => {
    async function loadProgress() {
      try {
        const [dashRes, logsRes, reassessRes] = await Promise.all([
          progressAPI.getDashboard().catch(() => null),
          progressAPI.getLogs(30).catch(() => []),
          progressAPI.getReassessment().catch(() => null),
        ]);

        if (dashRes) setDashboardData(dashRes);
        if (logsRes) setLogs(logsRes);
        if (reassessRes) setReassessment(reassessRes);
      } catch (err) {
        console.error('Failed to load progress data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Calculating Longitudinal Metric Trends...
        </p>
      </div>
    );
  }

  const scoreTrends = dashboardData?.score_trends || {};
  const stats = dashboardData?.training_stats || {};

  return (
    <div className="space-y-3.5 select-none">
      {/* ── TOP HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="sportify-card p-4 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-start gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold font-tech text-white tracking-[0.18em] uppercase px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/15">
                Longitudinal Telemetry
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {reassessment?.overall_trajectory || 'Baseline Tracking'}
              </span>
            </div>
            <h1 className="text-base font-extrabold font-heading tracking-tight uppercase text-white">
              Progress & Reassessment Loop
            </h1>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-0.5">
              Track persisted workload metrics, compare consecutive assessments, and verify deficit resolutions.
            </p>
          </div>

          <Link to={assessmentPath} className="btn-primary text-xs w-full h-10 flex items-center justify-center gap-2 active-press">
            <ZapIcon className="w-3.5 h-3.5" />
            <span>Complete Reassessment</span>
          </Link>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/[0.06]">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <FlameIcon className="w-3 h-3 text-amber-400" />
              <span className="font-tech font-medium uppercase tracking-wider">Streak</span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              {stats.streak_days || 0} <span className="text-[10px] font-normal text-slate-400">Days</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <CalendarIcon className="w-3 h-3 text-slate-300" />
              <span className="font-tech font-medium uppercase tracking-wider">Workouts</span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              {stats.total_sessions || logs.length || 0}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <TargetIcon className="w-3 h-3 text-rose-400" />
              <span className="font-tech font-medium uppercase tracking-wider">Workload</span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              {stats.total_workload ? stats.total_workload.toFixed(0) : '0'}{' '}
              <span className="text-[10px] font-normal text-slate-400">AU</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <TrendingUpIcon className="w-3 h-3 text-emerald-400" />
              <span className="font-tech font-medium uppercase tracking-wider">Avg Delta</span>
            </div>
            <p className="text-base font-bold font-mono text-emerald-400">
              {reassessment?.average_delta ? `+${reassessment.average_delta.toFixed(1)}` : '0.0'}{' '}
              <span className="text-[10px] font-normal text-slate-400">Pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── TAB SELECTOR: REASSESSMENT VS SESSION LOGS ──────────────────────── */}
      <div className="p-1 rounded-xl bg-white/[0.04] border border-white/10 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('reassessment')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold font-tech uppercase tracking-wide transition-all active-press text-center truncate ${
            activeTab === 'reassessment'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Delta Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold font-tech uppercase tracking-wide transition-all active-press text-center truncate ${
            activeTab === 'history'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Session Logs ({logs.length})
        </button>
      </div>

      {/* ── REASSESSMENT COMPARISON VIEW ────────────────────────────────────── */}
      {activeTab === 'reassessment' && (
        <div className="space-y-3">
          {reassessment ? (
            <div className="space-y-3">
              {/* Trajectory Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-white/[0.02] to-transparent border border-emerald-400/25 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold font-tech text-emerald-400 uppercase tracking-widest block">
                    Longitudinal Result
                  </span>
                  <h3 className="text-xs font-bold font-heading uppercase text-white">
                    Trajectory: {reassessment.overall_trajectory}
                  </h3>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-xs">
                  +{reassessment.average_delta} Pts
                </div>
              </div>

              {/* Improved vs Resolved Bottlenecks Grid */}
              <div className="space-y-3">
                {/* Metric Delta Breakdown */}
                <div className="sportify-card p-4 space-y-2">
                  <h3 className="text-xs font-bold font-heading uppercase tracking-wide text-white">
                    Metric Delta Breakdown
                  </h3>
                  <div className="space-y-1.5">
                    {Object.keys(reassessment.metric_deltas || {}).map((key) => {
                      const m = reassessment.metric_deltas[key];
                      const isUp = m.delta > 0;
                      return (
                        <div
                          key={key}
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-slate-200 font-tech">
                              {m.name}
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              Prev: {m.previous_score} → Curr: {m.current_score}
                            </div>
                          </div>
                          <div
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              isUp
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/[0.04] text-slate-400'
                            }`}
                          >
                            {isUp ? `+${m.delta}` : m.delta} Pts
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resolved Bottlenecks & Emerging Priorities */}
                <div className="sportify-card p-4 space-y-3">
                  {/* Resolved */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold font-heading uppercase tracking-wide text-white">
                      Resolved Bottlenecks
                    </h3>
                    <div className="space-y-1">
                      {reassessment.resolved_bottlenecks?.length > 0 ? (
                        reassessment.resolved_bottlenecks.map((item) => (
                          <div
                            key={item.attribute}
                            className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-bold text-emerald-200 font-tech"
                          >
                            <span>{item.name}</span>
                            <span className="text-[10px] font-mono text-emerald-400">
                              Target Reached ({item.new_score}/100)
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-500 font-sans">
                          Complete further training blocks to resolve deficits.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Emerging Priorities */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <h3 className="text-xs font-bold font-heading uppercase tracking-wide text-white">
                      Emerging Priorities
                    </h3>
                    <div className="space-y-1">
                      {reassessment.emerging_priorities?.length > 0 ? (
                        reassessment.emerging_priorities.map((item) => (
                          <div
                            key={item.attribute}
                            className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs font-bold text-rose-200 font-tech"
                          >
                            <span>{item.name || item.attribute}</span>
                            <span className="text-[10px] font-mono text-rose-400">
                              Gap: -{item.gap} Pts
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-500 font-sans">
                          All attributes meet target benchmarks.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 py-6 text-center rounded-2xl sportify-card space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/20 flex items-center justify-center mx-auto text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                <ActivityIcon className="w-5 h-5" />
              </div>
              <div className="max-w-xs mx-auto">
                <h3 className="text-sm font-bold font-heading uppercase tracking-wide text-white">
                  Requires 2+ Assessments
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Complete your initial and 4-week follow-up assessments to view automated delta curves and bottleneck resolution tracking.
                </p>
              </div>
              <Link to={assessmentPath} className="w-full h-11 btn-primary text-xs flex items-center justify-center gap-2">
                <span>Record Reassessment Video</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── PERSISTED SESSION HISTORY VIEW ─────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="sportify-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-heading uppercase tracking-wide text-white">
              Persisted Training Logs
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              {logs.length} Recorded
            </span>
          </div>

          <div className="space-y-2">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center text-white font-bold text-xs font-tech shrink-0">
                      {log.session_type?.charAt(0) || 'W'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white font-tech truncate">
                        {log.session_type} Session
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-sans truncate">
                        {log.session_date} • {log.notes || 'Workout completed'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                    <span className="text-slate-400">{log.duration_minutes}m</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300">
                      RPE {log.perceived_exertion}
                    </span>
                    <span className="text-slate-200 font-bold">
                      {log.workload_index?.toFixed(0) || log.duration_minutes * log.perceived_exertion} AU
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6 font-sans">
                No workouts logged yet. Complete workouts in your Training Pathway to build your longitudinal log.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

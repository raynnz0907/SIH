import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { progressAPI, planAPI, intakeAPI } from '../api/client';
import { normalizeSport } from '../config/sportAssessmentConfig';
import BenchmarkBar from '../components/common/BenchmarkBar';
import {
  StrengthIcon,
  ProficientIcon,
  DevAreaIcon,
  CriticalIcon,
  TargetIcon,
  FlameIcon,
  ZapIcon,
  ClockIcon,
  DumbbellIcon,
  ArrowRightIcon,
  ShieldIcon,
  RefreshIcon,
  PlusIcon,
  CalendarIcon,
  TrendingUpIcon,
} from '../components/common/Icons';

export default function Dashboard() {
  const navigate = useNavigate();
  const athlete = useAthleteStore((state) => state.athlete);
  const profile = useAthleteStore((state) => state.profile);
  const setProfile = useAthleteStore((state) => state.setProfile);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [activeTier, setActiveTier] = useState('bottlenecks');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [dashRes, planRes, profRes] = await Promise.all([
          progressAPI.getDashboard().catch(() => null),
          planAPI.getCurrent().catch(() => null),
          intakeAPI.getProfile().catch(() => null),
        ]);

        if (dashRes) setDashboardData(dashRes);
        if (planRes) setCurrentPlan(planRes);
        if (profRes) setProfile(profRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [setProfile]);

  const devProfile = dashboardData?.development_profile || {};
  const strengths = devProfile.strengths || [];
  const proficient = devProfile.proficient || [];
  const devAreas = devProfile.development_areas || [];
  const bottlenecks = devProfile.critical_bottlenecks || [];
  const trainingStats = dashboardData?.training_stats || {};
  const recovery = dashboardData?.recovery_recommendation || {};

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  const sportTitle = profile?.sport ? profile.sport.toUpperCase() : 'SPORTIFY';
  const roleTitle = profile?.sub_role
    ? profile.sub_role.replace(/_/g, ' ')
    : profile?.primary_role || 'Athlete';

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
          Syncing Biomechanical Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 select-none">
      {/* ── TOP HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="sportify-card p-4 relative overflow-hidden">
        {/* Subtle specular sheen */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-radial-gradient from-white/[0.04] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold font-tech text-white tracking-[0.16em] uppercase px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/15">
                {sportTitle} • {roleTitle}
              </span>
              <span className="text-[10px] font-mono text-slate-400 capitalize">
                {profile?.experience_level || 'Intermediate'}
              </span>
            </div>
            <h1 className="text-lg font-extrabold font-heading tracking-tight text-white uppercase leading-snug">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {athlete?.full_name || athlete?.name || 'Athlete'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Calibrated against {sportTitle.toLowerCase()} {roleTitle} demands.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <Link
              to={assessmentPath}
              className="flex-1 btn-primary text-xs h-10 flex items-center justify-center gap-1.5 active-press"
            >
              <ZapIcon className="w-3.5 h-3.5" />
              <span>Record</span>
            </Link>
            <Link
              to="/plan"
              className="flex-1 btn-secondary text-xs h-10 flex items-center justify-center gap-1.5 active-press"
            >
              <DumbbellIcon className="w-3.5 h-3.5" />
              <span>Training</span>
            </Link>
          </div>
        </div>

        {/* Telemetry Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <FlameIcon className="w-3 h-3 text-amber-400" />
              <span className="font-tech font-medium uppercase tracking-wider">Streak</span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              {trainingStats.streak_days || 0}{' '}
              <span className="text-[10px] font-normal text-slate-400">Days</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <CalendarIcon className="w-3 h-3 text-slate-300" />
              <span className="font-tech font-medium uppercase tracking-wider">Sessions</span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              {trainingStats.total_sessions || 0}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <TargetIcon className="w-3 h-3 text-rose-400" />
              <span className="font-tech font-medium uppercase tracking-wider">Avg RPE</span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              {trainingStats.avg_rpe ? trainingStats.avg_rpe.toFixed(1) : '0.0'}{' '}
              <span className="text-[10px] font-normal text-slate-400">/ 10</span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
              <ShieldIcon className="w-3 h-3 text-emerald-400" />
              <span className="font-tech font-medium uppercase tracking-wider">Recovery</span>
            </div>
            <p className="text-xs font-bold font-tech text-emerald-400 truncate uppercase tracking-wider mt-0.5">
              {recovery?.load_context?.strain_status || 'Optimal'}
            </p>
          </div>
        </div>
      </div>

      {/* ── TODAY'S PERFORMANCE FOCUS ────────────────────────────────────────── */}
      <div className="sportify-card p-4 border-white/10 bg-white/[0.02] space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[9px] font-bold font-tech uppercase tracking-wider">
            Today's Priority Focus
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Calibrated for {roleTitle}
          </span>
        </div>
        <h3 className="text-sm font-bold font-heading text-white leading-snug">
          {normalizedSport === 'cricket' && (profile?.primary_role === 'bowler' ? 'Bowling Power & Deceleration Baseline' : 'Front-Foot Drive Mechanics')}
          {normalizedSport === 'football' && (profile?.primary_role === 'goalkeeper' ? 'Aerial Elevation & Shock Attenuation Baseline' : 'Striking & Ball Impact Deceleration')}
          {normalizedSport === 'basketball' && (['center', 'power_forward'].includes(profile?.primary_role) ? 'Interior Elevation & Rebound Landing Baseline' : 'Jump Shot Verticality & Release Mechanics')}
          {normalizedSport === 'athletics' && (['jumper', 'thrower'].includes(profile?.primary_role) ? 'Elastic Force Production & Mobility Baseline' : 'Sprint Acceleration Drive & Stride Rhythm')}
        </h3>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          {normalizedSport === 'cricket' && (profile?.primary_role === 'bowler' ? 'Complete your lower-body power baseline (Vertical Jump) to calibrate shock attenuation against bowling delivery loads.' : 'Evaluate head-over-ball weight transfer and front-knee brace stability on front-foot drives.')}
          {normalizedSport === 'football' && (profile?.primary_role === 'goalkeeper' ? 'Establish your vertical impulse and bilateral landing deceleration for aerial cross claims.' : 'Analyze plant-knee stability under load, hip rotational whip, and forward torso control.')}
          {normalizedSport === 'basketball' && (['center', 'power_forward'].includes(profile?.primary_role) ? 'Measure explosive vertical displacement and bilateral knee landing control for paint contests.' : 'Assess shooting elbow verticality, jump elevation height, and balanced two-foot landing.')}
          {normalizedSport === 'athletics' && (['jumper', 'thrower'].includes(profile?.primary_role) ? 'Establish lower-limb stretch-shortening cycle power and hip mobility foundations.' : 'Analyze linear acceleration drive angle, high lead-knee punch, and stride cadence symmetry.')}
        </p>

        <Link
          to={assessmentPath}
          className="btn-primary text-xs w-full h-11 flex items-center justify-center gap-2 uppercase tracking-wider mt-2.5 active-press"
        >
          <ZapIcon className="w-4 h-4" />
          <span>Launch Studio</span>
        </Link>
      </div>

      {/* ── 4-TIER DEVELOPMENT INTELLIGENCE GRID ───────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold font-heading tracking-wider uppercase text-white">
              Development Matrix
            </h2>
            <p className="text-[10px] text-slate-400">
              Evaluated against verified {roleTitle} demands.
            </p>
          </div>
          <Link
            to={assessmentPath}
            className="text-[10px] font-semibold text-slate-300 hover:text-white font-tech tracking-wider uppercase flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/10 bg-white/[0.03] active-press"
          >
            <span>Reassess</span>
            <ArrowRightIcon className="w-2.5 h-2.5" />
          </Link>
        </div>

        {/* 4-Pill Segmented Selector */}
        <div className="grid grid-cols-4 p-1 rounded-xl bg-white/[0.04] border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setActiveTier('bottlenecks')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold font-tech uppercase tracking-tight text-center truncate transition-all active-press ${
              activeTier === 'bottlenecks'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deficit ({bottlenecks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTier('devAreas')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold font-tech uppercase tracking-tight text-center truncate transition-all active-press ${
              activeTier === 'devAreas'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Areas ({devAreas.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTier('proficient')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold font-tech uppercase tracking-tight text-center truncate transition-all active-press ${
              activeTier === 'proficient'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Target ({proficient.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTier('strengths')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold font-tech uppercase tracking-tight text-center truncate transition-all active-press ${
              activeTier === 'strengths'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Strong ({strengths.length})
          </button>
        </div>

        {/* Active Tier Display Card */}
        {activeTier === 'bottlenecks' && (
          <div className="sportify-card p-3.5 border-rose-500/25 bg-rose-500/[0.02] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-tech text-rose-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <CriticalIcon className="w-3.5 h-3.5" />
                Critical Deficits
              </span>
              <span className="font-mono">{bottlenecks.length} items</span>
            </div>
            <div className="space-y-2">
              {bottlenecks.length > 0 ? (
                bottlenecks.map((item) => (
                  <BenchmarkBar
                    key={item.attribute}
                    name={item.name || item.attribute.replace(/_/g, ' ')}
                    score={item.score}
                    benchmark={item.benchmark || 80}
                    gap={item.gap !== undefined ? (item.gap > 0 ? -item.gap : item.gap) : -12}
                    tier="bottleneck"
                  />
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-emerald-300">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <StrengthIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-heading uppercase tracking-wide text-white">
                      No Critical Bottlenecks Detected
                    </p>
                    <p className="text-[11px] text-emerald-400/90 font-sans mt-0.5">
                      All evaluated biomechanical attributes meet role tolerances.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTier === 'devAreas' && (
          <div className="sportify-card p-3.5 border-amber-500/25 bg-amber-500/[0.02] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-tech text-amber-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <DevAreaIcon className="w-3.5 h-3.5" />
                Secondary Development Areas
              </span>
              <span className="font-mono">{devAreas.length} items</span>
            </div>
            <div className="space-y-2">
              {devAreas.length > 0 ? (
                devAreas.map((item) => (
                  <BenchmarkBar
                    key={item.attribute}
                    name={item.name || item.attribute.replace(/_/g, ' ')}
                    score={item.score}
                    benchmark={item.benchmark || 75}
                    gap={item.gap !== undefined ? (item.gap > 0 ? -item.gap : item.gap) : -5}
                    tier="dev_area"
                  />
                ))
              ) : (
                <div className="p-3 text-center rounded-lg bg-white/[0.02] text-xs text-slate-500">
                  No secondary development areas detected.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTier === 'proficient' && (
          <div className="sportify-card p-3.5 border-white/15 bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-tech text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ProficientIcon className="w-3.5 h-3.5" />
                Proficient / On Target
              </span>
              <span className="font-mono">{proficient.length} items</span>
            </div>
            <div className="space-y-2">
              {proficient.length > 0 ? (
                proficient.map((item) => (
                  <BenchmarkBar
                    key={item.attribute}
                    name={item.name || item.attribute.replace(/_/g, ' ')}
                    score={item.score}
                    benchmark={item.benchmark || item.score}
                    gap={0}
                    tier="proficient"
                  />
                ))
              ) : (
                <div className="p-3 text-center rounded-lg bg-white/[0.02] text-xs text-slate-500">
                  Run assessment to map proficient baselines.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTier === 'strengths' && (
          <div className="sportify-card p-3.5 border-emerald-500/25 bg-emerald-500/[0.02] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-tech text-emerald-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <StrengthIcon className="w-3.5 h-3.5" />
                Key Strengths
              </span>
              <span className="font-mono">{strengths.length} items</span>
            </div>
            <div className="space-y-2">
              {strengths.length > 0 ? (
                strengths.map((item) => (
                  <BenchmarkBar
                    key={item.attribute}
                    name={item.name || item.attribute.replace(/_/g, ' ')}
                    score={item.score}
                    benchmark={item.benchmark || 75}
                    gap={item.gap !== undefined ? Math.abs(item.gap) : 8}
                    tier="strength"
                  />
                ))
              ) : (
                <div className="p-3 text-center rounded-lg bg-white/[0.02] text-xs text-slate-500">
                  No highlighted strengths recorded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 4-WEEK TRAINING PATHWAY & RECOVERY PREVIEW ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Active Pathway Preview */}
        <div className="sportify-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold font-tech text-slate-400 uppercase tracking-widest block">
                Active Pathway
              </span>
              <h3 className="text-xs font-bold font-heading tracking-wide text-white uppercase">
                {currentPlan?.plan_data?.plan_title || '4-Week Development Pathway'}
              </h3>
            </div>
            <Link
              to="/plan"
              className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-[10px] font-semibold text-slate-200 transition-all flex items-center gap-1 active-press"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {currentPlan?.plan_data?.weeks?.slice(0, 2).map((wk) => (
              <div
                key={wk.week_number}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-center justify-between text-[11px] font-bold font-tech text-slate-300 mb-0.5">
                  <span>W0{wk.week_number}</span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {wk.sessions?.length || 4} Sess
                  </span>
                </div>
                <h4 className="text-[11px] font-bold text-slate-200 truncate">
                  {wk.week_theme?.split(':')[1] || wk.week_theme}
                </h4>
              </div>
            )) || (
              <div className="col-span-2 p-3 text-center rounded-xl bg-white/[0.02] text-xs text-slate-400">
                No active pathway. Tap to generate.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Recovery Card */}
        <div className="sportify-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold font-tech text-emerald-400 uppercase tracking-wider">
              <ShieldIcon className="w-3.5 h-3.5" />
              <span>Strain Recovery</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {trainingStats.total_minutes || 240} mins load
            </span>
          </div>

          <div className="space-y-1.5">
            {recovery?.daily_habits?.slice(0, 2).map((habit, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-300 leading-snug font-sans"
              >
                {habit}
              </div>
            )) || (
              <p className="text-[11px] text-slate-500">
                Log workouts to activate strain-aware recovery protocols.
              </p>
            )}
          </div>

          <Link
            to="/recovery"
            className="w-full h-9 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center transition-all font-tech uppercase tracking-wider mt-1 active-press"
          >
            Open Recovery Center
          </Link>
        </div>
      </div>
    </div>
  );
}

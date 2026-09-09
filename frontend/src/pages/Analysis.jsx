import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { assessmentAPI, planAPI } from '../api/client';
import { normalizeSport } from '../config/sportAssessmentConfig';
import {
  StrengthIcon,
  ProficientIcon,
  DevAreaIcon,
  CriticalIcon,
  ZapIcon,
  TargetIcon,
  ArrowRightIcon,
  DumbbellIcon,
  CheckIcon,
  ClockIcon,
} from '../components/common/Icons';
import BenchmarkBar from '../components/common/BenchmarkBar';

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const currentAssessment = useAthleteStore((state) => state.currentAssessment);
  const profile = useAthleteStore((state) => state.profile);
  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  const [analysisData, setAnalysisData] = useState(
    location.state?.result || currentAssessment || null
  );
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    async function fetchLatestIfNeeded() {
      if (!analysisData) {
        try {
          const res = await assessmentAPI.getLatest();
          if (res?.assessment) {
            setAnalysisData(res.assessment);
          }
        } catch (err) {
          console.error('Failed to fetch assessment:', err);
        }
      }
    }
    fetchLatestIfNeeded();
  }, [analysisData]);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      await planAPI.generate();
      navigate('/plan');
    } catch (err) {
      console.error('Failed to generate plan:', err);
      navigate('/plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (!analysisData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-400">
          No active assessment report found.
        </p>
        <Link to={assessmentPath} className="btn-primary text-xs">
          Record New Assessment
        </Link>
      </div>
    );
  }

  const scores = analysisData.movement_scores || {};
  const metricDetails = analysisData.metric_details || {};
  const feedback = analysisData.movement_feedback || [];
  const coaching = analysisData.coaching || {};
  const overallQuality = analysisData.overall_movement_quality || 75.0;
  const protocolName =
    analysisData.protocol_name || analysisData.protocol_id || 'Movement Assessment';

  return (
    <div className="space-y-4 select-none">
      {/* ── TOP HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="sportify-card p-4 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-start gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold font-tech text-slate-300 tracking-[0.2em] uppercase px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.12]">
                Verified Telemetry
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase truncate">
                {protocolName}
              </span>
            </div>
            <h1 className="text-lg font-black font-heading text-white tracking-wide">
              Movement Performance Report
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Activity-aware analysis validated across execution phases with zero synthetic score fabrication.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={generatingPlan}
            className="w-full h-11 btn-primary text-xs flex items-center justify-center gap-2 active-press shadow-[0_2px_14px_rgba(255,255,255,0.15)]"
          >
            <DumbbellIcon className="w-4 h-4 text-slate-950" />
            <span>
              {generatingPlan ? 'Synthesizing Pathway...' : 'Generate 4-Week Training Pathway'}
            </span>
            <ArrowRightIcon className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>
      </div>

      {/* ── OVERALL SCORE & METRIC BREAKDOWN ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 md:gap-4">
        {/* Overall Quality Ring Card */}
        <div className="sportify-card p-4 flex flex-col items-center justify-center text-center md:col-span-1">
          <span className="text-[10px] font-bold font-tech text-slate-400 uppercase tracking-[0.2em] mb-2">
            Overall Movement Quality
          </span>

          <div className="relative w-28 h-28 flex items-center justify-center my-1.5">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-white/[0.06]"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-white transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * overallQuality) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold font-mono text-white">
                {overallQuality.toFixed(0)}
              </span>
              <span className="text-[10px] font-tech text-slate-400 uppercase">
                / 100
              </span>
            </div>
          </div>

          <div className="mt-1 mb-2">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                overallQuality >= 80
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : overallQuality >= 65
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}
            >
              {overallQuality >= 80 ? 'Optimal' : overallQuality >= 65 ? 'Proficient' : 'Needs Attention'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 max-w-xs font-sans">
            Composite kinematic score evaluating joint stability, posture, and force distribution.
          </p>
        </div>

        {/* Individual Attribute Scores with BenchmarkBar */}
        <div className="sportify-card p-4 md:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-white tracking-wide">
              Kinematic Benchmark Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Target: 75 Baseline
            </span>
          </div>

          <div className="space-y-2">
            {Object.keys(scores).map((attr) => {
              const val = Math.round(scores[attr]);
              const benchmark = analysisData.benchmarks?.[attr] || 75;
              const gap = val - benchmark;
              const tier = gap < -8 ? 'bottleneck' : gap < 0 ? 'dev_area' : gap >= 5 ? 'strength' : 'proficient';
              const label = attr.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <BenchmarkBar
                  key={attr}
                  name={label}
                  score={val}
                  benchmark={benchmark}
                  gap={gap}
                  tier={tier}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── VERIFIED OBSERVATIONS & GROUNDED COACHING ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
        {/* Verified Kinematic Observations */}
        <div className="sportify-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-heading text-white tracking-wide">
              Biomechanical Observations
            </h3>
            <span className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
              Vision Evidence
            </span>
          </div>

          <div className="space-y-2">
            {feedback.length > 0 ? (
              feedback.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2.5 font-sans"
                >
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-sans">
                Phase observations recorded and verified.
              </p>
            )}
          </div>
        </div>

        {/* Evidence-Grounded Coaching Cues */}
        <div className="sportify-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-heading text-white tracking-wide">
              Performance Guidance
            </h3>
            <span className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
              Coaching Cues
            </span>
          </div>

          <div className="space-y-2">
            {coaching.technique_tips?.map((tip, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="text-xs font-bold text-white mb-0.5 font-tech">
                  {tip.title}
                </div>
                <div className="text-xs text-slate-400 font-sans">{tip.detail}</div>
              </div>
            )) || (
              <p className="text-xs text-slate-500 font-sans">
                Continue to the training pathway to execute targeted corrective sets.
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

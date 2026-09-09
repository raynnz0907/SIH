import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SportifyLogo from '../components/common/SportifyLogo';
import {
  VideoIcon,
  CriticalIcon,
  DumbbellIcon,
  HeartPulseIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from '../components/common/Icons';

export default function Landing() {
  const navigate = useNavigate();

  // 5-Phase Athlete Development Loop
  const productLoop = [
    {
      phase: '01',
      title: 'ASSESS',
      subtitle: 'Kinematic Capture',
      desc: 'Video capture with precision joint tracking, camera framing reticles, and biomechanical calibration.',
      icon: VideoIcon,
      accent: 'text-sky-400',
      badgeClass: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
    },
    {
      phase: '02',
      title: 'IDENTIFY',
      subtitle: 'Bottleneck Detection',
      desc: 'Biomechanic algorithms pinpoint kinematic deficits and mobility limitations against role benchmarks.',
      icon: CriticalIcon,
      accent: 'text-rose-400',
      badgeClass: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    },
    {
      phase: '03',
      title: 'TRAIN',
      subtitle: 'Targeted Pathway',
      desc: '4-week progressive overload plan targeting your exact deficit gaps and sport demands.',
      icon: DumbbellIcon,
      accent: 'text-amber-400',
      badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    },
    {
      phase: '04',
      title: 'RECOVER',
      subtitle: 'Strain Restoration',
      desc: 'Strain status tracking, daily habit checklists, and role-specific injury prevention prehab routines.',
      icon: HeartPulseIcon,
      accent: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    },
    {
      phase: '05',
      title: 'REASSESS',
      subtitle: 'Track Improvement',
      desc: 'Longitudinal movement deltas, trajectory tracking, and progressive adaptation validation.',
      icon: TrendingUpIcon,
      accent: 'text-white',
      badgeClass: 'bg-white/10 border-white/20 text-white',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 relative overflow-x-hidden select-none">
      {/* Subtle Specular Ambient Sheen */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-radial-gradient from-white/[0.04] via-slate-400/[0.01] to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto min-h-[100dvh] flex flex-col justify-between p-4 sm:p-6 md:p-8 relative z-10">
        {/* ── 1. HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between pt-safe">
          <Link to="/" className="focus:outline-none">
            <SportifyLogo size="xs" showTagline={false} />
          </Link>
          <Link
            to="/onboarding?mode=signin"
            className="text-xs font-bold font-tech uppercase tracking-wider text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all active:scale-95"
          >
            Sign In
          </Link>
        </header>

        {/* ── 2. HERO SPLASH ─────────────────────────────────────────────────── */}
        <main className="my-auto py-8 sm:py-12 flex flex-col items-center text-center">
          {/* Brand Visual Emblem */}
          <div className="mb-5 relative group">
            <div className="absolute -inset-4 bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl blur-xl opacity-70" />
            <SportifyLogo variant="hero" size="sm" />
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white text-[11px] font-tech font-bold uppercase tracking-wider mb-4 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>Role-Specific Athlete Development Platform</span>
          </div>

          {/* Impactful Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight text-white uppercase leading-[1.1] mb-3 sm:mb-4 max-w-3xl">
            Train for the exact demands{' '}
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent block">
              of your position.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-xl mx-auto font-sans leading-relaxed mb-8 sm:mb-10">
            Sportify analyzes your movement kinematics, identifies performance bottlenecks, and generates a personalized training pathway.
          </p>

          {/* 5-Phase Core Product Loop */}
          <div className="w-full text-left space-y-2 mb-8">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold font-tech uppercase tracking-[0.2em] text-slate-400">
                The Continuous Development Loop
              </span>
              <span className="text-[10px] font-mono text-slate-500">5 Kinematic Phases</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {productLoop.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.phase}
                    className="p-3.5 rounded-xl bg-[#0F121C]/90 border border-white/[0.07] hover:border-white/20 transition-all flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.6)] group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                          <Icon className={`w-4 h-4 ${item.accent}`} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {item.phase}
                        </span>
                      </div>
                      <h2 className="text-xs font-bold font-heading uppercase text-white tracking-wide">
                        {item.title}
                      </h2>
                      <span className="text-[10px] font-tech text-slate-400 block mb-1.5 font-semibold">
                        {item.subtitle}
                      </span>
                      <p className="text-[11px] text-slate-400/90 font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ── 3. BOTTOM ACTION DOCK ─────────────────────────────────────────── */}
        <footer className="w-full max-w-md mx-auto space-y-3 pt-2 pb-safe">
          <button
            onClick={() => navigate('/onboarding?mode=signup')}
            className="w-full h-12 btn-primary text-xs uppercase tracking-wider flex items-center justify-center gap-2 active-press shadow-[0_4px_24px_rgba(255,255,255,0.2)]"
          >
            <span>Build Athlete Profile</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>

          <p className="text-center text-[11px] text-slate-400 font-sans">
            Already registered?{' '}
            <Link
              to="/onboarding?mode=signin"
              className="text-white hover:underline font-tech font-bold ml-1"
            >
              Sign In to Studio
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

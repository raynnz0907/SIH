import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SportifyLogo from '../components/common/SportifyLogo';
import {
  TargetIcon,
  VideoIcon,
  DumbbellIcon,
  ArrowRightIcon,
  ZapIcon,
} from '../components/common/Icons';

export default function Landing() {
  const navigate = useNavigate();

  const journeySteps = [
    {
      step: '01',
      icon: TargetIcon,
      title: 'Choose Sport & Role',
      desc: 'Calibrated tests configured specifically for your position.',
    },
    {
      step: '02',
      icon: VideoIcon,
      title: 'Vision Movement Capture',
      desc: 'Instant kinematic joint tracking with framing reticles.',
    },
    {
      step: '03',
      icon: DumbbellIcon,
      title: 'Adaptive Training Pathway',
      desc: '4-week progressive overload calibrated to bottleneck gaps.',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 relative overflow-hidden select-none">
      {/* Subtle Specular Ambient Sheen */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-white/[0.06] to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto min-h-[100dvh] flex flex-col justify-between p-4 sm:p-6 md:p-8 relative z-10">
        {/* ── 1. HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between pt-safe">
          <Link to="/" className="focus:outline-none">
            <SportifyLogo size="xs" showTagline={false} />
          </Link>
          <Link
            to="/onboarding?mode=signin"
            className="text-xs font-bold font-tech uppercase tracking-wider text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all active:scale-95"
          >
            Sign In
          </Link>
        </header>

        {/* ── 2. HERO SPLASH & CORE JOURNEY ─────────────────────────────────── */}
        <main className="my-auto py-6 sm:py-8 flex flex-col items-center text-center">
          {/* Brand Visual Emblem */}
          <div className="mb-4 relative group">
            <div className="absolute -inset-4 bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl blur-xl opacity-70" />
            <SportifyLogo variant="hero" size="sm" />
          </div>

          {/* Impactful Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white uppercase leading-tight mb-2 sm:mb-3">
            Train with clarity.{' '}
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent block">
              Move with confidence.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-sans leading-relaxed mb-6 sm:mb-8">
            Sport-personalized kinematic tracking and structured progression for dedicated athletes.
          </p>

          {/* 3 Step Cards (1-col on mobile, 3-col on desktop) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 text-left max-w-4xl mx-auto">
            {journeySteps.map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center md:items-start gap-3 transition-all hover:border-white/15"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-white shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h2 className="text-xs sm:text-sm font-bold text-white font-heading uppercase tracking-wide truncate">
                      {title}
                    </h2>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {step}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug font-sans line-clamp-2">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ── 3. BOTTOM ACTION DOCK ─────────────────────────────────────────── */}
        <footer className="w-full max-w-sm mx-auto space-y-3 pt-2 pb-safe">
          <button
            onClick={() => navigate('/onboarding?mode=signup')}
            className="w-full h-12 btn-primary text-xs uppercase tracking-wider flex items-center justify-center gap-2 active-press shadow-[0_4px_20px_rgba(255,255,255,0.18)]"
          >
            <span>Build Athlete Profile</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>

          <p className="text-center text-[11px] text-slate-400 font-sans">
            Already registered?{' '}
            <Link
              to="/onboarding?mode=signin"
              className="text-white hover:underline font-tech font-bold"
            >
              Sign In to Studio
            </Link>
          </p>

          <p className="text-center text-[9px] font-tech tracking-widest text-slate-600 uppercase pt-1">
            TRAIN. COMPETE. EVOLVE. • ATHLETE PLATFORM
          </p>
        </footer>
      </div>
    </div>
  );
}

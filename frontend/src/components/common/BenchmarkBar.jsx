import React from 'react';

/**
 * BenchmarkBar
 * Precision telemetry component displaying an athlete's biomechanical metric
 * compared against the elite role benchmark target.
 *
 * Props:
 * - name: string (e.g., "Knee Stability", "Pelvic Tilt Range")
 * - score: number (0 - 100)
 * - benchmark: number (0 - 100)
 * - gap: number (optional delta, e.g. -12 or +8)
 * - tier: 'bottleneck' | 'dev_area' | 'proficient' | 'strength'
 */
export default function BenchmarkBar({
  name,
  score = 0,
  benchmark = 75,
  gap,
  tier = 'proficient',
}) {
  const calculatedGap = gap !== undefined ? gap : Math.round(score - benchmark);
  const clampedScore = Math.max(0, Math.min(100, score));
  const clampedBenchmark = Math.max(0, Math.min(100, benchmark));

  // Determine tier semantics and styling
  const tierConfig = {
    bottleneck: {
      label: `${calculatedGap < 0 ? calculatedGap : `-${calculatedGap}`} pts`,
      badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
      fillClass: 'bg-gradient-to-r from-rose-600 to-rose-400',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    },
    dev_area: {
      label: `${calculatedGap <= 0 ? calculatedGap : `-${calculatedGap}`} pts`,
      badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
      fillClass: 'bg-gradient-to-r from-amber-600 to-amber-400',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    },
    proficient: {
      label: 'Target met',
      badgeClass: 'bg-slate-800/60 text-slate-300 border border-slate-700/50',
      fillClass: 'bg-gradient-to-r from-slate-500 to-slate-200',
      dotClass: 'bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.4)]',
    },
    strength: {
      label: `+${Math.abs(calculatedGap)} pts`,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
      fillClass: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    },
  };

  const currentConfig = tierConfig[tier] || tierConfig.proficient;

  return (
    <div className="w-full space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-sans font-medium text-slate-200 tracking-tight text-[13px]">
            {name}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${currentConfig.badgeClass}`}>
            {currentConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="font-bold text-white text-xs">{clampedScore}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{clampedBenchmark} target</span>
        </div>
      </div>

      {/* Bar Track */}
      <div className="relative h-2 w-full bg-white/[0.06] rounded-full overflow-visible">
        {/* Athlete Score Fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${currentConfig.fillClass}`}
          style={{ width: `${clampedScore}%` }}
        />

        {/* Benchmark Overlay Tick Indicator */}
        <div
          className="absolute -top-1 bottom-[-4px] w-[2px] bg-white z-10 shadow-[0_0_6px_rgba(255,255,255,0.9)]"
          style={{ left: `${clampedBenchmark}%` }}
          title={`Role Benchmark: ${clampedBenchmark}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white -ml-[2px] -top-1 absolute" />
        </div>
      </div>

      {/* Benchmark Tick Label underneath */}
      <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5 pt-0.5">
        <span>0</span>
        <span style={{ marginLeft: `${Math.max(5, clampedBenchmark - 8)}%` }}>Target {clampedBenchmark}</span>
        <span>100</span>
      </div>
    </div>
  );
}

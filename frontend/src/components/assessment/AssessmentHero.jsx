import React from 'react';
import { TargetIcon, SportIcon } from '../common/Icons';

export default function AssessmentHero({
  title,
  subtitle,
  sportName,
  badgeLabel,
  roleName,
  subRole,
  experienceLevel,
  recommendedCount = 1,
}) {
  const displayRole = subRole ? subRole.replace(/_/g, ' ') : roleName || 'Athlete';

  return (
    <div className="space-y-2 pt-1">
      {/* Top Badges Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-white text-[10px] font-bold font-tech uppercase tracking-wider">
          <SportIcon sport={sportName} className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>{badgeLabel || `${sportName} Biomechanics`}</span>
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 text-[10px] font-mono capitalize">
          {displayRole} • {experienceLevel || 'Intermediate'}
        </span>
      </div>

      {/* Main Title & Role-Aware Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading tracking-tight leading-snug">
          {title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 font-sans leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

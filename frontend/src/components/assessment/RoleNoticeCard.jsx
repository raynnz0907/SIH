import React from 'react';
import { InfoIcon, ZapIcon } from '../common/Icons';

export default function RoleNoticeCard({ notice }) {
  if (!notice) return null;

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
        <InfoIcon className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-200">
          {notice.title}
        </h4>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          {notice.description}
        </p>
      </div>
    </div>
  );
}

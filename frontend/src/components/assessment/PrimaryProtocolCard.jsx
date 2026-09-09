import React from 'react';
import { CheckIcon, TargetIcon, VideoIcon, ZapIcon } from '../common/Icons';

export default function PrimaryProtocolCard({
  protocol,
  status = 'available', // 'available' | 'foundation' | 'coming_soon'
  roleReason,
  isSelected,
  onSelect,
  onTriggerAction,
}) {
  if (!protocol) return null;

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return {
          label: 'Available Now • Recommended',
          classes: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400',
        };
      case 'foundation':
        return {
          label: 'Foundational Baseline',
          classes: 'bg-sky-500/15 border-sky-500/35 text-sky-400',
        };
      case 'coming_soon':
        return {
          label: 'In Development',
          classes: 'bg-amber-500/15 border-amber-500/35 text-amber-400',
        };
      default:
        return {
          label: 'Active Assessment',
          classes: 'bg-white/10 border-white/20 text-white',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div
      className={`sportify-card p-4 transition-all border ${
        isSelected
          ? 'border-white/35 bg-gradient-to-b from-white/[0.05] to-transparent shadow-[0_4px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.18)]'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2 py-0.5 rounded-full border text-[9px] font-bold font-tech uppercase tracking-wider ${badge.classes}`}
          >
            {badge.label}
          </span>
          {isSelected && (
            <span className="flex items-center gap-1 text-[10px] font-tech text-white font-semibold">
              <CheckIcon className="w-3 h-3 text-emerald-400" />
              Active Focus
            </span>
          )}
        </div>

        <div>
          <h2 className="text-base font-bold text-white font-heading tracking-tight">
            {protocol.name}
          </h2>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed mt-0.5">
            {protocol.shortPurpose}
          </p>
        </div>

        {roleReason && (
          <p className="text-[10px] text-slate-400 font-sans border-l-2 border-white/20 pl-2 italic">
            <span className="text-slate-300 not-italic font-tech font-bold uppercase tracking-wider mr-1">
              Role Context:
            </span>
            {roleReason}
          </p>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={onTriggerAction}
          className="btn-primary text-xs w-full h-11 flex items-center justify-center gap-2 uppercase tracking-wider mt-2 active-press"
        >
          <VideoIcon className="w-4 h-4" />
          <span>Record or Upload</span>
        </button>
      </div>

      {/* 4 Concise "What This Assessment Measures" Chips */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
        <div className="text-[10px] font-bold font-tech uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
          <TargetIcon className="w-3 h-3 text-slate-300" />
          <span>Metrics Measured</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {protocol.metrics?.map((m, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="text-[11px] font-bold font-tech text-white truncate">
                {m.label}
              </div>
              <div className="text-[9px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

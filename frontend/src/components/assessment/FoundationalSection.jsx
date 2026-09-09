import React from 'react';
import { DumbbellIcon, CheckIcon } from '../common/Icons';

export default function FoundationalSection({
  options,
  selectedProtocolId,
  onSelectProtocol,
}) {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <DumbbellIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Optional Athletic Baselines</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Evaluate fundamental mobility, power transfer, and shock attenuation capacity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selectedProtocolId === opt.protocolId;
          return (
            <button
              key={opt.protocolId}
              type="button"
              onClick={() => onSelectProtocol(opt.protocolId)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white/[0.08] border-white/40 text-white shadow-sm'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {opt.tag}
                </span>
                {isSelected ? (
                  <span className="flex items-center gap-1 text-[10px] font-tech text-emerald-400 font-bold">
                    <CheckIcon className="w-3 h-3" /> Selected
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">Switch Focus</span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-100 font-heading mb-1">
                {opt.name}
              </h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { VideoIcon, AlertTriangleIcon, CheckIcon, ClockIcon } from '../common/Icons';

export default function CameraSetupGuide({
  steps,
  protocolName,
  repetitionCount,
  warningMessage,
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="sportify-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5 truncate">
          <VideoIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-white truncate">
            Framing Guide: <span className="text-slate-400 font-sans font-normal normal-case">{protocolName || 'Assessment'}</span>
          </h3>
        </div>
        {repetitionCount && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
            {repetitionCount}
          </span>
        )}
      </div>

      {/* 4 Numbered Visual Steps in 2x2 compact grid */}
      <div className="grid grid-cols-2 gap-2">
        {steps.map((item) => (
          <div
            key={item.step}
            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/15 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                0{item.step}
              </span>
              <CheckIcon className="w-3 h-3 text-slate-500" />
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-200 font-heading leading-snug mb-0.5">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-sans leading-snug line-clamp-2">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Warning Notice */}
      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-[11px] text-slate-300 font-sans">
        <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="leading-snug">
          {warningMessage ||
            'Ensure full body is visible head-to-toe. Do not pan camera during capture.'}
        </span>
      </div>
    </div>
  );
}

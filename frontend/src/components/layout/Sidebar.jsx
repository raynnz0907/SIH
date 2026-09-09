import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { normalizeSport } from '../../config/sportAssessmentConfig';
import SportifyLogo from '../common/SportifyLogo';
import {
  DashboardIcon,
  VideoIcon,
  PlanIcon,
  RecoveryIcon,
  ProgressIcon,
  TargetIcon,
  ZapIcon,
  FlameIcon,
} from '../common/Icons';

export default function Sidebar() {
  const location = useLocation();
  const profile = useAthleteStore((state) => state.profile);

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  const navItems = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: VideoIcon, label: 'Assessment Studio', path: assessmentPath, matchPrefix: '/assessment' },
    { icon: PlanIcon, label: 'Training Pathway', path: '/plan' },
    { icon: RecoveryIcon, label: 'Recovery Center', path: '/recovery' },
    { icon: ProgressIcon, label: 'Progress & Reassess', path: '/progress' },
  ];

  const sportName = profile?.sport ? profile.sport.toUpperCase() : 'SPORTIFY';
  const roleName = profile?.sub_role
    ? profile.sub_role.replace(/_/g, ' ')
    : profile?.primary_role || 'ATHLETE';

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.08] bg-[#0A0B10]/95 backdrop-blur-2xl h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <Link to="/dashboard" className="block focus:outline-none">
          <SportifyLogo size="md" showTagline={true} />
        </Link>
      </div>

      {/* Athlete Status Pill */}
      <div className="px-5 pt-4 pb-2">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-[0.18em] text-slate-200 font-tech uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {sportName}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {profile?.experience_level || 'Active'}
            </span>
          </div>
          <p className="text-xs font-semibold text-white capitalize truncate font-sans">
            {roleName}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-3 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 font-tech">
          Core Pathway
        </p>
        <ul className="space-y-1.5">
          {navItems.map(({ icon: Icon, label, path, matchPrefix }) => {
            const active = matchPrefix
              ? location.pathname.startsWith(matchPrefix) || location.pathname === '/video'
              : location.pathname.startsWith(path);
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 font-sans ${
                    active
                      ? 'bg-white/[0.09] text-white border border-white/20 shadow-[0_2px_12px_rgba(255,255,255,0.06)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      active ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className={active ? 'font-semibold' : ''}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Protocol Badge */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-200 mb-1">
            <ZapIcon className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider">
              Biomechanics v2.4
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">Activity-Aware Telemetry</p>
        </div>
      </div>
    </aside>

  );
}

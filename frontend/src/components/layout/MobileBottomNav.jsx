import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { normalizeSport } from '../../config/sportAssessmentConfig';
import {
  DashboardIcon,
  PlanIcon,
  VideoIcon,
  RecoveryIcon,
  ProgressIcon,
  ZapIcon,
} from '../common/Icons';

export default function MobileBottomNav() {
  const location = useLocation();
  const profile = useAthleteStore((state) => state.profile);

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport || 'cricket'}`;

  const isAssessmentActive =
    location.pathname.startsWith('/assessment') ||
    location.pathname === '/video' ||
    location.pathname.startsWith('/analysis');

  const navItems = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: DashboardIcon,
      isActive: location.pathname === '/dashboard',
    },
    {
      to: '/plan',
      label: 'Training',
      icon: PlanIcon,
      isActive: location.pathname.startsWith('/plan'),
    },
    // Center item is the elevated Record/Assess button
    {
      isCenter: true,
      to: assessmentPath,
      label: 'Record',
      icon: VideoIcon,
      isActive: isAssessmentActive,
    },
    {
      to: '/recovery',
      label: 'Recovery',
      icon: RecoveryIcon,
      isActive: location.pathname.startsWith('/recovery'),
    },
    {
      to: '/progress',
      label: 'Progress',
      icon: ProgressIcon,
      isActive: location.pathname.startsWith('/progress'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 select-none md:hidden bg-[#07080C]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 pt-2 pb-[max(env(safe-area-inset-bottom,0px),12px)] shadow-[0_-12px_36px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item, idx) => {
          if (item.isCenter) {
            return (
              <Link
                key="center-record"
                to={item.to}
                className="flex flex-col items-center group -mt-5 focus:outline-none"
                aria-label="New Assessment"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center p-2.5 border shadow-2xl transition-all duration-150 active:scale-90 ${item.isActive
                    ? 'bg-white text-slate-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                    : 'bg-gradient-to-b from-white/20 to-white/5 border-white/30 text-white hover:border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.6)]'
                    }`}
                >
                  <ZapIcon className={`w-5 h-5 ${item.isActive ? 'text-slate-950 fill-slate-950' : 'text-white'}`} />
                </div>
                <span
                  className={`text-[9px] font-tech font-bold uppercase tracking-wider mt-1 transition-colors ${item.isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-all duration-150 active:scale-95 focus:outline-none ${item.isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 transition-transform duration-150" />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                )}
              </div>
              <span
                className={`text-[10px] font-sans font-medium mt-1 tracking-tight transition-colors ${item.isActive ? 'text-white font-semibold' : 'text-slate-400'
                  }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

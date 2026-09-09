import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { normalizeSport } from '../../config/sportAssessmentConfig';
import SportifyLogo from '../common/SportifyLogo';
import {
  DashboardIcon,
  VideoIcon,
  PlanIcon,
  RecoveryIcon,
  ProgressIcon,
  ProfileIcon,
  LogoutIcon,
  PlusIcon,
  ZapIcon,
} from '../common/Icons';

export default function Navbar() {
  const logout = useAthleteStore((state) => state.logout);
  const athlete = useAthleteStore((state) => state.athlete);
  const profile = useAthleteStore((state) => state.profile);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/onboarding');
  };

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: assessmentPath, label: 'Assessment', icon: VideoIcon, matchPrefix: '/assessment' },
    { to: '/plan', label: 'Training', icon: PlanIcon },
    { to: '/recovery', label: 'Recovery', icon: RecoveryIcon },
    { to: '/progress', label: 'Progress', icon: ProgressIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 px-5 md:px-8 py-3.5 flex items-center justify-between border-b border-white/[0.08] bg-[#07080C]/90 backdrop-blur-2xl">
      {/* Mobile Logo & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="lg:hidden block focus:outline-none">
          <SportifyLogo size="sm" showTagline={false} />
        </Link>
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="text-slate-400 font-heading font-bold tracking-[0.2em]">SPORTIFY</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 capitalize font-sans tracking-wide">
            {location.pathname.replace('/', '') || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Mobile Nav Links Bar */}
      <div className="flex lg:hidden items-center gap-1">
        {navLinks.map(({ to, icon: Icon, matchPrefix }) => {
          const active = matchPrefix
            ? location.pathname.startsWith(matchPrefix) || location.pathname === '/video'
            : location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`p-2 rounded-lg transition-all ${
                active
                  ? 'bg-white/[0.12] text-white border border-white/25 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
            </Link>
          );
        })}
      </div>

      {/* Action / User Bar */}
      <div className="flex items-center gap-3">
        {/* Fast Action: New Assessment */}
        <Link
          to={assessmentPath}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/20 text-xs font-bold font-tech tracking-wider transition-all shadow-[0_2px_12px_rgba(255,255,255,0.06)]"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>New Assessment</span>
        </Link>

        {/* Athlete Avatar Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-white/20 to-slate-800 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white uppercase font-mono">
            {athlete?.full_name?.charAt(0) || 'A'}
          </div>
          <span className="hidden sm:block text-xs font-semibold text-slate-200 max-w-[120px] truncate font-sans">
            {athlete?.full_name || athlete?.name || 'Athlete'}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          title="Sign Out"
        >
          <LogoutIcon className="w-4 h-4" />
        </button>
      </div>
    </nav>

  );
}

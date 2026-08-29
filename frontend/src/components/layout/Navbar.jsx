import { Link } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { Zap, User, LogOut, LayoutDashboard, Calendar, TrendingUp, Video, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const logout = useAthleteStore((state) => state.logout);
  const athlete = useAthleteStore((state) => state.athlete);
  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plan',      label: 'Plan',      icon: Calendar },
    { to: '/progress',  label: 'Progress',  icon: TrendingUp },
    { to: '/video',     label: 'Analyse',   icon: Video },
    { to: '/recovery',  label: 'Recovery',  icon: Shield },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 group">
        <div className="relative">
          <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
          <Zap className="relative w-7 h-7 text-primary" />
        </div>
        <span className="font-black text-xl tracking-tight gradient-text-blue">ATHLETIQ</span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary/15 text-primary border border-primary/25 shadow-glow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/05'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>

      {/* User area */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/25 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="hidden sm:block text-sm font-medium text-white/70">
            {athlete?.name || athlete?.full_name || 'Athlete'}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-xl text-white/40 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all duration-200"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

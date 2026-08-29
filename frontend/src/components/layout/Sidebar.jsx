import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Video, Calendar, Activity, TrendingUp } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard' },
  { icon: Video,           label: 'Video',        path: '/video' },
  { icon: Calendar,        label: 'Training',     path: '/plan' },
  { icon: Activity,        label: 'Recovery',     path: '/recovery' },
  { icon: TrendingUp,      label: 'Progress',     path: '/progress' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-56 glass-sidebar h-screen sticky top-0">
      <div className="p-4 flex-1">
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-3">Menu</p>
        <ul className="space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'text-white/40 hover:bg-white/05 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-4 border-t border-white/05">
        <div className="glass px-3 py-3 rounded-xl text-center">
          <p className="text-[10px] text-white/30 font-medium">Powered by</p>
          <p className="text-xs font-bold gradient-text-blue mt-0.5">Mistral AI</p>
        </div>
      </div>
    </aside>
  );
}

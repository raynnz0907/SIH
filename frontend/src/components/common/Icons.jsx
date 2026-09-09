import React from 'react';
import {
  Activity,
  Award,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Clock,
  Compass,
  Dumbbell,
  Eye,
  Flame,
  HeartPulse,
  Layers,
  LogOut,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  Upload,
  User,
  Video,
  Zap,
  Check,
  X,
  Plus,
  RefreshCw,
  Info,
  Maximize2,
  Sliders,
  CheckCheck,
} from 'lucide-react';

export const DashboardIcon = ({ className = 'w-5 h-5' }) => <Activity className={className} />;
export const VideoIcon = ({ className = 'w-5 h-5' }) => <Video className={className} />;
export const AnalysisIcon = ({ className = 'w-5 h-5' }) => <BarChart3 className={className} />;
export const PlanIcon = ({ className = 'w-5 h-5' }) => <Layers className={className} />;
export const RecoveryIcon = ({ className = 'w-5 h-5' }) => <HeartPulse className={className} />;
export const ProgressIcon = ({ className = 'w-5 h-5' }) => <TrendingUp className={className} />;
export const ProfileIcon = ({ className = 'w-5 h-5' }) => <User className={className} />;
export const LogoutIcon = ({ className = 'w-5 h-5' }) => <LogOut className={className} />;

// 4-Tier Development Status Icons (ZERO EMOJIS)
export const StrengthIcon = ({ className = 'w-4 h-4 text-emerald-400' }) => <Award className={className} />;
export const ProficientIcon = ({ className = 'w-4 h-4 text-sky-400' }) => <CheckCircle2 className={className} />;
export const DevAreaIcon = ({ className = 'w-4 h-4 text-amber-400' }) => <AlertCircle className={className} />;
export const CriticalIcon = ({ className = 'w-4 h-4 text-rose-400' }) => <ShieldAlert className={className} />;

// General UI Icons
export const TargetIcon = ({ className = 'w-4 h-4' }) => <Target className={className} />;
export const FlameIcon = ({ className = 'w-4 h-4' }) => <Flame className={className} />;
export const SparklesIcon = ({ className = 'w-4 h-4' }) => <Sparkles className={className} />;
export const ZapIcon = ({ className = 'w-4 h-4' }) => <Zap className={className} />;
export const ClockIcon = ({ className = 'w-4 h-4' }) => <Clock className={className} />;
export const DumbbellIcon = ({ className = 'w-4 h-4' }) => <Dumbbell className={className} />;
export const ShieldIcon = ({ className = 'w-4 h-4' }) => <Shield className={className} />;
export const ArrowRightIcon = ({ className = 'w-4 h-4' }) => <ArrowRight className={className} />;
export const CheckIcon = ({ className = 'w-4 h-4' }) => <Check className={className} />;
export const CloseIcon = ({ className = 'w-4 h-4' }) => <X className={className} />;
export const PlusIcon = ({ className = 'w-4 h-4' }) => <Plus className={className} />;
export const RefreshIcon = ({ className = 'w-4 h-4' }) => <RefreshCw className={className} />;
export const InfoIcon = ({ className = 'w-4 h-4' }) => <Info className={className} />;
export const UploadIcon = ({ className = 'w-4 h-4' }) => <Upload className={className} />;
export const ChevronRightIcon = ({ className = 'w-4 h-4' }) => <ChevronRight className={className} />;
export const ChevronDownIcon = ({ className = 'w-4 h-4' }) => <ChevronDown className={className} />;
export const TrendingUpIcon = ({ className = 'w-4 h-4' }) => <TrendingUp className={className} />;
export const TrendingDownIcon = ({ className = 'w-4 h-4' }) => <TrendingDown className={className} />;
export const SlidersIcon = ({ className = 'w-4 h-4' }) => <Sliders className={className} />;
export const CalendarIcon = ({ className = 'w-4 h-4' }) => <Calendar className={className} />;
export const AlertTriangleIcon = ({ className = 'w-4 h-4' }) => <AlertTriangle className={className} />;
export const HeartPulseIcon = ({ className = 'w-4 h-4' }) => <HeartPulse className={className} />;
export const ActivityIcon = ({ className = 'w-4 h-4' }) => <Activity className={className} />;

// ── PRECISION VECTOR SPORT ICONS (ZERO EMOJIS) ─────────────────────────────
export const CricketIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Cricket Bat */}
    <path d="M14.5 3.5l6 6-8.5 8.5c-.8.8-2 .8-2.8 0l-3.2-3.2c-.8-.8-.8-2 0-2.8l8.5-8.5z" />
    <path d="M18.5 7.5l2-2" />
    <path d="M19.5 4.5l1-1" />
    {/* Stitched Ball */}
    <circle cx="6" cy="18" r="3.5" />
    <path d="M4 16.5c1 1 3 1 4 0" strokeDasharray="1 1" />
    <path d="M4 19.5c1-1 3-1 4 0" strokeDasharray="1 1" />
  </svg>
);

export const FootballIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Outer Ball */}
    <circle cx="12" cy="12" r="9" />
    {/* Central Pentagon */}
    <polygon points="12,8 15,10.5 14,14 10,14 9,10.5" fill="currentColor" fillOpacity="0.2" />
    {/* Seam Lines extending to perimeter */}
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="15" y1="10.5" x2="19.5" y2="9" />
    <line x1="14" y1="14" x2="17.5" y2="18" />
    <line x1="10" y1="14" x2="6.5" y2="18" />
    <line x1="9" y1="10.5" x2="4.5" y2="9" />
  </svg>
);

export const BasketballIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Basketball Sphere */}
    <circle cx="12" cy="12" r="9" />
    {/* Center Horizontal & Vertical Lines */}
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="3" x2="12" y2="21" />
    {/* Curved Side Seams */}
    <path d="M5.5 5.5c4 3.5 4 9.5 0 13" />
    <path d="M18.5 5.5c-4 3.5-4 9.5 0 13" />
  </svg>
);

export const AthleticsIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Runner Head */}
    <circle cx="15.5" cy="5.5" r="2" />
    {/* Torso & Arms in Drive Posture */}
    <path d="M8 12l4-3 3.5 2 3-2" />
    {/* Lead Leg (Knee Punch) */}
    <path d="M12 9l-1 5 4 3 2 4" />
    {/* Trailing Leg (Full Hip Extension) */}
    <path d="M11 14l-4 1-3 4" />
  </svg>
);

/**
 * Dynamic sport vector icon resolver
 */
export const SportIcon = ({ sport, className = 'w-5 h-5' }) => {
  const s = String(sport || '').toLowerCase();
  if (s.includes('cricket')) return <CricketIcon className={className} />;
  if (s.includes('foot') || s.includes('soccer')) return <FootballIcon className={className} />;
  if (s.includes('basket')) return <BasketballIcon className={className} />;
  if (s.includes('athlet') || s.includes('track') || s.includes('sprint') || s.includes('run')) {
    return <AthleticsIcon className={className} />;
  }
  return <TargetIcon className={className} />;
};

export default {
  DashboardIcon,
  VideoIcon,
  AnalysisIcon,
  PlanIcon,
  RecoveryIcon,
  ProgressIcon,
  ProfileIcon,
  LogoutIcon,
  StrengthIcon,
  ProficientIcon,
  DevAreaIcon,
  CriticalIcon,
  TargetIcon,
  FlameIcon,
  SparklesIcon,
  ZapIcon,
  ClockIcon,
  DumbbellIcon,
  ShieldIcon,
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  RefreshIcon,
  InfoIcon,
  UploadIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SlidersIcon,
  CalendarIcon,
  AlertTriangleIcon,
  HeartPulseIcon,
  ActivityIcon,
};

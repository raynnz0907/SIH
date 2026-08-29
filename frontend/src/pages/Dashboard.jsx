import { useState, useEffect, useRef } from 'react';
import { useAthleteStore } from '../store/athleteStore';
import {
  Flame, Activity, Calendar, Zap, TrendingUp, Video,
  Plus, X, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ALL_GOALS = [
  'Improve acceleration', 'Build strength', 'Boost agility',
  'Increase stamina', 'Better flexibility', 'Injury prevention',
  'Improve technique', 'Lose weight', 'Gain muscle',
];

const PRIORITY = {
  high:   { border: 'rgba(239,68,68,.40)',  bg: 'rgba(239,68,68,.07)',  color: '#FCA5A5', dot: '#EF4444' },
  medium: { border: 'rgba(245,158,11,.40)', bg: 'rgba(245,158,11,.07)', color: '#FCD34D', dot: '#F59E0B' },
  low:    { border: 'rgba(59,130,246,.40)', bg: 'rgba(59,130,246,.07)', color: '#93C5FD', dot: '#3B82F6' },
};

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function Dashboard() {
  const { athlete, login } = useAthleteStore();
  const name  = athlete?.name?.split(' ')[0] || 'Athlete';
  const sport = athlete?.sport || 'football';
  const role  = athlete?.role  || 'striker';

  /* ── Goals editing ─────────────────────────────────── */
  const [goals, setGoals]       = useState(athlete?.goals || []);
  const [showPicker, setPicker] = useState(false);

  useEffect(() => {
    if (athlete) login({ ...athlete, goals }, athlete?.token || 'local-session');
  }, [goals]);

  const removeGoal = (g) => setGoals(p => p.filter(x => x !== g));
  const addGoal    = (g) => { setGoals(p => [...p, g]); setPicker(false); };
  const available  = ALL_GOALS.filter(g => !goals.includes(g));

  /* ── Video coaching ─────────────────────────────────── */
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnal]    = useState(false);
  const [jobId, setJobId]       = useState(null);
  const [coaching, setCoach]    = useState(null);
  const [err, setErr]           = useState('');
  const fileRef = useRef(null);
  const pollRef = useRef(null);

  // Poll backend every 3s until done
  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await axios.get(`/api/video/coach/${jobId}`);
        if (r.data.status === 'completed') {
          clearInterval(pollRef.current);
          setCoach(r.data.coaching);
          setAnal(false);
          setJobId(null);
        } else if (r.data.status === 'failed') {
          clearInterval(pollRef.current);
          setCoach(r.data.coaching || null);
          setAnal(false);
          setErr('Analysis struggled — showing built-in tips below.');
          setJobId(null);
        }
      } catch {
        clearInterval(pollRef.current);
        setAnal(false);
        setErr('Could not reach server. Is the backend running?');
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  const handleAnalyze = async () => {
    if (!file) return;
    setAnal(true); setErr(''); setCoach(null);
    const form = new FormData();
    form.append('video', file);
    form.append('sport', sport);
    form.append('role', role.replace(/ /g, '_').toLowerCase());
    try {
      const r = await axios.post('/api/video/coach', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobId(r.data.job_id);
    } catch {
      setAnal(false);
      setErr('Upload failed. Make sure the backend is running on port 8000.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('video/')) setFile(f);
  };

  const resetVideo = () => { setCoach(null); setFile(null); setErr(''); setJobId(null); };

  /* ── Stats ─────────────────────────────────────────── */
  const stats = [
    { icon: <Flame className="w-4 h-4" />,     label: 'Streak',     value: '4 Days',    color: '#F59E0B' },
    { icon: <Calendar className="w-4 h-4" />,  label: 'This Week',  value: '3 Sessions', color: '#3B82F6' },
    { icon: <Activity className="w-4 h-4" />,  label: 'Readiness',  value: '85%',        color: '#22C55E' },
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Analyses',  value: coaching ? '1' : '0', color: '#A78BFA' },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Subtle orb */}
      <div className="orb orb-blue w-96 h-96 top-[-20%] right-0 opacity-15 pointer-events-none" />

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <p className="text-white/40 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-3xl font-black gradient-text">Hey, {name} 👋</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-blue">{cap(sport)}</span>
            <span className="badge badge-blue">{role.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
          </div>
        </div>

        {/* Goals editor */}
        <div className="glass p-4 rounded-2xl w-full lg:w-auto lg:min-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">My Goals</span>
            <div className="relative">
              <button onClick={() => setPicker(v => !v)}
                className="flex items-center gap-1 text-xs text-primary hover:text-blue-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Edit goals
              </button>
              <AnimatePresence>
                {showPicker && (
                  <motion.div
                    initial={{ opacity:0, y:-8, scale:.95 }}
                    animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:-8, scale:.95 }}
                    className="absolute right-0 top-6 z-50 glass-lg rounded-xl p-2 min-w-[200px] space-y-0.5 shadow-glass-lg"
                  >
                    {available.map(g => (
                      <button key={g} onClick={() => addGoal(g)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/08 text-white/60 hover:text-white transition-colors">
                        {g}
                      </button>
                    ))}
                    {available.length === 0 && (
                      <p className="text-xs text-white/30 px-3 py-2">All goals added!</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {goals.map(g => (
              <span key={g} className="flex items-center gap-1 badge badge-blue text-xs">
                {g}
                <button onClick={() => removeGoal(g)} className="hover:text-red-400 transition-colors ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {goals.length === 0 && (
              <span className="text-xs text-white/30">No goals yet — add some above ↑</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ icon, label, value, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background:`${color}18`, color }}>
                {icon}
              </div>
              <span className="text-xs text-white/40 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* ── AI Video Coach ────────────────────────────── */}
      <div className="glass-lg p-6 rounded-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-black text-lg leading-tight">AI Movement Coach</h2>
            <p className="text-xs text-white/40 mt-0.5">
              Upload a clip of you training — Mistral AI gives you personalised {cap(sport)} coaching
            </p>
          </div>
        </div>

        {/* Drop zone — only show when no coaching result yet */}
        {!coaching && !analyzing && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-white/12 hover:border-white/25 hover:bg-white/03'
              }`}
            >
              <input ref={fileRef} type="file" accept="video/*" className="hidden"
                     onChange={e => setFile(e.target.files?.[0] || null)} />
              <Video className="w-12 h-12 mx-auto text-white/20 mb-4" />
              {file ? (
                <>
                  <p className="font-semibold text-white/80 mb-1">{file.name}</p>
                  <p className="text-xs text-white/40">{(file.size/1024/1024).toFixed(1)} MB · Click to change</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-white/50 mb-1">Drop your video here or click to browse</p>
                  <p className="text-xs text-white/30">
                    MP4, MOV, AVI · Any length ·
                    Your sport: <strong className="text-primary">{cap(sport)}</strong> ·
                    Role: <strong className="text-primary">{role.replace(/_/g,' ')}</strong>
                  </p>
                </>
              )}
            </div>

            {file && (
              <motion.button
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                onClick={handleAnalyze}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3.5 text-sm font-bold"
              >
                <Zap className="w-4 h-4" /> Analyse with Mistral AI
              </motion.button>
            )}
          </>
        )}

        {/* Analysing spinner */}
        {analyzing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-14">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <Video className="absolute inset-0 m-auto w-6 h-6 text-primary" />
            </div>
            <p className="font-bold text-white/80 mb-1">Mistral AI is analysing your movement...</p>
            <p className="text-xs text-white/40">MediaPipe maps 33 body landmarks frame-by-frame · 30–60 seconds</p>
          </motion.div>
        )}

        {/* Error */}
        {err && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
          </div>
        )}

        {/* ── Coaching Results ─────────────────────── */}
        {coaching && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-5">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span className="font-bold text-accent">Analysis Complete</span>
                {coaching._source && (
                  <span className={`badge text-[10px] ${coaching._source === 'mistral' ? 'badge-blue' : 'badge-green'}`}>
                    {coaching._source === 'mistral' ? '🦙 Mistral' : '📚 Built-in'}
                  </span>
                )}
              </div>
              <button onClick={resetVideo}
                className="text-xs text-white/30 hover:text-white transition-colors flex items-center gap-1">
                New video <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Assessment + strengths */}
            <div className="glass p-5 rounded-2xl border border-accent/20"
                 style={{ background:'rgba(34,197,94,.05)' }}>
              <p className="text-sm text-white/70 leading-relaxed">{coaching.overall_assessment}</p>
              {coaching.strengths?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {coaching.strengths.map(s => (
                    <span key={s} className="badge badge-green text-xs">✓ {s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Technique tips */}
            {coaching.technique_tips?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                  Technique Improvements
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {coaching.technique_tips.map((tip, i) => {
                    const s = PRIORITY[tip.priority] || PRIORITY.low;
                    return (
                      <div key={i} className="glass p-4 rounded-xl"
                           style={{ borderColor:s.border, background:s.bg }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                               style={{ background:s.dot, boxShadow:`0 0 6px ${s.dot}` }} />
                          <span className="text-xs font-bold" style={{ color:s.color }}>{tip.title}</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">{tip.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Strategy tips */}
            {coaching.strategy_tips?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                  Strategy & Tactics
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {coaching.strategy_tips.map((tip, i) => (
                    <div key={i} className="glass p-4 rounded-xl">
                      <p className="text-xs font-bold text-blue-300 mb-1.5">{tip.title}</p>
                      <p className="text-xs text-white/55 leading-relaxed">{tip.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drills */}
            {coaching.drills?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                  Recommended Drills
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {coaching.drills.map((d, i) => (
                    <div key={i} className="glass p-4 rounded-xl">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-white/80 leading-tight">{d.name}</span>
                        <span className="badge badge-blue text-[10px] whitespace-nowrap flex-shrink-0">{d.reps}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{d.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

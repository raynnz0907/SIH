import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAthleteStore } from '../store/athleteStore';
import { Zap, ChevronRight, CheckCircle } from 'lucide-react';

const SPORTS = [
  { id: 'football',   label: 'Football',   emoji: '⚽' },
  { id: 'cricket',    label: 'Cricket',    emoji: '🏏' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'athletics',  label: 'Athletics',  emoji: '🏃' },
];

const ROLES = {
  football:   ['Striker', 'Winger', 'Central Midfielder', 'Centre Back', 'Goalkeeper'],
  cricket:    ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],
  basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  athletics:  ['Sprinter', 'Middle Distance', 'Jumper', 'Thrower'],
};

const GOALS = [
  'Improve acceleration', 'Build strength', 'Boost agility',
  'Increase stamina', 'Better flexibility', 'Injury prevention',
];

const STEPS = ['Sport & Role', 'Goals'];
const slide = { initial: { opacity: 0, x: 32 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -32 } };

export default function Onboarding() {
  const [step, setStep]       = useState(1);
  const [sport, setSport]     = useState('');
  const [role, setRole]       = useState('');
  const [goals, setGoals]     = useState([]);
  const [experience, setExp]  = useState('intermediate');

  const navigate = useNavigate();
  const { login } = useAthleteStore();

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const toggle = (g) => setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);

  const finish = () => {
    login(
      { name: 'Athlete', sport, role: role.toLowerCase().replace(/ /g, '_'), goals, experience },
      'local-session'
    );
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
         style={{ background: '#000005' }}>
      {/* Orbs */}
      <div className="orb orb-blue w-96 h-96 top-[-10%] left-[-10%] animate-pulse-glow" />
      <div className="orb orb-green w-72 h-72 bottom-[-5%] right-[-5%] animate-pulse-glow"
           style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-xl relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-50" />
            <Zap className="relative w-7 h-7 text-primary" />
          </div>
          <span className="font-black text-2xl tracking-tight gradient-text-blue">ATHLETIQ</span>
        </div>

        {/* Step indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-16 mb-3">
            {STEPS.map((label, i) => {
              const idx = i + 1;
              const done   = step > idx;
              const active = step === idx;
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 ${done ? 'bg-accent text-black' :
                      active ? 'bg-primary text-white' : 'bg-white/08 text-white/30'}`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : idx}
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-white' : 'text-white/30'}`}>{label}</span>
                </div>
              );
            })}
          </div>
          <div className="progress-bar">
            <motion.div className="progress-fill"
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }} />
          </div>
        </div>

        {/* Card */}
        <div className="glass-lg p-8">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Sport + Role ─────────────── */}
            {step === 1 && (
              <motion.div key="sport" {...slide} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Your sport</h2>
                  <p className="text-white/40 text-sm">Choose your sport and playing position</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">Sport</p>
                  <div className="grid grid-cols-2 gap-3">
                    {SPORTS.map(s => (
                      <button key={s.id}
                        onClick={() => { setSport(s.id); setRole(''); }}
                        className={`py-4 rounded-xl border text-center transition-all duration-200
                          ${sport === s.id
                            ? 'border-primary/60 bg-primary/10'
                            : 'border-white/08 bg-white/03 hover:bg-white/06 hover:border-white/15'}`}>
                        <div className="text-2xl mb-1">{s.emoji}</div>
                        <div className="text-sm font-semibold">{s.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {sport && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">Position / Role</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES[sport].map(r => (
                        <button key={r} onClick={() => setRole(r)}
                          className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all duration-200
                            ${role === r
                              ? 'border-primary/60 bg-primary/10 text-primary'
                              : 'border-white/08 bg-white/03 text-white/60 hover:bg-white/06 hover:text-white'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button onClick={next} disabled={!sport || !role}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Goals ──────────────────────── */}
            {step === 2 && (
              <motion.div key="goals" {...slide} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Your goals</h2>
                  <p className="text-white/40 text-sm">Select everything you want to improve</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map(g => {
                    const sel = goals.includes(g);
                    return (
                      <button key={g} onClick={() => toggle(g)}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all duration-200
                          ${sel
                            ? 'border-accent/60 bg-accent/10 text-accent'
                            : 'border-white/08 bg-white/03 text-white/60 hover:bg-white/06 hover:text-white'}`}>
                        {sel && <span className="mr-1.5">✓</span>}{g}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">Experience Level</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(e => (
                      <button key={e} onClick={() => setExp(e)}
                        className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-all duration-200
                          ${experience === e
                            ? 'border-warning/60 bg-warning/10 text-warning'
                            : 'border-white/08 bg-white/03 text-white/50 hover:bg-white/06'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={back} className="btn-ghost flex-1">Back</button>
                  <button onClick={finish}
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 0 24px rgba(34,197,94,.35)' }}>
                    <CheckCircle className="w-5 h-5" /> Let's Go!
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">No account required · Your data stays local</p>
      </div>
    </div>
  );
}

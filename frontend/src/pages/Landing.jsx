import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Camera, Brain, Target, ChevronRight, Shield, TrendingUp } from 'lucide-react';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000005' }}>
      {/* Orb decorations */}
      <div className="orb orb-blue w-[600px] h-[600px] top-[-15%] left-[50%] -translate-x-1/2 opacity-60" />
      <div className="orb orb-green w-80 h-80 bottom-[-5%] left-[-5%] opacity-40" />
      <div className="orb orb-purple w-64 h-64 top-[40%] right-[-5%] opacity-30" />

      {/* Navbar */}
      <nav className="glass-nav relative z-20 px-8 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-lg blur-md opacity-50" />
            <Zap className="relative w-7 h-7 text-primary" />
          </div>
          <span className="font-black text-xl tracking-tight gradient-text-blue">ATHLETIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/onboarding" className="btn-ghost py-2 px-5 text-sm">Log In</Link>
          <Link to="/onboarding" className="btn-primary py-2 px-5 text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-32 text-center">
        <motion.div {...fade(0)}>
          <span className="badge badge-blue mb-6 inline-flex">
            🏆 AI-Powered Athlete Development
          </span>
        </motion.div>

        <motion.h1
          {...fade(0.1)}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none"
        >
          <span className="gradient-text">Know Your Limit.</span>
          <br />
          <span className="gradient-text-blue">Break It.</span>
        </motion.h1>

        <motion.p {...fade(0.2)} className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed">
          Role-specific AI development plans built on biomechanical video analysis.
          Train smarter for your exact sport and position.
        </motion.p>

        <motion.div {...fade(0.3)} className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/onboarding"
            className="btn-primary text-base py-4 px-10 rounded-2xl flex items-center justify-center gap-2"
          >
            Start Your Assessment <ChevronRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="btn-ghost text-base py-4 px-10 rounded-2xl"
          >
            Learn More
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div {...fade(0.4)} className="flex justify-center gap-8 mt-20 text-center">
          {[['14', 'Sport Roles'], ['7', 'Movement Metrics'], ['4-Week', 'AI Plan']].map(([val, label]) => (
            <div key={label} className="glass px-6 py-4 rounded-2xl">
              <div className="text-2xl font-black gradient-text-blue">{val}</div>
              <div className="text-xs text-white/40 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-black text-center mb-12 gradient-text"
        >
          Everything you need to level up
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Camera className="w-6 h-6 text-primary" />, color: 'primary', title: 'Video Analysis', desc: 'Upload your movement. MediaPipe AI maps 33 body landmarks across every frame to find real biomechanical weaknesses.' },
            { icon: <Brain className="w-6 h-6 text-accent" />, color: 'accent', title: 'Role Intelligence', desc: 'Your scores are benchmarked against elite profiles for your exact sport role — Striker vs Centre Back vs Goalkeeper.' },
            { icon: <Target className="w-6 h-6 text-warning" />, color: 'warning', title: 'AI Training Plans', desc: 'Mistral LLM generates a personalised 4-week plan targeting your top bottlenecks with progressive overload built in.' },
            { icon: <TrendingUp className="w-6 h-6 text-purple-400" />, color: 'purple', title: 'Progress Tracking', desc: 'Log every session, track perceived exertion, and watch your movement scores improve over time.' },
            { icon: <Shield className="w-6 h-6 text-danger" />, color: 'danger', title: 'Recovery Protocols', desc: 'Role-specific recovery plans with foam rolling circuits, mobility flows, and load management guidance.' },
            { icon: <Zap className="w-6 h-6 text-yellow-400" />, color: 'yellow', title: 'No Account Needed', desc: 'Jump straight in. Select your sport, rate your ability, and get your personalised plan in under 3 minutes.' },
          ].map(({ icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass p-6 rounded-2xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/05 border border-white/08 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
              <h3 className="text-base font-bold mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-glow text-center mt-16 p-12 rounded-3xl"
        >
          <h2 className="text-3xl font-black mb-3 gradient-text-blue">Ready to break your limits?</h2>
          <p className="text-white/40 mb-8">No sign up. No credit card. Just your sport and your goals.</p>
          <Link to="/onboarding" className="btn-primary inline-flex items-center gap-2 py-4 px-10 rounded-2xl text-base">
            Get My Free Plan <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

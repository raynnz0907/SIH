import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScoreRadar from '../components/analysis/ScoreRadar';
import { Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'complete'

  useEffect(() => {
    // Mock polling
    const timer = setTimeout(() => {
      setStatus('complete');
    }, 3000);
    return () => clearTimeout(timer);
  }, [id]);

  const scores = { kneeStability: 45, hipMobility: 70, posture: 85, symmetry: 60, explosiveness: 40, flexibility: 65, balance: 75 };
  const benchmark = { kneeStability: 75, hipMobility: 80, posture: 80, symmetry: 80, explosiveness: 70, flexibility: 75, balance: 80 };

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Activity className="w-16 h-16 text-primary animate-pulse mb-6" />
        <h2 className="text-2xl font-bold mb-2">Analyzing Biomechanics...</h2>
        <p className="text-gray-400">Our AI is processing your movement patterns.</p>
        <div className="w-64 h-2 bg-surface rounded-full mt-8 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <p className="text-gray-400">Assessment completed on {new Date().toLocaleDateString()}</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          View Action Plan
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-subtle rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Biomechanical Profile</h3>
          <div className="h-[400px] w-full">
            <ScoreRadar scores={scores} benchmark={benchmark} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-danger">
              <AlertTriangle className="w-5 h-5" />
              Primary Bottlenecks
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                <div className="text-danger font-bold text-lg">Explosiveness</div>
                <div className="text-sm text-gray-300 mt-1">40/100 (Target: 70)</div>
                <p className="text-xs text-gray-400 mt-2">Lacking power generation in concentric phase of squat.</p>
              </div>
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="text-warning font-bold text-lg">Knee Stability</div>
                <div className="text-sm text-gray-300 mt-1">45/100 (Target: 75)</div>
                <p className="text-xs text-gray-400 mt-2">Valgus collapse detected during landing phase.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-accent">Strengths</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span>Posture</span>
                <span className="text-accent font-bold">85/100</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Balance</span>
                <span className="text-accent font-bold">75/100</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

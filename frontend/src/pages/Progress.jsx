import { useState } from 'react';
import ProgressChart from '../components/progress/ProgressChart';
import SessionLogger from '../components/progress/SessionLogger';
import { TrendingUp, Flame, Calendar, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function Progress() {
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);

  // Mock progress data
  const chartData = [
    { date: 'Wk 1', Explosiveness: 40, Stability: 45, Symmetry: 60 },
    { date: 'Wk 2', Explosiveness: 45, Stability: 50, Symmetry: 62 },
    { date: 'Wk 3', Explosiveness: 52, Stability: 58, Symmetry: 65 },
    { date: 'Wk 4', Explosiveness: 60, Stability: 65, Symmetry: 70 },
  ];

  const recentLogs = [
    { id: 1, date: new Date(), type: 'Plyometrics', exertion: 8, notes: 'Felt highly explosive on box jumps.' },
    { id: 2, date: new Date(Date.now() - 86400000), type: 'Strength', exertion: 7, notes: 'Good session, knee felt stable.' },
    { id: 3, date: new Date(Date.now() - 172800000), type: 'Recovery', exertion: 3, notes: 'Light foam rolling.' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-gray-400 mt-1">Monitor your adaptations over time.</p>
        </div>
        <button 
          onClick={() => setIsLoggerOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Log Session
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-warning mb-2 font-medium"><Flame className="w-4 h-4"/> Streak</div>
          <div className="text-3xl font-bold">4 Days</div>
        </div>
        <div className="bg-surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-primary mb-2 font-medium"><Calendar className="w-4 h-4"/> Sessions (Month)</div>
          <div className="text-3xl font-bold">12</div>
        </div>
        <div className="bg-surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-accent mb-2 font-medium"><TrendingUp className="w-4 h-4"/> Overall Gain</div>
          <div className="text-3xl font-bold text-accent">+15%</div>
        </div>
        <div className="bg-surface border border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2 font-medium"><Activity className="w-4 h-4"/> Avg Exertion</div>
          <div className="text-3xl font-bold">7.2/10</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-subtle rounded-2xl p-6 h-[400px]">
          <h3 className="font-bold text-lg mb-6">Bottleneck Improvements</h3>
          <ProgressChart data={chartData} />
        </div>

        <div className="bg-surface border border-subtle rounded-2xl p-6 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-4">Recent Logs</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {recentLogs.map(log => (
              <div key={log.id} className="p-4 rounded-xl border border-subtle bg-background">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">{log.type}</div>
                  <div className="text-xs text-gray-400">{format(log.date, 'MMM d')}</div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${i < log.exertion ? (log.exertion > 7 ? 'bg-danger' : 'bg-primary') : 'bg-subtle'}`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-2">RPE {log.exertion}</span>
                </div>
                <p className="text-sm text-gray-300 italic">"{log.notes}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SessionLogger isOpen={isLoggerOpen} onClose={() => setIsLoggerOpen(false)} />
    </div>
  );
}

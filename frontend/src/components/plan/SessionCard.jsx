import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(true);
  const [completed, setCompleted] = useState(false);

  return (
    <div className="bg-surface border border-subtle rounded-2xl overflow-hidden transition-all duration-300 shadow-sm">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-subtle/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-xl text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl">{session.name}</h3>
            <p className="text-gray-400 text-sm mt-1">{session.duration} minutes • {session.type}</p>
          </div>
        </div>
        <div>
          {expanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-subtle"
          >
            <div className="p-6 space-y-8">
              {/* Rationale */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
                <strong className="text-primary block mb-1">Why this session?</strong>
                <span className="text-gray-300">{session.rationale}</span>
              </div>

              {/* Warmup */}
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="bg-subtle w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Warm-up
                </h4>
                <p className="text-gray-400">{session.warmup}</p>
              </div>

              {/* Main Block */}
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="bg-subtle w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Main Work
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-gray-400 border-b border-subtle">
                      <tr>
                        <th className="pb-3 font-medium">Exercise</th>
                        <th className="pb-3 font-medium">Sets × Reps</th>
                        <th className="pb-3 font-medium">Intensity</th>
                        <th className="pb-3 font-medium">Rest</th>
                        <th className="pb-3 font-medium hidden sm:table-cell">Cue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle">
                      {session.exercises.map((ex, i) => (
                        <tr key={i} className="hover:bg-subtle/30 transition-colors">
                          <td className="py-4 font-semibold">{ex.name}</td>
                          <td className="py-4">{ex.sets} × {ex.reps}</td>
                          <td className="py-4 text-gray-400">{ex.intensity}</td>
                          <td className="py-4 text-gray-400">{ex.rest}</td>
                          <td className="py-4 text-gray-400 italic hidden sm:table-cell">"{ex.cue}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cooldown */}
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="bg-subtle w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Cool-down
                </h4>
                <p className="text-gray-400">{session.cooldown}</p>
              </div>

              {/* Action */}
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setCompleted(!completed)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                    completed 
                      ? 'bg-accent/20 text-accent border border-accent/50' 
                      : 'bg-primary hover:bg-blue-600 text-white'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {completed ? 'Session Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

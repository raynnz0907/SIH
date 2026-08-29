import { useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SessionLogger({ isOpen, onClose }) {
  const [exertion, setExertion] = useState(5);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface border border-subtle rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <div className="flex justify-between items-center p-6 border-b border-subtle">
            <h2 className="text-xl font-bold">Log Session</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Session Type</label>
              <select className="w-full bg-background border border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                <option>Strength & Conditioning</option>
                <option>Plyometrics</option>
                <option>Sport Specific Practice</option>
                <option>Active Recovery</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Duration (min)</label>
                <input type="number" defaultValue="60" className="w-full bg-background border border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sleep Quality</label>
                <select className="w-full bg-background border border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                  <option>Good</option>
                  <option>Average</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">Rate of Perceived Exertion (RPE)</label>
                <span className={`font-bold ${exertion > 7 ? 'text-danger' : exertion > 4 ? 'text-warning' : 'text-accent'}`}>{exertion}/10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={exertion}
                onChange={(e) => setExertion(parseInt(e.target.value))}
                className="w-full accent-primary" 
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Light</span>
                <span>Max Effort</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Session Notes</label>
              <textarea 
                rows="3" 
                className="w-full bg-background border border-subtle rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                placeholder="How did you feel? Any pain or discomfort?"
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors">
              Save Log
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

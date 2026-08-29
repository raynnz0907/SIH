import { BedDouble, Droplets, Apple, Activity, BookHeart } from 'lucide-react';

export default function RecoveryPlan() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recovery Protocols</h1>
        <p className="text-gray-400 mt-1">Optimize your body's adaptation and prevent injury.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-subtle rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-indigo-400" />
            Sleep & CNS Recovery
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-4 items-start">
              <div className="bg-indigo-400/20 text-indigo-400 p-2 rounded flex-shrink-0"><CheckIcon /></div>
              <div>
                <h4 className="font-bold">Target: 8+ Hours</h4>
                <p className="text-sm text-gray-400 mt-1">Due to high central nervous system tax from plyometrics, extended sleep is mandatory for adaptation.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="bg-indigo-400/20 text-indigo-400 p-2 rounded flex-shrink-0"><CheckIcon /></div>
              <div>
                <h4 className="font-bold">Sleep Hygiene</h4>
                <p className="text-sm text-gray-400 mt-1">No screens 60m before bed. Keep room temperature around 18°C (65°F).</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-surface border border-subtle rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-blue-400" />
            Active Recovery
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-4 items-start">
              <div className="bg-blue-400/20 text-blue-400 p-2 rounded flex-shrink-0"><CheckIcon /></div>
              <div>
                <h4 className="font-bold">Light Flush</h4>
                <p className="text-sm text-gray-400 mt-1">15-20 min stationary bike at low intensity (Zone 1) on rest days.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="bg-blue-400/20 text-blue-400 p-2 rounded flex-shrink-0"><CheckIcon /></div>
              <div>
                <h4 className="font-bold">Mobility Routine</h4>
                <p className="text-sm text-gray-400 mt-1">Focus on hip flexors and ankle dorsiflexion to support squat mechanics.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-surface border border-subtle rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Apple className="w-6 h-6 text-accent" />
            Nutrition Timing
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-4 items-start">
              <div className="bg-accent/20 text-accent p-2 rounded flex-shrink-0"><CheckIcon /></div>
              <div>
                <h4 className="font-bold">Post-Workout Window</h4>
                <p className="text-sm text-gray-400 mt-1">Consume 30g protein + 60g carbs within 45 minutes of session completion.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <div className="bg-accent/20 text-accent p-2 rounded flex-shrink-0"><CheckIcon /></div>
              <div>
                <h4 className="font-bold">Hydration</h4>
                <p className="text-sm text-gray-400 mt-1">Target 3.5L water daily. Add electrolytes on high-intensity days.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-surface border border-subtle rounded-2xl p-6 border-danger/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <BookHeart className="w-32 h-32 text-danger" />
          </div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-danger">
            <Activity className="w-6 h-6" />
            Injury Prevention
          </h2>
          <p className="text-gray-300 mb-4 text-sm leading-relaxed">
            Your analysis showed valgus knee collapse. To prevent ACL/MCL strain:
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><span className="text-danger">•</span> Always foam roll IT bands pre-workout.</li>
            <li className="flex gap-2"><span className="text-danger">•</span> Perform banded glute bridges before any lower body compound movements.</li>
            <li className="flex gap-2"><span className="text-danger">•</span> Abort jumping exercises if you feel sharp pain in the patellar tendon.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

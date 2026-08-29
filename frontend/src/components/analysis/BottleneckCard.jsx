import { cn } from '../../utils/cn';

export default function BottleneckCard({ bottleneck }) {
  const { attribute, score, benchmark, priority, explanation } = bottleneck;
  
  const gap = benchmark - score;
  
  const colors = {
    critical: 'bg-danger text-white',
    high: 'bg-warning text-white',
    medium: 'bg-blue-500 text-white',
  };

  const borderColors = {
    critical: 'border-danger/30',
    high: 'border-warning/30',
    medium: 'border-blue-500/30',
  };

  return (
    <div className={cn("bg-surface border rounded-xl p-5 relative overflow-hidden", borderColors[priority])}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-lg">{attribute}</h4>
        <span className={cn("text-xs font-bold px-2 py-1 rounded uppercase tracking-wider", colors[priority])}>
          {priority}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Score: {score}</span>
          <span className="text-gray-400">Target: {benchmark}</span>
        </div>
        <div className="h-2 w-full bg-background rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-subtle w-full"></div>
          <div 
            className={cn("absolute top-0 left-0 h-full", gap > 20 ? 'bg-danger' : gap > 10 ? 'bg-warning' : 'bg-primary')} 
            style={{ width: `${(score / 100) * 100}%` }}
          ></div>
          <div 
            className="absolute top-0 h-full bg-white w-1" 
            style={{ left: `${(benchmark / 100) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-right mt-1 text-gray-500">Gap: {gap} pts</div>
      </div>

      <p className="text-sm text-gray-300">{explanation}</p>
    </div>
  );
}

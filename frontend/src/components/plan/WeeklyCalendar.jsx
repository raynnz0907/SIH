import { Check, Dumbbell, Zap, Activity, Coffee } from 'lucide-react';
import { cn } from '../../utils/cn';

const typeIcons = {
  strength: <Dumbbell className="w-5 h-5" />,
  plyometrics: <Zap className="w-5 h-5" />,
  agility: <Activity className="w-5 h-5" />,
  sport: <Activity className="w-5 h-5" />,
  rest: <Coffee className="w-5 h-5" />
};

export default function WeeklyCalendar({ days }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
      {days.map((day, i) => (
        <div 
          key={i} 
          className={cn(
            "flex flex-col p-4 rounded-xl border relative transition-all",
            day.current ? "border-primary bg-primary/5" : "border-subtle bg-background",
            day.type === 'rest' ? "opacity-60" : ""
          )}
        >
          {day.completed && (
            <div className="absolute -top-2 -right-2 bg-accent text-white p-1 rounded-full shadow-lg">
              <Check className="w-3 h-3" />
            </div>
          )}
          
          <div className="text-xs text-gray-400 font-bold uppercase mb-2">{day.day}</div>
          
          <div className={cn(
            "flex-1 flex flex-col items-center justify-center text-center gap-2 py-4",
            day.type === 'rest' ? "text-gray-500" : "text-white"
          )}>
            {typeIcons[day.type]}
            <span className="font-semibold capitalize text-sm">{day.type}</span>
          </div>

          <div className="text-xs text-center font-medium text-gray-400 mt-2">
            {day.duration > 0 ? `${day.duration} min` : 'Rest'}
          </div>
        </div>
      ))}
    </div>
  );
}

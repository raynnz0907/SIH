import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

export default function ScoreRadar({ scores, benchmark }) {
  const data = Object.keys(scores).map(key => ({
    subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    A: scores[key],
    B: benchmark[key],
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#1F2937" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="Your Score" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
        <Radar name="Role Benchmark" dataKey="B" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} strokeDasharray="5 5" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

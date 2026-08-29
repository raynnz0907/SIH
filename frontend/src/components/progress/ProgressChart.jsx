import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function ProgressChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line type="monotone" dataKey="Explosiveness" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Stability" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Symmetry" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

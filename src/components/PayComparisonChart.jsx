import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const fmt = (v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d2b4e] border border-[#8dc63f] rounded-lg p-3 text-sm shadow-xl">
        <p className="font-bold text-white mb-2">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span style={{ color: p.fill || p.color }} className="font-semibold">
              {p.name}:
            </span>
            <span className="text-white">${p.value.toLocaleString()}</span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-1 pt-1 border-t border-white/20">
            <span className="text-[#8dc63f] font-semibold">
              Diff: {payload[1].value - payload[0].value >= 0 ? '+' : ''}
              ${(payload[1].value - payload[0].value).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function PayComparisonChart({ data, noteLabel }) {
  const chartData = data.map((d) => ({
    name: d.name,
    '2025 Actual': Math.round(d.pay2025),
    '2026 Proposed': Math.round(d.pay2026),
    note: d.note,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#cbd5e1', fontSize: 12, fontFamily: 'Barlow' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Barlow' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(141,198,63,0.06)' }} />
          <Legend
            wrapperStyle={{ fontFamily: 'Barlow', fontSize: 13, color: '#cbd5e1', paddingTop: 8 }}
          />
          <Bar dataKey="2025 Actual" fill="#1e4d8c" radius={[4, 4, 0, 0]} />
          <Bar dataKey="2026 Proposed" fill="#8dc63f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {noteLabel && (
        <p className="text-xs text-slate-400 mt-1 italic text-center">{noteLabel}</p>
      )}
    </div>
  );
}

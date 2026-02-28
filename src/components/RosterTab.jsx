import { residentialServiceData, residentialInstallData, commercialData } from '../data/payData';

const BELT_COLORS = {
  Gray:  { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  Blue:  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  Green: { bg: 'rgba(141,198,63,0.15)',  color: '#8dc63f' },
  Brown: { bg: 'rgba(180,120,60,0.15)',  color: '#b4783c' },
  Black: { bg: 'rgba(255,255,255,0.1)',  color: '#e2e8f0' },
};

function BeltBadge({ belt }) {
  const c = BELT_COLORS[belt] || BELT_COLORS.Gray;
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>
      {belt}
    </span>
  );
}

function DeptTable({ title, headers, rows }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-3">
        <h2
          className="text-base font-bold tracking-widest uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#8dc63f', letterSpacing: '0.1em' }}
        >
          {title}
        </h2>
        <div className="flex-1 h-px" style={{ background: 'rgba(141,198,63,0.25)' }} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e4d8c]/80 text-slate-200">
              {headers.map((h, i) => (
                <th key={i} className={`px-4 py-2.5 font-semibold ${i === 0 ? 'text-left' : 'text-center'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-semibold text-white' : 'text-center'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RosterTab() {
  const serviceRows = residentialServiceData.technicians.map(t => [
    t.name,
    <BeltBadge belt={t.belt} />,
    <span className="text-slate-300">L{t.level}</span>,
    <span className="font-bold text-[#8dc63f]">${t.hourly2026}/hr</span>,
    <span className="text-slate-400">${t.hourly2025}/hr</span>,
  ]);

  const installRows = residentialInstallData.technicians.map(t => [
    t.name,
    <BeltBadge belt={t.belt} />,
    <span className="text-slate-300">L{t.level}</span>,
    <span className="font-bold text-[#8dc63f]">${t.hourly2026}/hr</span>,
    <span className="text-slate-400">${t.hourly2025}/hr</span>,
  ]);

  const commercialRows = commercialData.technicians.map(t => [
    t.name,
    <BeltBadge belt={t.belt} />,
    <span className="text-slate-300">{t.focus}</span>,
    <span className="font-bold text-[#8dc63f]">${t.hourly2026}/hr</span>,
    <span className="text-slate-400">${t.hourly2025}/hr</span>,
  ]);

  return (
    <div className="space-y-4">
      <DeptTable
        title="Residential Service"
        headers={['Name', 'Belt', 'Service Level', '2026 Hourly', '2025 Hourly']}
        rows={serviceRows}
      />
      <DeptTable
        title="Residential Install"
        headers={['Name', 'Belt', 'Level', '2026 Hourly', '2025 Hourly']}
        rows={installRows}
      />
      <DeptTable
        title="Commercial"
        headers={['Name', 'Belt', 'Focus', '2026 Hourly', '2025 Hourly']}
        rows={commercialRows}
      />
    </div>
  );
}

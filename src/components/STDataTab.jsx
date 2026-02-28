import { monthlyData } from '../data/payData';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmt  = (n) => n == null || n === 0 ? '—' : '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtH = (n) => n == null || n === 0 ? '—' : Number(n).toFixed(1);

const DEPARTMENTS = [
  {
    label: 'Residential Service',
    techs: ['Tim W.', 'Adam E.', 'Cannan B.', 'JJ L.', 'Kaleb G.', 'Adam D.', 'Marisa H.'],
    showTGL: false,
  },
  {
    label: 'Residential Install',
    techs: ['Bubba B.', 'Mike N.', 'Steve G.', 'Greg C.', 'Josiah B.', 'Josh S.'],
    showTGL: false,
  },
  {
    label: 'Commercial',
    techs: ['Dorie L.', 'Grady T.', 'Alex T.', 'Ronnie S.', 'Brandon G.', 'Ethan H.', 'Jack D.'],
    showTGL: true,
  },
];

function TechTable({ name, showTGL }) {
  const rows = MONTHS.map((month) => {
    const d = monthlyData.find((r) => r.name === name && r.month === month);
    return { month, ...(d || { revenue: 0, sales: 0, tgl: 0, totalSales: 0, billableHours: 0 }) };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + (r.revenue || 0),
      sales: acc.sales + (r.sales || 0),
      tgl: acc.tgl + (r.tgl || 0),
      totalSales: acc.totalSales + (r.totalSales || 0),
      billableHours: acc.billableHours + (r.billableHours || 0),
    }),
    { revenue: 0, sales: 0, tgl: 0, totalSales: 0, billableHours: 0 }
  );

  return (
    <div className="mb-8">
      <div
        className="px-4 py-3 text-sm font-bold tracking-widest uppercase rounded-t-xl"
        style={{ background: 'rgba(141,198,63,0.2)', color: '#8dc63f', borderBottom: '1px solid rgba(141,198,63,0.3)', fontSize: 15, letterSpacing: '0.06em' }}
      >
        {name}
      </div>
      <div className="overflow-x-auto rounded-b-xl border border-white/10">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-[#1e4d8c]/80 text-slate-200">
              <th className="px-4 py-2 text-left font-semibold">Month</th>
              <th className="px-4 py-2 text-center font-semibold">Revenue</th>
              <th className="px-4 py-2 text-center font-semibold">Sales</th>
              {showTGL && <th className="px-4 py-2 text-center font-semibold">TGL</th>}
              {showTGL && <th className="px-4 py-2 text-center font-semibold">Sales + TGL</th>}
              <th className="px-4 py-2 text-center font-semibold">Billable Hrs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isEmpty = !r.revenue && !r.sales && !r.billableHours;
              return (
                <tr key={r.month} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                  <td className="px-4 py-2 text-slate-300 font-medium">{r.month}</td>
                  <td className={`px-4 py-2 text-center ${isEmpty ? 'text-slate-600' : 'text-white'}`}>{isEmpty ? '—' : fmt(r.revenue)}</td>
                  <td className={`px-4 py-2 text-center ${isEmpty ? 'text-slate-600' : 'text-slate-300'}`}>{isEmpty ? '—' : fmt(r.sales)}</td>
                  {showTGL && <td className={`px-4 py-2 text-center ${isEmpty ? 'text-slate-600' : 'text-slate-300'}`}>{isEmpty ? '—' : fmt(r.tgl)}</td>}
                  {showTGL && <td className={`px-4 py-2 text-center font-semibold ${isEmpty ? 'text-slate-600' : 'text-[#8dc63f]'}`}>{isEmpty ? '—' : fmt(r.totalSales)}</td>}
                  <td className={`px-4 py-2 text-center ${isEmpty ? 'text-slate-600' : 'text-slate-300'}`}>{isEmpty ? '—' : fmtH(r.billableHours)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(13,43,78,0.8)', borderTop: '1px solid rgba(141,198,63,0.3)' }}>
              <td className="px-4 py-2 font-bold text-[#8dc63f]">TOTAL</td>
              <td className="px-4 py-2 text-center font-bold text-white">{fmt(totals.revenue)}</td>
              <td className="px-4 py-2 text-center font-bold text-slate-200">{fmt(totals.sales)}</td>
              {showTGL && <td className="px-4 py-2 text-center font-bold text-slate-200">{fmt(totals.tgl)}</td>}
              {showTGL && <td className="px-4 py-2 text-center font-bold text-[#8dc63f]">{fmt(totals.totalSales)}</td>}
              <td className="px-4 py-2 text-center font-bold text-slate-200">{fmtH(totals.billableHours)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function DeptSummaryTable() {
  const summaries = DEPARTMENTS.map((dept) => {
    let totalRevenue = 0, totalSales = 0, totalHours = 0, count = 0;
    dept.techs.forEach((name) => {
      MONTHS.forEach((month) => {
        const d = monthlyData.find((r) => r.name === name && r.month === month);
        if (d && (d.revenue || d.billableHours)) {
          totalRevenue += d.revenue || 0;
          totalSales += d.totalSales || 0;
          totalHours += d.billableHours || 0;
          count++;
        }
      });
    });
    return {
      label: dept.label,
      avgRevenue: count ? totalRevenue / count : 0,
      avgSales: count ? totalSales / count : 0,
      avgHours: count ? totalHours / count : 0,
    };
  });

  return (
    <div className="mb-10">
      <div
        className="px-4 py-2.5 text-xs font-bold tracking-widest uppercase rounded-t-xl"
        style={{ background: 'rgba(141,198,63,0.15)', color: '#8dc63f', borderBottom: '1px solid rgba(141,198,63,0.3)' }}
      >
        2025 Department Averages (Active Months Only)
      </div>
      <div className="overflow-x-auto rounded-b-xl border border-white/10">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <thead>
            <tr className="bg-[#8dc63f] text-[#0d2b4e]">
              <th className="px-4 py-2.5 text-left font-bold">Department</th>
              <th className="px-4 py-2.5 text-center font-bold">Avg Monthly Revenue</th>
              <th className="px-4 py-2.5 text-center font-bold">Avg Monthly Total Sales</th>
              <th className="px-4 py-2.5 text-center font-bold">Avg Billable Hrs</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s, i) => (
              <tr key={s.label} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                <td className="px-4 py-2.5 font-semibold text-white">{s.label}</td>
                <td className="px-4 py-2.5 text-center text-white">{fmt(s.avgRevenue)}</td>
                <td className="px-4 py-2.5 text-center text-white">{fmt(s.avgSales)}</td>
                <td className="px-4 py-2.5 text-center text-slate-300">{fmtH(s.avgHours)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function STDataTab() {
  return (
    <div className="space-y-10">
      <DeptSummaryTable />
      {DEPARTMENTS.map((dept) => (
        <div key={dept.label}>
          <div className="flex items-center gap-4 mb-5">
            <h2
              className="text-base font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#8dc63f', letterSpacing: '0.1em' }}
            >
              {dept.label}
            </h2>
            <div className="flex-1 h-px" style={{ background: 'rgba(141,198,63,0.25)' }} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {dept.techs.map((name) => (
              <TechTable key={name} name={name} showTGL={dept.showTGL} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

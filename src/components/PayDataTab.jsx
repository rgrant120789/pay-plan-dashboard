const fmt = (n) => '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtH = (n) => Number(n).toLocaleString();

const DEPARTMENTS = [
  {
    label: 'Residential Service',
    techs: [
      { name: 'Tim W.',    regHours: 1950, otHours: 54,  pay2025: 88891.39  },
      { name: 'Adam E.',   regHours: 2080, otHours: 183, pay2025: 104806.66 },
      { name: 'Kaleb G.',  regHours: 1945, otHours: 111, pay2025: 103273.18 },
      { name: 'Cannan B.', regHours: 1986, otHours: 22,  pay2025: 66776.41  },
      { name: 'Adam D.',   regHours: 1571, otHours: 18,  pay2025: 45538.32, note: 'partial year' },
      { name: 'JJ L.',     regHours: 530,  otHours: 14,  pay2025: 16202.10, note: 'partial year' },
      { name: 'Marisa H.', regHours: 838,  otHours: 10,  pay2025: 19015.96, note: 'partial year' },
    ],
  },
  {
    label: 'Residential Install',
    techs: [
      { name: 'Bubba B.',  regHours: 1742, otHours: 0,  pay2025: 99401.27  },
      { name: 'Mike N.',   regHours: 1558, otHours: 4,  pay2025: 85983.10  },
      { name: 'Steve G.',  regHours: 1878, otHours: 7,  pay2025: 106845.80 },
      { name: 'Greg C.',   regHours: 2001, otHours: 48, pay2025: 64123.03, note: 'partial year' },
      { name: 'Josiah B.', regHours: 621,  otHours: 21, pay2025: 38474.68, note: 'partial year' },
      { name: 'Josh S.',   regHours: 1840, otHours: 34, pay2025: 91829.19  },
    ],
  },
  {
    label: 'Commercial',
    techs: [
      { name: 'Dorie L.',   regHours: 2020, otHours: 143, pay2025: 111865.08 },
      { name: 'Grady T.',   regHours: 2003, otHours: 134, pay2025: 99399.39  },
      { name: 'Alex T.',    regHours: 1980, otHours: 166, pay2025: 100426.86 },
      { name: 'Brandon G.', regHours: 2016, otHours: 112, pay2025: 80747.17  },
      { name: 'Ethan H.',   regHours: 1923, otHours: 81,  pay2025: 83934.47  },
      { name: 'Jack D.',    regHours: 2008, otHours: 131, pay2025: 92193.63  },
      { name: 'Ronnie S.',  regHours: 642,  otHours: 27,  pay2025: null, note: 'partial year' },
    ],
  },
];

function DeptTable({ label, techs }) {
  const totals = techs.reduce((acc, t) => ({
    regHours: acc.regHours + t.regHours,
    otHours:  acc.otHours  + t.otHours,
    pay2025:  acc.pay2025  + (t.pay2025 || 0),
  }), { regHours: 0, otHours: 0, pay2025: 0 });

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-3">
        <h2
          className="text-base font-bold tracking-widest uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#8dc63f', letterSpacing: '0.1em' }}
        >
          {label}
        </h2>
        <div className="flex-1 h-px" style={{ background: 'rgba(141,198,63,0.25)' }} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e4d8c]/80 text-slate-200">
              <th className="px-4 py-2.5 text-left font-semibold">Name</th>
              <th className="px-4 py-2.5 text-center font-semibold">Reg Hours</th>
              <th className="px-4 py-2.5 text-center font-semibold">OT Hours</th>
              <th className="px-4 py-2.5 text-center font-semibold">Total Hours</th>
              <th className="px-4 py-2.5 text-center font-semibold">2025 Total Pay</th>
            </tr>
          </thead>
          <tbody>
            {techs.map((t, i) => (
              <tr key={t.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                <td className="px-4 py-2.5 font-semibold text-white">
                  {t.name}
                  {t.note === 'partial year' && <span className="ml-1 text-xs text-red-400 italic">*partial year</span>}
                </td>
                <td className="px-4 py-2.5 text-center text-slate-300">{fmtH(t.regHours)}</td>
                <td className="px-4 py-2.5 text-center text-slate-300">{fmtH(t.otHours)}</td>
                <td className="px-4 py-2.5 text-center text-white font-semibold">{fmtH(t.regHours + t.otHours)}</td>
                <td className="px-4 py-2.5 text-center font-bold text-[#8dc63f]">
                  {t.pay2025 ? fmt(t.pay2025) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(13,43,78,0.8)', borderTop: '1px solid rgba(141,198,63,0.3)' }}>
              <td className="px-4 py-2.5 font-bold text-[#8dc63f]">TOTAL</td>
              <td className="px-4 py-2.5 text-center font-bold text-white">{fmtH(totals.regHours)}</td>
              <td className="px-4 py-2.5 text-center font-bold text-white">{fmtH(totals.otHours)}</td>
              <td className="px-4 py-2.5 text-center font-bold text-white">{fmtH(totals.regHours + totals.otHours)}</td>
              <td className="px-4 py-2.5 text-center font-bold text-[#8dc63f]">{fmt(totals.pay2025)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryTable() {
  const summaries = DEPARTMENTS.map((dept) => {
    const active = dept.techs.filter((t) => !t.note);
    const totals = dept.techs.reduce((acc, t) => ({
      regHours: acc.regHours + t.regHours,
      otHours:  acc.otHours  + t.otHours,
      pay2025:  acc.pay2025  + (t.pay2025 || 0),
    }), { regHours: 0, otHours: 0, pay2025: 0 });
    const avgReg = active.length ? active.reduce((s, t) => s + t.regHours, 0) / active.length : 0;
    const avgOT  = active.length ? active.reduce((s, t) => s + t.otHours,  0) / active.length : 0;
    const avgPay = active.length ? active.reduce((s, t) => s + (t.pay2025 || 0), 0) / active.length : 0;
    return { label: dept.label, totals, avgReg, avgOT, avgPay, count: dept.techs.length };
  });

  return (
    <div className="mb-10">
      <div
        className="px-4 py-2.5 text-xs font-bold tracking-widest uppercase rounded-t-xl"
        style={{ background: 'rgba(141,198,63,0.15)', color: '#8dc63f', borderBottom: '1px solid rgba(141,198,63,0.3)' }}
      >
        2025 Department Summary (Averages exclude partial year techs)
      </div>
      <div className="overflow-x-auto rounded-b-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#8dc63f] text-[#0d2b4e]">
              <th className="px-4 py-2.5 text-left font-bold">Department</th>
              <th className="px-4 py-2.5 text-center font-bold">Avg Reg Hrs</th>
              <th className="px-4 py-2.5 text-center font-bold">Avg OT Hrs</th>
              <th className="px-4 py-2.5 text-center font-bold">Avg 2025 Pay</th>
              <th className="px-4 py-2.5 text-center font-bold">Total 2025 Pay</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s, i) => (
              <tr key={s.label} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                <td className="px-4 py-2.5 font-semibold text-white">{s.label}</td>
                <td className="px-4 py-2.5 text-center text-white">{s.avgReg.toFixed(0)}</td>
                <td className="px-4 py-2.5 text-center text-white">{s.avgOT.toFixed(0)}</td>
                <td className="px-4 py-2.5 text-center text-white">{fmt(s.avgPay)}</td>
                <td className="px-4 py-2.5 text-center font-bold text-[#8dc63f]">{fmt(s.totals.pay2025)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PayDataTab() {
  return (
    <div className="space-y-4">
      <SummaryTable />
      {DEPARTMENTS.map((dept) => (
        <DeptTable key={dept.label} label={dept.label} techs={dept.techs} />
      ))}
    </div>
  );
}

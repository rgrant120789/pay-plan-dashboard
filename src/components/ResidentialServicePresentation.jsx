import BeltSkillsTable from './BeltSkillsTable';
import BehaviorsScorecardSection from './BehaviorsScorecardSection';

const BELT_COLORS = { Gray: '#9ca3af', Blue: '#3b82f6', Green: '#84cc16', Brown: '#92400e', Black: '#e5e7eb' };
const BELT_BG = { Gray: 'rgba(156,163,175,0.12)', Blue: 'rgba(59,130,246,0.10)', Green: 'rgba(132,204,22,0.10)', Brown: 'rgba(146,64,14,0.15)', Black: 'rgba(229,231,235,0.08)' };

const beltLevels = [
  { title: 'Apprentice', belt: 'Gray',  basePay: '$18–$21/hr',  tenure: '0–1 yrs' },
  { title: 'Junior Tech', belt: 'Blue',  basePay: '$22–$25/hr',  tenure: '1–3 yrs' },
  { title: 'Lead Tech',   belt: 'Green', basePay: '$26–$29/hr',  tenure: '3–5 yrs' },
  { title: 'Senior Tech', belt: 'Brown', basePay: '$30–$34/hr',  tenure: '5–10 yrs' },
  { title: 'Master Tech', belt: 'Black', basePay: '$35+/hr',     tenure: '10+ yrs' },
];

const commissions = [
  { level: 1, workDone: '6%',  soldBy: '5%', total: '11%' },
  { level: 2, workDone: '8%',  soldBy: '5%', total: '13%' },
  { level: 3, workDone: '10%', soldBy: '5%', total: '15%' },
  { level: 4, workDone: '12%', soldBy: '5%', total: '17%' },
];

function Card({ title, accent = '#8dc63f', children }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#0d2b4e', border: `1px solid ${accent}30` }}>
      <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: accent }}>{title}</h2>
      {children}
    </div>
  );
}

export default function ResidentialServicePresentation({ setActiveTab }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Back */}
      <button onClick={() => setActiveTab('presentations')} className="text-xs font-bold tracking-widest uppercase flex items-center gap-2" style={{ color: '#64748b' }}>
        ← Back to Presentations
      </button>

      {/* Hero */}
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: 'linear-gradient(135deg, #0d2b4e, #0a3d1f)', border: '2px solid #8dc63f40' }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>2026 Pay Plan</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-wide uppercase mb-3" style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}>
          Residential Service
        </h1>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Your pay is designed to reward performance. Each week you are paid the <span className="text-white font-bold">higher</span> of your hourly rate or your commission — whichever puts more money in your pocket.
        </p>
      </div>

      {/* How pay works */}
      <Card title="How Your Pay Works">
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.2)' }}>
            <p className="text-white font-bold mb-1">Option A — Hourly Pay</p>
            <p className="text-slate-300 text-sm">Hourly Rate × Regular Hours <span className="text-slate-500">+</span> (Hourly Rate × 1.5 × Overtime Hours)</p>
          </div>
          <div className="text-center text-2xl font-black" style={{ color: '#8dc63f' }}>OR</div>
          <div className="rounded-xl p-4" style={{ background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.2)' }}>
            <p className="text-white font-bold mb-1">Option B — Commission Pay</p>
            <p className="text-slate-300 text-sm">(Revenue × Work Done %) <span className="text-slate-500">+</span> (Sales × Sold By %)</p>
          </div>
          <p className="text-slate-400 text-xs text-center pt-1">Every week, whichever is higher is what you get paid. Hourly is always your floor — commission is your ceiling.</p>
        </div>
      </Card>

      {/* Commission rates */}
      <Card title="Commission Rates by Service Level">
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#8dc63f', color: '#0d2b4e' }}>
                <th className="px-4 py-3 text-left font-bold">Service Level</th>
                <th className="px-4 py-3 text-center font-bold">Work Done %</th>
                <th className="px-4 py-3 text-center font-bold">Sold By %</th>
                <th className="px-4 py-3 text-center font-bold">Total %</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((row, i) => (
                <tr key={row.level} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                  <td className="px-4 py-3 font-bold text-white">Level {row.level}</td>
                  <td className="px-4 py-3 text-center text-slate-300">{row.workDone}</td>
                  <td className="px-4 py-3 text-center text-slate-300">{row.soldBy}</td>
                  <td className="px-4 py-3 text-center font-bold" style={{ color: '#8dc63f' }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">Service Level is based on your average ticket value and close rate. Higher performance = higher commission %.</p>
      </Card>

      {/* Service Level Requirements */}
      <Card title="Service Level Requirements">
        <p className="text-xs text-slate-400 mb-4">All KPIs are measured quarterly. You must meet Retain Level KPIs to keep your current level, and Level Up KPIs to advance.</p>

        {/* Retain */}
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>
          Retain Level KPIs <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(141,198,63,0.15)', border: '1px solid rgba(141,198,63,0.35)', color: '#8dc63f' }}>Measured Quarterly</span>
        </p>
        <div className="overflow-hidden rounded-xl border border-white/10 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(30,77,140,0.6)', color: '#cbd5e1' }}>
                <th className="px-4 py-2.5 text-left font-semibold">KPI</th>
                <th className="px-4 py-2.5 text-center font-semibold">L1</th>
                <th className="px-4 py-2.5 text-center font-semibold">L2</th>
                <th className="px-4 py-2.5 text-center font-semibold">L3</th>
                <th className="px-4 py-2.5 text-center font-semibold">L4</th>
              </tr>
            </thead>
            <tbody>
              {[
                { metric: 'Avg Ticket', l1: '$650', l2: '$800', l3: '$1,000', l4: '$1,200' },
                { metric: 'Close Rate', l1: '65%',  l2: '70%',  l3: '75%',   l4: '80%'   },
              ].map((row, i) => (
                <tr key={row.metric} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-2.5 text-slate-300">{row.metric}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l1}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l2}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l3}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Level Up */}
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>
          Level Up KPIs <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(141,198,63,0.15)', border: '1px solid rgba(141,198,63,0.35)', color: '#8dc63f' }}>Measured Quarterly</span>
        </p>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(30,77,140,0.6)', color: '#cbd5e1' }}>
                <th className="px-4 py-2.5 text-left font-semibold">KPI</th>
                <th className="px-4 py-2.5 text-center font-semibold">L1</th>
                <th className="px-4 py-2.5 text-center font-semibold">L2</th>
                <th className="px-4 py-2.5 text-center font-semibold">L3</th>
                <th className="px-4 py-2.5 text-center font-semibold">L4</th>
              </tr>
            </thead>
            <tbody>
              {[
                { metric: 'Avg Ticket', l1: '$750', l2: '$900', l3: '$1,200', l4: '—' },
                { metric: 'Close Rate', l1: '70%',  l2: '75%',  l3: '80%',   l4: '—' },
              ].map((row, i) => (
                <tr key={row.metric + 'up'} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-2.5 text-slate-300">{row.metric}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l1}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l2}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l3}</td>
                  <td className="px-4 py-2.5 text-center text-white">{row.l4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Spiffs */}
      <Card title="Additional Spiff Opportunities">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Google Review', value: '$15', desc: 'Per verified 5-star review' },
            { label: 'Yard Sign', value: '$5', desc: 'Per yard sign placed' },
            { label: 'Weekly On-Call', value: '$100', desc: 'Per on-call week completed' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.2)' }}>
              <p className="text-2xl font-black mb-1" style={{ color: '#8dc63f' }}>{s.value}</p>
              <p className="text-white font-bold text-sm mb-1">{s.label}</p>
              <p className="text-slate-400 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Belt levels */}
      <Card title="Belt Levels & Base Hourly Ranges">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {beltLevels.map((b) => (
            <div key={b.belt} className="rounded-xl p-4 text-center" style={{ background: BELT_BG[b.belt], border: `1px solid ${BELT_COLORS[b.belt]}40` }}>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase mb-2" style={{ background: BELT_COLORS[b.belt], color: b.belt === 'Black' ? '#111' : '#fff' }}>{b.belt}</div>
              <p className="font-bold text-white text-sm">{b.title}</p>
              <p className="text-xs font-bold mt-1" style={{ color: BELT_COLORS[b.belt] }}>{b.basePay}</p>
              <p className="text-xs text-slate-500 mt-1">{b.tenure}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Belt advancement requires peer approval. Your belt level determines your base hourly rate range.</p>
      </Card>

      {/* Skills */}
      <Card title="Skills Required by Belt Level">
        <BeltSkillsTable type="service" />
      </Card>

      <BehaviorsScorecardSection Card={Card} />

    </div>
  );
}

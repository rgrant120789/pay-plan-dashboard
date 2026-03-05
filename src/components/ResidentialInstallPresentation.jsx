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

const bonuses = [
  { metric: 'Billable Hours', goal: '160 hrs/mo', bonus: '$1,000', desc: 'Hit 160 billable hours in the month' },
  { metric: 'Revenue',        goal: '$85,000/mo',  bonus: '$1,000', desc: 'Team hits $85k in monthly revenue' },
  { metric: 'Sales',          goal: '$10,000/mo',  bonus: '$1,000', desc: 'Team hits $10k in monthly sales' },
];

function Card({ title, accent = '#8dc63f', children }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#0d2b4e', border: `1px solid ${accent}30` }}>
      <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: accent }}>{title}</h2>
      {children}
    </div>
  );
}

export default function ResidentialInstallPresentation({ setActiveTab }) {
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
          Residential Install
        </h1>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Your hourly pay is <span className="text-white font-bold">guaranteed</span> every week regardless of performance. On top of that, you can earn up to <span className="text-white font-bold">$3,000 in monthly bonuses</span> by hitting team goals.
        </p>
      </div>

      {/* How pay works */}
      <Card title="How Your Pay Works">
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.2)' }}>
            <p className="text-white font-bold mb-1">Guaranteed Hourly Pay</p>
            <p className="text-slate-300 text-sm">Hourly Rate × Regular Hours <span className="text-slate-500">+</span> (Hourly Rate × 1.5 × Overtime Hours)</p>
            <p className="text-slate-400 text-xs mt-2">This is paid every week no matter what. Your base pay is never at risk.</p>
          </div>
          <div className="text-center text-2xl font-black" style={{ color: '#8dc63f' }}>+</div>
          <div className="rounded-xl p-4" style={{ background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.2)' }}>
            <p className="text-white font-bold mb-1">Monthly Bonus Goals — Up to $3,000/mo</p>
            <p className="text-slate-300 text-sm">Each bonus category is independent. Hit any combination to earn that bonus. You don't need to hit all three.</p>
          </div>
        </div>
      </Card>

      {/* Bonus goals */}
      <Card title="Monthly Bonus Goals">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {bonuses.map((b) => (
            <div key={b.metric} className="rounded-xl p-5 text-center" style={{ background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.2)' }}>
              <p className="text-2xl font-black mb-1" style={{ color: '#8dc63f' }}>{b.bonus}</p>
              <p className="text-white font-bold text-sm mb-1">{b.metric}</p>
              <p className="text-xs font-bold mb-2" style={{ color: '#8dc63f' }}>{b.goal}</p>
              <p className="text-slate-400 text-xs">{b.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(141,198,63,0.05)', border: '1px solid rgba(141,198,63,0.15)' }}>
          <p className="text-white font-bold">Hit all three = <span style={{ color: '#8dc63f' }}>$3,000 bonus that month</span></p>
          <p className="text-slate-400 text-xs mt-1">Each goal is tracked independently — hitting one or two still pays out.</p>
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
        <BeltSkillsTable type="install" />
      </Card>

      <BehaviorsScorecardSection Card={Card} />

    </div>
  );
}

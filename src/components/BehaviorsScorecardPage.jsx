import SectionCard from './SectionCard';

const BEHAVIORS = [
  {
    category: 'CRITICAL',
    behavior: 'Attitude & Team Mindset',
    description: 'Maintains a positive, solution-focused attitude and treats coworkers and customers with respect.',
    kpis: ['Positive communication', 'Handles challenges without negativity', 'Supports coworkers and company culture'],
  },
  {
    category: 'CRITICAL',
    behavior: 'Attendance & Reliability',
    description: 'Consistently arrives on time, prepared for the day, and communicates early if issues arise.',
    kpis: ['On-time arrival', 'Minimal call-offs', 'Early communication for delays or schedule conflicts'],
  },
  {
    category: 'CRITICAL',
    behavior: 'Customer Satisfaction',
    description: 'Delivers a professional customer experience through clear communication, quality work, and leaving the jobsite clean.',
    kpis: ['Professional customer communication', 'Clean jobsite and work area', 'Positive customer feedback'],
  },
  {
    category: 'Operational',
    behavior: 'Professional Appearance',
    description: 'Maintains a clean, complete uniform and professional appearance that reflects company standards.',
    kpis: ['Clean company uniform', 'Proper PPE when required', 'Professional appearance on job sites'],
  },
  {
    category: 'Operational',
    behavior: 'Truck Readiness & Inspection',
    description: 'Maintains a clean, organized, and properly stocked service vehicle and completes required inspections.',
    kpis: ['Truck inspection completed', 'Organized tools and inventory', 'Clean and safe vehicle condition'],
  },
  {
    category: 'Operational',
    behavior: 'Preparation & Job Readiness',
    description: 'Arrives prepared for each job with the necessary tools, materials, and understanding of the work required.',
    kpis: ['Reviews job details before arrival', 'Brings necessary tools and materials', 'Minimizes repeat trips'],
  },
  {
    category: 'Operational',
    behavior: 'Problem Solving',
    description: 'Approaches challenges with initiative and works to diagnose and resolve issues before escalating.',
    kpis: ['Diagnoses issues independently when possible', 'Uses available resources to find solutions', 'Learns from mistakes and improves processes'],
  },
];

const SCORES = ['Excellent', 'Meets Expectations', 'Needs Improvement'];

const SCORE_COLORS = {
  'Excellent':           { color: '#8dc63f', bg: 'transparent' },
  'Meets Expectations':  { color: '#94a3b8', bg: 'transparent' },
  'Needs Improvement':   { color: '#f87171', bg: 'transparent' },
};

const PROMO_REQUIREMENTS = [
  { label: 'Attitude & Team Mindset', value: 'Excellent', valueColor: '#8dc63f' },
  { label: 'Attendance & Reliability', value: 'Excellent', valueColor: '#8dc63f' },
  { label: 'Customer Satisfaction', value: 'Excellent', valueColor: '#8dc63f' },
  { label: 'No category rated', value: 'Needs Improvement', valueColor: '#f87171' },
  { label: 'Minimum 4 of 7 categories', value: 'Excellent', valueColor: '#8dc63f' },
];

export default function BehaviorsScorecardPage() {
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="rounded-xl border px-5 py-4" style={{ borderColor: 'rgba(141,198,63,0.3)', background: 'rgba(141,198,63,0.06)' }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#8dc63f' }}>Behaviors Scorecard</p>
        <p className="text-sm text-slate-300">Used during performance reviews to evaluate technician behaviors. Scores determine promotion eligibility.</p>
      </div>

      {/* Scorecard table */}
      <SectionCard title="Technician Behavior Scorecard">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th className="text-left px-3 py-2.5 font-bold tracking-widest uppercase text-xs" style={{ color: '#8dc63f', width: '38%' }}>Behavior</th>
                <th className="text-left px-3 py-2.5 font-bold tracking-widest uppercase text-xs" style={{ color: '#8dc63f', width: '36%' }}>KPI's</th>
                <th className="text-left px-3 py-2.5 font-bold tracking-widest uppercase text-xs" style={{ color: '#8dc63f', width: '26%' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {BEHAVIORS.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
                  }}
                >
                  <td className="px-3 py-4 align-top">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{row.behavior}</span>
                      <span
                        className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-full"
                        style={{
                          color: row.category === 'CRITICAL' ? '#8dc63f' : '#94a3b8',
                          background: row.category === 'CRITICAL' ? 'rgba(141,198,63,0.12)' : 'rgba(148,163,184,0.12)',
                        }}
                      >
                        {row.category}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{row.description}</p>
                  </td>
                  <td className="px-3 py-4 align-top">
                    <ul className="space-y-1">
                      {row.kpis.map((kpi, j) => (
                        <li key={j} className="flex items-start gap-2 text-slate-300">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#8dc63f' }} />
                          {kpi}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-4 align-top">
                    <div className="space-y-1">
                      {SCORES.map((score) => (
                        <div
                          key={score}
                          className="px-3 py-1 rounded text-xs font-semibold"
                          style={{ color: SCORE_COLORS[score].color, background: SCORE_COLORS[score].bg }}
                        >
                          {score}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Promotion Eligibility */}
      <SectionCard title="Promotion Eligibility">
        <div className="space-y-0">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#94a3b8' }}>Requirement</p>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {PROMO_REQUIREMENTS.map((req, i) => (
              <div
                key={i}
                className="py-3 flex items-center gap-2 text-sm"
                style={i === PROMO_REQUIREMENTS.length - 1 ? { background: 'rgba(141,198,63,0.07)', borderRadius: 8, padding: '10px 12px', marginTop: 4 } : {}}
              >
                <span style={{ color: i === PROMO_REQUIREMENTS.length - 1 ? '#fff' : '#cbd5e1', fontWeight: i === PROMO_REQUIREMENTS.length - 1 ? 700 : 400 }}>{req.label}</span>
                <span className="text-slate-500">=</span>
                <span className="font-black" style={{ color: req.valueColor }}>{req.value}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

    </div>
  );
}

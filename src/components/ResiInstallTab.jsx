import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { buildResiInstallAnalysis, fmt } from '../utils/dataHelpers'
import { resiInstallOptionA, resiInstallOptionB } from '../data/payPlanData'

function BeltBadge({ belt }) {
  const colors = {
    Gray: 'bg-gray-200 text-gray-700', Blue: 'bg-blue-100 text-blue-700',
    Green: 'bg-green-100 text-green-700', Brown: 'bg-amber-100 text-amber-700',
    Black: 'bg-gray-800 text-white',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[belt] || 'bg-slate-100 text-slate-600'}`}>{belt}</span>
}

export default function ResiInstallTab({ roster }) {
  const analysis = useMemo(() => buildResiInstallAnalysis(roster), [roster])

  const chartData = analysis.map(t => ({
    name: t.tech.name,
    'Actual 2025': Math.round(t.currentPay),
    'Proposed Base': Math.round(t.proposedBase),
    'Option B (+Bonus)': Math.round(t.optionBPay),
  }))

  return (
    <div className="space-y-6">
      {/* Plan Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Option A</span>
            <h3 className="font-semibold text-slate-700">Hourly + Revenue %</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Revenue commission on work done + 5% on jobs they sold. Requires revenue data to calculate fully.</p>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Level</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Work Done %</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Sold By %</th>
            </tr></thead>
            <tbody>
              {resiInstallOptionA.map(t => (
                <tr key={t.level} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-700">Level {t.level}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{t.workDone}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{(t.soldByPct * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Option B</span>
            <h3 className="font-semibold text-slate-700">Hourly + Monthly Goal Bonuses</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">$500/mo per goal hit. Max $1,500/month. Billable hours goal calculated from total hours data.</p>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Bonus</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Goal</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Amount</th>
            </tr></thead>
            <tbody>
              {resiInstallOptionB.map(b => (
                <tr key={b.bonus} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-700">{b.bonus}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{b.goalUnit === 'hours' ? `${b.goal} hrs` : fmt(b.goal)}</td>
                  <td className="px-3 py-2 text-right text-purple-600 font-semibold">{fmt(b.monthlyBonus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">2025 Actual vs Proposed (Base + Option B)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Bar dataKey="Actual 2025" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Proposed Base" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Option B (+Bonus)" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tech table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Tech-Level Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Tech</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Belt</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Lvl</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">New Hourly</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Total Hours</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">160hr Months</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Actual 2025</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Proposed Base</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-purple-600 uppercase">Opt B (+Bonus)</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Δ (Opt B)</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map(t => {
                const billableMonths = t.monthData.filter(m => m.hitsBillableGoal).length
                return (
                  <tr key={t.tech.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">{t.tech.name}</td>
                    <td className="px-3 py-2 text-center"><BeltBadge belt={t.tech.belt} /></td>
                    <td className="px-3 py-2 text-center text-slate-600">{t.tech.installLevel}</td>
                    <td className="px-3 py-2 text-right text-slate-600">${t.tech.newHourly.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{t.totHours.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{billableMonths}/12</td>
                    <td className="px-3 py-2 text-right text-slate-700 font-medium">{t.currentPay > 0 ? fmt(t.currentPay) : '—'}</td>
                    <td className="px-3 py-2 text-right text-blue-600 font-medium">{fmt(t.proposedBase)}</td>
                    <td className="px-3 py-2 text-right text-purple-600 font-medium">{fmt(t.optionBPay)}</td>
                    <td className={`px-3 py-2 text-right font-semibold text-xs ${t.deltaOptionB > 0 ? 'text-green-600' : t.deltaOptionB < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {t.currentPay > 0 ? `${t.deltaOptionB >= 0 ? '+' : ''}${fmt(t.deltaOptionB)}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td colSpan={6} className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Totals</td>
                <td className="px-3 py-2 text-right font-bold text-slate-700">{fmt(analysis.reduce((s,t)=>s+t.currentPay,0))}</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{fmt(analysis.reduce((s,t)=>s+t.proposedBase,0))}</td>
                <td className="px-3 py-2 text-right font-bold text-purple-600">{fmt(analysis.reduce((s,t)=>s+t.optionBPay,0))}</td>
                <td className={`px-3 py-2 text-right font-bold text-xs ${analysis.reduce((s,t)=>s+t.deltaOptionB,0)>=0?'text-green-600':'text-red-500'}`}>
                  {(()=>{const d=analysis.reduce((s,t)=>s+t.deltaOptionB,0);return `${d>=0?'+':''}${fmt(d)}`})()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

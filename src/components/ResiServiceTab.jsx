import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { buildResiServiceAnalysis, fmt } from '../utils/dataHelpers'
import { resiServiceCommissions, resiServiceLevelRequirements } from '../data/payPlanData'
import { MONTH_LABELS } from '../data/hoursData'

function BeltBadge({ belt }) {
  const colors = {
    Gray: 'bg-gray-200 text-gray-700', Blue: 'bg-blue-100 text-blue-700',
    Green: 'bg-green-100 text-green-700', Brown: 'bg-amber-100 text-amber-700',
    Black: 'bg-gray-800 text-white',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[belt] || 'bg-slate-100 text-slate-600'}`}>{belt}</span>
}

export default function ResiServiceTab({ roster }) {
  const analysis = useMemo(() => buildResiServiceAnalysis(roster), [roster])

  const chartData = analysis.map(t => ({
    name: t.tech.name,
    'Actual 2025': Math.round(t.currentPay),
    'Proposed Base': Math.round(t.proposedBase),
  }))

  return (
    <div className="space-y-6">
      {/* Plan Reference */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-1">Proposed Plan: Resi Service</h3>
        <p className="text-sm text-slate-500 mb-4">
          Hourly base + commission: (<em>% Work Done</em> × revenue) + (<em>% Sold By</em> × sold revenue). Level determined quarterly by avg ticket and close rate.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Level</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">% Work Done</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">% Sold By</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Total %</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Min Avg Ticket</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Min Close Rate</th>
              </tr>
            </thead>
            <tbody>
              {resiServiceCommissions.map(c => (
                <tr key={c.level} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-700">Level {c.level}</td>
                  <td className="px-4 py-2 text-right text-slate-600">{(c.workDonePct * 100).toFixed(0)}%</td>
                  <td className="px-4 py-2 text-right text-slate-600">{(c.soldByPct * 100).toFixed(0)}%</td>
                  <td className="px-4 py-2 text-right font-semibold text-blue-600">{(c.totalPct * 100).toFixed(0)}%</td>
                  <td className="px-4 py-2 text-right text-slate-500">{fmt(resiServiceLevelRequirements.minAvgTicket[c.level])}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{(resiServiceLevelRequirements.minCloseRate[c.level] * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">2025 Actual vs Proposed Base Pay</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Bar dataKey="Actual 2025" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Proposed Base" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
                <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Svc Level</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">New Hourly</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Total Hours</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Commission Rates</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Actual 2025 Pay</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Proposed Base</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Delta (Base)</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map(t => (
                <tr key={t.tech.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-700">{t.tech.name}</td>
                  <td className="px-3 py-2 text-center"><BeltBadge belt={t.tech.belt} /></td>
                  <td className="px-3 py-2 text-center text-slate-600">{t.tech.serviceLevel}</td>
                  <td className="px-3 py-2 text-right text-slate-600">${t.tech.newHourly.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{t.totHours > 0 ? t.totHours.toFixed(1) : '—'}</td>
                  <td className="px-3 py-2 text-right text-slate-500 text-xs">
                    {t.tier ? `${(t.tier.workDonePct*100).toFixed(0)}% done + ${(t.tier.soldByPct*100).toFixed(0)}% sold` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700 font-medium">{t.currentPay > 0 ? fmt(t.currentPay) : '—'}</td>
                  <td className="px-3 py-2 text-right text-blue-600 font-medium">{t.proposedBase > 0 ? fmt(t.proposedBase) : '—'}</td>
                  <td className={`px-3 py-2 text-right font-semibold text-xs ${t.deltaBase > 0 ? 'text-green-600' : t.deltaBase < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {t.currentPay > 0 ? `${t.deltaBase >= 0 ? '+' : ''}${fmt(t.deltaBase)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td colSpan={6} className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Totals</td>
                <td className="px-3 py-2 text-right font-bold text-slate-700">{fmt(analysis.reduce((s,t) => s+t.currentPay, 0))}</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{fmt(analysis.reduce((s,t) => s+t.proposedBase, 0))}</td>
                <td className={`px-3 py-2 text-right font-bold text-xs ${analysis.reduce((s,t)=>s+t.deltaBase,0)>=0?'text-green-600':'text-red-500'}`}>
                  {(()=>{ const d=analysis.reduce((s,t)=>s+t.deltaBase,0); return `${d>=0?'+':''}${fmt(d)}` })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

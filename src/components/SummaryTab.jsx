import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { buildSummary, fmt } from '../utils/dataHelpers'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

function StatCard({ label, value, sub, delta }) {
  const isPos = delta > 0
  const isNeg = delta < 0
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPos ? 'text-green-600' : isNeg ? 'text-red-500' : 'text-slate-400'}`}>
          {isPos ? <TrendingUp className="w-4 h-4" /> : isNeg ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          {isPos ? '+' : ''}{fmt(delta)} vs 2025 actual
        </div>
      )}
    </div>
  )
}

function DeltaBadge({ value }) {
  const isPos = value > 0
  const isNeg = value < 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
      ${isPos ? 'bg-green-100 text-green-700' : isNeg ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
      {isPos ? '+' : ''}{fmt(value)}
    </span>
  )
}

export default function SummaryTab({ roster }) {
  const summary = useMemo(() => buildSummary(roster), [roster])

  const chartData = [
    { name: '2025 Actual',          pay: Math.round(summary.totalCurrentPay) },
    { name: 'Proposed\n(Base Only)', pay: Math.round(summary.totalProposedBase) },
    { name: 'Proposed\n(+ Bonuses)', pay: Math.round(summary.totalProposedWithBonuses) },
  ]

  // All techs flat list sorted by base delta
  const allTechs = [
    ...summary.resiService.map(t => ({ ...t, group: 'Resi Service', proposed: t.proposedBase, delta: t.deltaBase, pct: t.deltaBasePercent })),
    ...summary.resiInstall.map(t => ({ ...t, group: 'Resi Install', proposed: t.optionBPay,   delta: t.deltaOptionB, pct: t.deltaOptionBPercent })),
    ...summary.commercial.map(t =>  ({ ...t, group: 'Commercial',   proposed: t.proposedTotal, delta: t.deltaTotal, pct: t.deltaTotalPercent })),
  ].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

  const totalTechs = allTechs.length
  const totalHours = allTechs.reduce((s, t) => s + t.totHours, 0)

  return (
    <div className="space-y-6">
      {/* Revenue data notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-0.5">ServiceTitan data connected</p>
          <p>Commercial bonuses now use actual revenue + combined sales &amp; tech lead sales per month. Resi Service commission requires work-done vs sold-by revenue split (not yet available from ServiceTitan).</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="2025 Actual Total Pay"
          value={fmt(summary.totalCurrentPay)}
          sub={`${totalTechs} techs · ${totalHours.toFixed(0)} total hours`}
        />
        <StatCard
          label="Proposed — Hourly Base Only"
          value={fmt(summary.totalProposedBase)}
          sub="No commissions or bonuses included"
          delta={summary.totalProposedBase - summary.totalCurrentPay}
        />
        <StatCard
          label="Proposed — Base + All Bonuses"
          value={fmt(summary.totalProposedWithBonuses)}
          sub="Includes all applicable monthly bonuses"
          delta={summary.totalProposedWithBonuses - summary.totalCurrentPay}
        />
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Total Compensation — Actual vs Proposed</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={70}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Bar dataKey="pay" name="Total Pay" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-group panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Resi Service', techs: summary.resiService, proposed: t => t.proposedBase, delta: t => t.deltaBase },
          { label: 'Resi Install', techs: summary.resiInstall, proposed: t => t.optionBPay,   delta: t => t.deltaOptionB },
          { label: 'Commercial',   techs: summary.commercial,  proposed: t => t.proposedTotal, delta: t => t.deltaTotal },
        ].map(({ label, techs, delta }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h4 className="font-semibold text-slate-700 mb-3 text-sm">{label}</h4>
            <div className="space-y-2">
              {techs.map(t => (
                <div key={t.tech.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 truncate max-w-[120px]">{t.tech.name}</span>
                  <DeltaBadge value={delta(t)} />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Group delta</span>
              <span className={`font-semibold ${techs.reduce((s, t) => s + delta(t), 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {(() => { const d = techs.reduce((s, t) => s + delta(t), 0); return `${d >= 0 ? '+' : ''}${fmt(d)}` })()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* All techs table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-4">All Techs — Pay Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Tech</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Group</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Total Hours</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">2025 Actual Pay</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Proposed (Base+Bonus)</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Delta</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Δ%</th>
              </tr>
            </thead>
            <tbody>
              {allTechs.map((t, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-700">{t.tech.name}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{t.group}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{t.totHours.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right text-slate-700 font-medium">{fmt(t.currentPay)}</td>
                  <td className="px-3 py-2 text-right text-blue-600 font-medium">{fmt(t.proposed)}</td>
                  <td className="px-3 py-2 text-right"><DeltaBadge value={t.delta} /></td>
                  <td className={`px-3 py-2 text-right text-xs font-medium ${t.pct > 0 ? 'text-green-600' : t.pct < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {t.pct > 0 ? '+' : ''}{(t.pct * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Totals</td>
                <td className="px-3 py-2 text-right font-bold text-slate-700">{fmt(summary.totalCurrentPay)}</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{fmt(summary.totalProposedWithBonuses)}</td>
                <td className="px-3 py-2 text-right">
                  <DeltaBadge value={summary.totalProposedWithBonuses - summary.totalCurrentPay} />
                </td>
                <td className={`px-3 py-2 text-right text-xs font-bold ${summary.totalProposedWithBonuses >= summary.totalCurrentPay ? 'text-green-600' : 'text-red-500'}`}>
                  {(() => {
                    const p = (summary.totalProposedWithBonuses - summary.totalCurrentPay) / summary.totalCurrentPay
                    return `${p >= 0 ? '+' : ''}${(p * 100).toFixed(1)}%`
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

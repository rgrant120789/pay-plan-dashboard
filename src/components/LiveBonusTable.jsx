import { calcInstallOrCommercialBonuses } from '../utils/calcBonuses';

const fmt = (n) => '$' + Math.round(n).toLocaleString();
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function HitDot({ hit }) {
  return (
    <span
      title={hit ? 'Goal met' : 'Goal missed'}
      style={{
        display: 'inline-block',
        width: 10, height: 10,
        borderRadius: '50%',
        background: hit ? '#8dc63f' : 'rgba(255,255,255,0.1)',
        border: hit ? '1px solid #6aaa1f' : '1px solid rgba(255,255,255,0.15)',
      }}
    />
  );
}

export default function LiveBonusTable({ techs, goals, salesField = 'sales', hourlyField = 'hourly2026', comparisonData, originalTechs }) {
  const compMap = Object.fromEntries((comparisonData || []).map((c) => [c.name, c]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[1000px]">
        <thead>
          <tr className="bg-[#8dc63f] text-[#0d2b4e]">
            <th className="px-3 py-2.5 text-left font-bold">Name</th>
            <th className="px-3 py-2.5 text-center font-bold" title="Months billable hours goal was met">Bill. Hits</th>
            <th className="px-3 py-2.5 text-center font-bold" title="Months revenue goal was met">Rev. Hits</th>
            <th className="px-3 py-2.5 text-center font-bold" title="Months sales goal was met">Sales Hits</th>
            <th className="px-3 py-2.5 text-right font-bold">Bonus Total</th>
            <th className="px-3 py-2.5 text-right font-bold">2026 Pay (calc)</th>
            <th className="px-3 py-2.5 text-right font-bold">2025 Actual</th>
            <th className="px-3 py-2.5 text-right font-bold">Diff</th>
          </tr>
        </thead>
        <tbody>
          {techs.map((t, i) => {
            const result = calcInstallOrCommercialBonuses(t.name, goals, salesField);
            const comp = compMap[t.name];
            const originalBonusHits = (comp?.billableBonus ?? 0) + (comp?.revenueBonus ?? 0) + (comp?.salesBonus ?? 0);
            const storedBasePay = (comp?.pay2026 ?? 0) - (originalBonusHits * 1000);
            const originalHourly = (originalTechs || techs).find((x) => x.name === t.name)?.[hourlyField] ?? t[hourlyField] ?? 0;
            const currentHourly = t[hourlyField] ?? 0;
            const basePay = originalHourly > 0 ? storedBasePay * (currentHourly / originalHourly) : storedBasePay;
            const totalPay = basePay + result.totalBonus;
            const pay2025 = comp?.pay2025 ?? 0;
            const diff = pay2025 > 0 ? totalPay - pay2025 : null;

            return (
              <tr key={t.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                <td className="px-3 py-2.5 font-semibold text-white">
                  {t.name}
                  {t.note === 'partial year' && <span className="ml-1 text-xs text-red-400 italic">*partial year</span>}
                  {t.note === 'will hit hourly rate' && <span className="ml-1 text-xs text-red-400 italic">*will hit hourly rate</span>}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <MonthDots detail={result.detail} hitKey="bHit" count={result.billableHits} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <MonthDots detail={result.detail} hitKey="rHit" count={result.revenueHits} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <MonthDots detail={result.detail} hitKey="sHit" count={result.salesHits} />
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-[#8dc63f]">
                  {result.totalBonus > 0 ? fmt(result.totalBonus) : '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-[#8dc63f]">
                  {pay2025 > 0 ? fmt(totalPay) : '—'}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300">
                  {pay2025 > 0 ? fmt(pay2025) : '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-slate-500">
                  {(t.note === 'partial year' || t.note === 'will hit hourly rate') ? '—' : diff !== null ? (
                    <span className={diff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {diff >= 0 ? '+' : ''}{fmt(diff)}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs mt-3 italic" style={{ color: '#475569' }}>
        * 2026 Pay (calc) = hourly base × hours worked + bonus hits × $1,000. Dots show each month (Jan→Dec) — green = goal met.
      </p>
    </div>
  );
}

function MonthDots({ detail, hitKey, count }) {
  const sorted = [...detail].sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5 justify-center whitespace-nowrap">
        {sorted.map((m) => (
          <HitDot key={m.month} hit={m[hitKey]} />
        ))}
      </div>
      <span className="text-xs font-bold" style={{ color: count > 0 ? '#8dc63f' : '#475569' }}>
        {count}/12 mo
      </span>
    </div>
  );
}

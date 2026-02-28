import React, { useState } from 'react';
import { residentialServiceData as d } from '../data/payData';
import BeltLevelsTable from './BeltLevelsTable';
import SectionCard from './SectionCard';
import BeltBadge from './BeltBadge';

const fmt = (n) => '$' + n.toLocaleString();

const COMM_RATES = { 1: { workDone: 0.06, soldBy: 0.05 }, 2: { workDone: 0.08, soldBy: 0.05 }, 3: { workDone: 0.10, soldBy: 0.05 }, 4: { workDone: 0.12, soldBy: 0.05 } };

const BELT_RANGES = {
  Gray:  { min: 18, max: 21 },
  Blue:  { min: 22, max: 25 },
  Green: { min: 26, max: 29 },
  Brown: { min: 30, max: 34 },
  Black: { min: 35, max: 60 },
};
const BELT_OPTIONS = ['Gray', 'Blue', 'Green', 'Brown', 'Black'];

const BELT_COLORS = { Gray: '#9ca3af', Blue: '#3b82f6', Green: '#84cc16', Brown: '#92400e', Black: '#e5e7eb' };
const selectCls = 'rounded px-1 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 focus:outline-none focus:border-[#8dc63f] cursor-pointer';
const inputCls = () => 'w-16 text-center rounded px-1 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none focus:border-[#8dc63f]';

function HourlyCell({ value, onChange, min = 15, max = 75 }) {
  const [local, setLocal] = React.useState(String(value));
  React.useEffect(() => { setLocal(String(value)); }, [value]);
  return (
    <input
      type="number" min={min} max={max} step={1}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        if (e.nativeEvent.inputType === 'insertReplacementText' || e.nativeEvent.inputType == null) {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(String(Math.min(max, Math.max(min, v))));
        }
      }}
      onBlur={() => {
        const v = Number(local);
        const clamped = isNaN(v) ? min : Math.min(max, Math.max(min, v));
        setLocal(String(clamped));
        onChange(String(clamped));
      }}
      className="w-16 text-center rounded px-1 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none focus:border-[#8dc63f]"
    />
  );
}

export default function ResidentialServiceTab() {
  const [roster, setRoster] = useState(d.technicians.map((t) => ({ ...t })));

  function updateTech(name, field, val) {
    setRoster((prev) => prev.map((t) => t.name === name ? { ...t, [field]: Number(val) } : t));
  }

  function resetRoster() {
    setRoster(d.technicians.map((t) => ({ ...t })));
  }

  const rosterMap = Object.fromEntries(roster.map((t) => [t.name, t]));

  const originalLevelMap = Object.fromEntries(d.technicians.map((t) => [t.name, t.level]));

  function calc2026Pay(comp) {
    const tech = rosterMap[comp.name];
    if (!tech) return comp.pay2026;
    const originalLevel = originalLevelMap[comp.name];
    if (tech.level === originalLevel) return comp.pay2026;
    const rate = COMM_RATES[tech.level] || COMM_RATES[1];
    const bonusAdder = comp.bonusTotal ?? 0;
    return comp.revenue * rate.workDone + comp.sales * rate.soldBy + bonusAdder;
  }

  const sorted = [
    ...d.comparison.filter((t) => !t.note),
    ...d.comparison.filter((t) => t.note),
  ];

  return (
    <div className="space-y-6">

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Belt Levels */}
        <SectionCard title="Belt Levels &amp; Base Pay">
          <BeltLevelsTable levels={d.beltLevels} />
        </SectionCard>

        {/* Commission Structure */}
        <SectionCard title="Commission Structure by Service Level">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                  <th className="px-4 py-2.5 text-left font-bold">Service Level</th>
                  <th className="px-4 py-2.5 text-center font-bold">% Work Done</th>
                  <th className="px-4 py-2.5 text-center font-bold">% Sold By</th>
                  <th className="px-4 py-2.5 text-center font-bold">Total %</th>
                </tr>
              </thead>
              <tbody>
                {d.commissions.map((row, i) => (
                  <tr key={row.level} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2.5 text-white font-bold">Level {row.level}</td>
                    <td className="px-4 py-2.5 text-center text-slate-300">{row.workDone}</td>
                    <td className="px-4 py-2.5 text-center text-slate-300">{row.soldBy}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-[#8dc63f]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Service Level Requirements */}
          <div className="flex items-center gap-3 mt-4 mb-2">
            <p className="text-xs font-bold tracking-widest text-[#8dc63f] uppercase">Level Requirements</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(141,198,63,0.18)', color: '#8dc63f', border: '1px solid rgba(141,198,63,0.4)', letterSpacing: '0.06em' }}>
              MEASURED QUARTERLY
            </span>
          </div>
          {/* Minimum KPI's */}
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e4d8c]/80 text-slate-200">
                  <th className="px-4 py-2 text-left font-semibold" colSpan={5}>
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#8dc63f' }}>Retain Level KPI's</span>
                  </th>
                </tr>
                <tr className="bg-[#1e4d8c]/50 text-slate-300">
                  <th className="px-4 py-2 text-left font-semibold">KPI</th>
                  <th className="px-4 py-2 text-center font-semibold">L1</th>
                  <th className="px-4 py-2 text-center font-semibold">L2</th>
                  <th className="px-4 py-2 text-center font-semibold">L3</th>
                  <th className="px-4 py-2 text-center font-semibold">L4</th>
                </tr>
              </thead>
              <tbody>
                {d.serviceLevelReqs.slice(0, 2).map((row, i) => (
                  <tr key={row.metric} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2 text-slate-300">{row.metric}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l1}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l2}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l3}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advanced KPI's */}
          <div className="overflow-hidden rounded-xl border border-white/10 mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(141,198,63,0.12)' }}>
                  <th className="px-4 py-2 text-left font-semibold" colSpan={5}>
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#8dc63f' }}>Level Up KPI's</span>
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(141,198,63,0.18)', color: '#8dc63f', border: '1px solid rgba(141,198,63,0.4)', letterSpacing: '0.06em' }}>MEASURED QUARTERLY</span>
                  </th>
                </tr>
                <tr className="bg-[#1e4d8c]/50 text-slate-300">
                  <th className="px-4 py-2 text-left font-semibold">KPI</th>
                  <th className="px-4 py-2 text-center font-semibold">L1</th>
                  <th className="px-4 py-2 text-center font-semibold">L2</th>
                  <th className="px-4 py-2 text-center font-semibold">L3</th>
                  <th className="px-4 py-2 text-center font-semibold">L4</th>
                </tr>
              </thead>
              <tbody>
                {d.serviceLevelReqs.slice(2).map((row, i) => (
                  <tr key={row.metric} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2 text-slate-300">{row.metric}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l1}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l2}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l3}</td>
                    <td className="px-4 py-2 text-center text-white">{row.l4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Technician roster */}
      <SectionCard title="Technician Roster — 2026 Pay Plan">
        <div className="flex justify-end mb-3">
          <button
            onClick={resetRoster}
            className="text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all"
style={{ background: 'rgba(141,198,63,0.12)', color: '#8dc63f', border: '1px solid rgba(141,198,63,0.5)' }}
            onMouseOver={(e) => { e.currentTarget.style.background='rgba(141,198,63,0.25)'; e.currentTarget.style.borderColor='#8dc63f'; }}
            onMouseOut={(e) => { e.currentTarget.style.background='rgba(141,198,63,0.12)'; e.currentTarget.style.borderColor='rgba(141,198,63,0.5)'; }}
          >
            ↺ Reset to Original
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                <th className="px-4 py-2.5 text-left font-bold">Name</th>
                <th className="px-4 py-2.5 text-center font-bold">Belt</th>
                <th className="px-4 py-2.5 text-center font-bold">Service Level</th>
                <th className="px-4 py-2.5 text-center font-bold">2026 Hourly</th>
                <th className="px-4 py-2.5 text-center font-bold">2025 Hourly</th>
                <th className="px-4 py-2.5 text-center font-bold">Change</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((t, i) => {
                const diff = t.hourly2026 - t.hourly2025;
                return (
                  <tr key={t.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2.5 font-semibold text-white">{t.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <select
                        value={t.belt}
                        onChange={(e) => {
                          const newBelt = e.target.value;
                          const range = BELT_RANGES[newBelt];
                          const clamped = Math.min(range.max, Math.max(range.min, t.hourly2026));
                          setRoster((prev) => prev.map((r) => r.name === t.name ? { ...r, belt: newBelt, hourly2026: clamped } : r));
                        }}
                        className={selectCls}
                        style={{ color: BELT_COLORS[t.belt] || '#8dc63f' }}
                      >
                        {BELT_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number" min={1} max={4} step={1}
                        value={t.level}
                        onChange={(e) => updateTech(t.name, 'level', e.target.value)}
                        className={inputCls()}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <HourlyCell
                        value={t.hourly2026}
                        onChange={(v) => updateTech(t.name, 'hourly2026', v)}
                        min={BELT_RANGES[t.belt]?.min ?? 15}
                        max={BELT_RANGES[t.belt]?.max ?? 60}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-300">${Number(t.hourly2025).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-center font-bold">
                      <span className={diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}>
                        {diff > 0 ? '+' : ''}{diff !== 0 ? `$${Math.abs(diff).toFixed(2)}` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Comparison table */}
      <SectionCard title="Full Pay Comparison Detail">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                <th className="px-4 py-2.5 text-left font-bold">Name</th>
                <th className="px-4 py-2.5 text-right font-bold">Revenue</th>
                <th className="px-4 py-2.5 text-right font-bold">Sales</th>
                <th className="px-4 py-2.5 text-right font-bold">2026 Pay (calc.)</th>
                <th className="px-4 py-2.5 text-right font-bold">2025 Pay</th>
                <th className="px-4 py-2.5 text-right font-bold">Difference</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => {
                const pay2026 = Math.round(calc2026Pay(t));
                const diff = pay2026 - t.pay2025;
                const isPartial = !!t.note;
                return (
                  <tr key={t.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2.5 font-semibold text-white">
                      {t.name}
                      {isPartial && <span className="ml-1 text-xs text-red-400 italic">*partial year</span>}
                      {t.name === 'Cannan B.' && <span className="ml-2 text-xs text-red-400 italic">*will hit hourly rate</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-300">{fmt(Math.round(t.revenue))}</td>
                    <td className="px-4 py-2.5 text-right text-slate-300">{fmt(Math.round(t.sales))}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-[#8dc63f]">{fmt(pay2026)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-300">{fmt(Math.round(t.pay2025))}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-500">
                      {isPartial ? '—' : (
                        <span className={diff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {diff >= 0 ? '+' : ''}{fmt(Math.round(diff))}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

    </div>
  );
}

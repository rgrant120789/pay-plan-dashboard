import React, { useState } from 'react';
import { residentialInstallData as d } from '../data/payData';
import BeltLevelsTable from './BeltLevelsTable';
import SectionCard from './SectionCard';
import BeltBadge from './BeltBadge';
import GoalEditor from './GoalEditor';
import LiveBonusTable from './LiveBonusTable';

const fmt = (n) => '$' + n.toLocaleString();

const GOAL_FIELDS = [
  { key: 'billableHours', label: 'Billable Hours Goal',  min: 50,    max: 250,     step: 5  },
  { key: 'revenue',       label: 'Revenue Goal',          min: 20000, max: 150000,  step: 5000 },
  { key: 'sales',         label: 'Sales Goal',            min: 2000,  max: 30000,   step: 1000 },
];

const DEFAULT_GOALS = { billableHours: 150, revenue: 80000, sales: 10000 };

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

function inputCls() {
  return 'w-16 text-center rounded px-1 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none focus:border-[#8dc63f]';
}

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

export default function ResidentialInstallTab() {
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [roster, setRoster] = useState(d.technicians.map((t) => ({ ...t })));

  function updateTech(name, field, val) {
    setRoster((prev) => prev.map((t) => t.name === name ? { ...t, [field]: Number(val) } : t));
  }

  function resetRoster() {
    setRoster(d.technicians.map((t) => ({ ...t })));
  }

  return (
    <div className="space-y-6">

      {/* Pay Formula */}
      <div className="rounded-xl border px-5 py-4" style={{ borderColor: 'rgba(141,198,63,0.3)', background: 'rgba(141,198,63,0.06)' }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>How Pay is Calculated</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
          <span><span className="text-white font-bold">Guaranteed Pay</span> = Hourly Rate × Regular Hours + (Hourly Rate × 1.5 × OT Hours)</span>
          <span className="text-slate-500">+</span>
          <span><span className="text-white font-bold">Bonus Opportunity</span> = Up to $1,000/mo for each of: Billable Hours, Revenue, and Sales goals</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">Hourly pay is guaranteed regardless of performance. Techs can earn up to $3,000/month ($36,000/year) in additional bonuses by hitting all 3 goals.</p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Belt Levels */}
        <SectionCard title="Belt Levels &amp; Base Pay">
          <BeltLevelsTable levels={d.beltLevels} />
        </SectionCard>

        {/* Monthly Bonus Goals */}
        <SectionCard title="Monthly Goal Bonuses">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                  <th className="px-4 py-2.5 text-left font-bold">KPI</th>
                  <th className="px-4 py-2.5 text-center font-bold">Monthly Goal</th>
                  <th className="px-4 py-2.5 text-center font-bold">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {d.bonuses.map((row, i) => (
                  <tr key={row.metric} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2.5 text-white font-semibold">{row.metric}</td>
                    <td className="px-4 py-2.5 text-center text-slate-300">{row.goal}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-[#8dc63f]">{row.bonus}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#1e4d8c]/60">
                  <td colSpan={2} className="px-4 py-2.5 text-right font-bold text-slate-200">Max Monthly Bonus</td>
                  <td className="px-4 py-2.5 text-center font-bold text-[#8dc63f] text-base">$3,000</td>
                </tr>
              </tfoot>
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
                        {diff !== 0 ? `${diff > 0 ? '+' : '-'}$${Math.abs(diff).toFixed(2)}` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Goal Editor */}
      <GoalEditor
        goals={goals}
        onChange={setGoals}
        fields={GOAL_FIELDS}
        title="Adjust 2026 Bonus Goals — Residential Install"
        defaultGoals={DEFAULT_GOALS}
      />

      {/* Live recalculated pay comparison */}
      <SectionCard title="Live Pay Recalculation — 2025 Actuals vs. 2026 Plan (Adjustable Goals)" accent>
        <LiveBonusTable
          techs={roster}
          goals={goals}
          salesField="sales"
          comparisonData={d.comparison}
          originalTechs={d.technicians}
        />
      </SectionCard>

    </div>
  );
}

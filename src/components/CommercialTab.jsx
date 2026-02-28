import React, { useState } from 'react';
import { commercialData as d } from '../data/payData';
import BeltLevelsTable from './BeltLevelsTable';
import SectionCard from './SectionCard';
import BeltBadge from './BeltBadge';
import GoalEditor from './GoalEditor';
import LiveBonusTable from './LiveBonusTable';

const fmt = (n) => '$' + Math.round(n).toLocaleString();

const GOAL_FIELDS_SERVICE = [
  { key: 'billableHours', label: 'Billable Hours Goal', min: 50,    max: 250,    step: 5    },
  { key: 'revenue',       label: 'Revenue Goal',         min: 20000, max: 150000, step: 5000 },
  { key: 'sales',         label: 'Sales + TGL Goal',     min: 5000,  max: 80000,  step: 2500 },
];
const GOAL_FIELDS_INSTALL = [
  { key: 'billableHours', label: 'Billable Hours Goal', min: 50,    max: 250,    step: 5    },
  { key: 'revenue',       label: 'Revenue Goal',         min: 20000, max: 150000, step: 5000 },
  { key: 'sales',         label: 'Sales + TGL Goal',     min: 5000,  max: 50000,  step: 2500 },
];
const GOAL_FIELDS_ENTRY = [
  { key: 'billableHours', label: 'Billable Hours Goal', min: 50,    max: 250,    step: 5    },
  { key: 'revenue',       label: 'Revenue Goal',         min: 20000, max: 150000, step: 5000 },
  { key: 'sales',         label: 'Sales + TGL Goal',     min: 5000,  max: 50000,  step: 2500 },
];

const DEFAULT_SERVICE = { billableHours: 150, revenue: 55000, sales: 35000 };
const DEFAULT_INSTALL = { billableHours: 150, revenue: 75000, sales: 20000 };
const DEFAULT_ENTRY   = { billableHours: 150, revenue: 65000, sales: 20000 };

function FocusBadge({ focus }) {
  return (
    <span className="text-sm text-slate-300">{focus}</span>
  );
}

function BonusBlock({ title, bonuses, accent }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div
        className="px-4 py-2 text-xs font-bold tracking-widest uppercase"
        style={{
          background: accent || '#1e4d8c',
          color: '#fff',
        }}
      >
        {title}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5">
            <th className="px-4 py-2 text-left text-slate-400 font-semibold">KPI</th>
            <th className="px-4 py-2 text-center text-slate-400 font-semibold">Goal</th>
            <th className="px-4 py-2 text-right text-slate-400 font-semibold">Bonus</th>
          </tr>
        </thead>
        <tbody>
          {bonuses.map((b, i) => (
            <tr key={b.metric} className={i % 2 === 0 ? 'bg-white/[0.03]' : ''}>
              <td className="px-4 py-2 text-white">{b.metric}</td>
              <td className="px-4 py-2 text-center text-slate-300">{b.goal}</td>
              <td className="px-4 py-2 text-right font-bold text-[#8dc63f]">{b.bonus}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/10">
            <td colSpan={2} className="px-4 py-2 text-right text-sm font-bold text-slate-300">Max Monthly</td>
            <td className="px-4 py-2 text-right font-bold text-[#8dc63f] text-base">$3,000</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const BELT_RANGES = {
  Gray:  { min: 20, max: 25 },
  Blue:  { min: 25, max: 29 },
  Green: { min: 30, max: 35 },
  Brown: { min: 36, max: 41 },
  Black: { min: 42, max: 75 },
};
const BELT_OPTIONS = ['Gray', 'Blue', 'Green', 'Brown', 'Black'];

const BELT_COLORS = { Gray: '#9ca3af', Blue: '#3b82f6', Green: '#84cc16', Brown: '#92400e', Black: '#e5e7eb' };
const selectCls = 'rounded px-1 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 focus:outline-none focus:border-[#8dc63f] cursor-pointer';

function inputCls() {
  return 'w-16 text-center rounded px-1 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none focus:border-[#8dc63f]';
}

function HourlyCell({ value, onChange, min = 20, max = 75 }) {
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

export default function CommercialTab() {
  const [serviceGoals, setServiceGoals] = useState(DEFAULT_SERVICE);
  const [installGoals, setInstallGoals] = useState(DEFAULT_INSTALL);
  const [entryGoals,   setEntryGoals]   = useState(DEFAULT_ENTRY);
  const [roster, setRoster] = useState(d.technicians.map((t) => ({ ...t })));

  function updateTech(name, field, val) {
    setRoster((prev) => prev.map((t) => t.name === name ? { ...t, [field]: Number(val) } : t));
  }

  function resetRoster() {
    setRoster(d.technicians.map((t) => ({ ...t })));
  }

  const serviceTechs = roster.filter((t) => t.focus === 'Service');
  const installTechs = roster.filter((t) => t.focus === 'Install');
  const entryTechs   = roster.filter((t) => t.focus === 'Entry');

  return (
    <div className="space-y-6">

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Belt Levels &amp; Base Pay">
          <BeltLevelsTable levels={d.beltLevels} />
        </SectionCard>

        <SectionCard title="Monthly Goal Bonuses by Focus (Up to $3,000/mo)">
          <div className="grid grid-cols-1 gap-4">
            <BonusBlock title="Service Focus" bonuses={d.bonuses.service} accent="#1e4d8c" />
            <BonusBlock title="Install Focus" bonuses={d.bonuses.install} accent="#1e4d8c" />
            <BonusBlock title="Entry Focus" bonuses={d.bonuses.entry} accent="#1e4d8c" />
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
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                <th className="px-4 py-2.5 text-left font-bold">Name</th>
                <th className="px-4 py-2.5 text-center font-bold">Belt</th>
                <th className="px-4 py-2.5 text-center font-bold">Focus</th>
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
                    <td className="px-4 py-2.5 font-semibold text-white">
                      {t.name}
                      {t.note === 'partial year' && <span className="ml-1 text-xs text-red-400 italic">*partial year</span>}
                    </td>
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
                    <td className="px-4 py-2.5 text-center"><FocusBadge focus={t.focus} /></td>
                    <td className="px-4 py-2.5 text-center">
                      <HourlyCell
                        value={t.hourly2026}
                        onChange={(v) => updateTech(t.name, 'hourly2026', v)}
                        min={BELT_RANGES[t.belt]?.min ?? 20}
                        max={BELT_RANGES[t.belt]?.max ?? 75}
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

      {/* SERVICE FOCUS */}
      <GoalEditor
        goals={serviceGoals}
        onChange={setServiceGoals}
        fields={GOAL_FIELDS_SERVICE}
        title="Service Focus — Adjust Bonus Goals"
        defaultGoals={DEFAULT_SERVICE}
      />
      <SectionCard title="Live Recalculation — Service Focus Techs">
        <LiveBonusTable
          techs={serviceTechs}
          goals={serviceGoals}
          salesField="totalSales"
          comparisonData={d.comparison}
          originalTechs={d.technicians}
        />
      </SectionCard>

      {/* INSTALL FOCUS */}
      <GoalEditor
        goals={installGoals}
        onChange={setInstallGoals}
        fields={GOAL_FIELDS_INSTALL}
        title="Install Focus — Adjust Bonus Goals"
        defaultGoals={DEFAULT_INSTALL}
      />
      <SectionCard title="Live Recalculation — Install Focus Techs">
        <LiveBonusTable
          techs={installTechs}
          goals={installGoals}
          salesField="totalSales"
          comparisonData={d.comparison}
          originalTechs={d.technicians}
        />
      </SectionCard>

      {/* ENTRY FOCUS */}
      <GoalEditor
        goals={entryGoals}
        onChange={setEntryGoals}
        fields={GOAL_FIELDS_ENTRY}
        title="Entry Focus — Adjust Bonus Goals"
        defaultGoals={DEFAULT_ENTRY}
      />
      <SectionCard title="Live Recalculation — Entry Focus Techs">
        <LiveBonusTable
          techs={entryTechs}
          goals={entryGoals}
          salesField="totalSales"
          comparisonData={d.comparison}
          originalTechs={d.technicians}
        />
      </SectionCard>

    </div>
  );
}

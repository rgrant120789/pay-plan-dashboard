import { Settings2 } from 'lucide-react';

const fmt = (n) => '$' + Number(n).toLocaleString();

export default function GoalEditor({ goals, onChange, fields, title = 'Adjust Bonus Goals', defaultGoals }) {
  function handleReset() {
    if (defaultGoals) onChange(defaultGoals);
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'rgba(141,198,63,0.35)', background: 'rgba(141,198,63,0.06)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'rgba(141,198,63,0.12)', borderBottom: '1px solid rgba(141,198,63,0.2)' }}
      >
        <Settings2 className="w-4 h-4" style={{ color: '#8dc63f' }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#8dc63f' }}>
          {title}
        </span>
        <span className="ml-2 text-xs" style={{ color: '#64748b' }}>
          — adjust goals below to see how bonus hits change
        </span>
        {defaultGoals && (
          <button
            onClick={handleReset}
            className="ml-auto text-xs px-3 py-1 rounded-lg font-bold tracking-wide transition-all"
            style={{ background: 'rgba(141,198,63,0.12)', color: '#8dc63f', border: '1px solid rgba(141,198,63,0.5)' }}
            onMouseOver={(e) => { e.currentTarget.style.background='rgba(141,198,63,0.25)'; e.currentTarget.style.borderColor='#8dc63f'; }}
            onMouseOut={(e) => { e.currentTarget.style.background='rgba(141,198,63,0.12)'; e.currentTarget.style.borderColor='rgba(141,198,63,0.5)'; }}
          >
            ↺ Reset to Original
          </button>
        )}
      </div>
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-bold tracking-wide mb-1" style={{ color: '#94a3b8' }}>
              {field.label}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: '#8dc63f' }}>
                {fmt(goals[field.key])}
              </span>
            </div>
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={goals[field.key]}
              onChange={(e) => onChange({ ...goals, [field.key]: Number(e.target.value) })}
              className="w-full mt-1"
              style={{ accentColor: '#8dc63f' }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: '#475569' }}>
              <span>{fmt(field.min)}</span>
              <span>{fmt(field.max)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'

function BeltSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
    >
      {['Gray','Blue','Green','Brown','Black'].map(b => (
        <option key={b} value={b}>{b}</option>
      ))}
    </select>
  )
}

function NumberInput({ value, onChange, prefix = '$', step = 0.5, min = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-slate-400 text-xs">{prefix}</span>}
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function BeltBadge({ belt }) {
  const colors = {
    Gray: 'bg-gray-200 text-gray-700',
    Blue: 'bg-blue-100 text-blue-700',
    Green: 'bg-green-100 text-green-700',
    Brown: 'bg-amber-100 text-amber-700',
    Black: 'bg-gray-800 text-white',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[belt] || 'bg-slate-100 text-slate-600'}`}>
      {belt}
    </span>
  )
}

export default function RosterTab({ roster, onUpdate }) {
  const [edited, setEdited] = useState(false)
  const [local, setLocal] = useState(roster)

  const update = (group, id, field, value) => {
    setLocal(prev => ({
      ...prev,
      [group]: prev[group].map(t => t.id === id ? { ...t, [field]: value } : t)
    }))
    setEdited(true)
  }

  const handleSave = () => {
    onUpdate(local)
    setEdited(false)
  }

  const handleReset = () => {
    setLocal(roster)
    setEdited(false)
  }

  const renderResiService = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <SectionHeader
        title="Resi Service Techs"
        subtitle="Hourly rate + Service Level (1–4) determines commission tier. Changes take effect on next analysis."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Belt</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Svc Level</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Current Hourly</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">New Hourly</th>
            </tr>
          </thead>
          <tbody>
            {local.resiService.map(t => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-700">{t.name}</td>
                <td className="px-3 py-2 text-center">
                  <BeltSelect value={t.belt} onChange={v => update('resiService', t.id, 'belt', v)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <select
                    value={t.serviceLevel}
                    onChange={e => update('resiService', t.id, 'serviceLevel', parseInt(e.target.value))}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {[1,2,3,4].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  <NumberInput value={t.currentHourly} onChange={v => update('resiService', t.id, 'currentHourly', v)} />
                </td>
                <td className="px-3 py-2 text-right">
                  <NumberInput value={t.newHourly} onChange={v => update('resiService', t.id, 'newHourly', v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderResiInstall = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <SectionHeader
        title="Resi Install Techs"
        subtitle="Install Level (1–4) determines Option A revenue %. Both Option A and B are calculated from the same data."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Belt</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Install Level</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Current Hourly</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">New Hourly</th>
            </tr>
          </thead>
          <tbody>
            {local.resiInstall.map(t => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-700">{t.name}</td>
                <td className="px-3 py-2 text-center">
                  <BeltSelect value={t.belt} onChange={v => update('resiInstall', t.id, 'belt', v)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <select
                    value={t.installLevel}
                    onChange={e => update('resiInstall', t.id, 'installLevel', parseInt(e.target.value))}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {[1,2,3,4].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  <NumberInput value={t.currentHourly} onChange={v => update('resiInstall', t.id, 'currentHourly', v)} />
                </td>
                <td className="px-3 py-2 text-right">
                  <NumberInput value={t.newHourly} onChange={v => update('resiInstall', t.id, 'newHourly', v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderCommercial = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <SectionHeader
        title="Commercial Techs"
        subtitle="Focus determines which monthly bonus goals apply (Service / Install / Entry)."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Belt</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Focus</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Current Hourly</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">New Hourly</th>
            </tr>
          </thead>
          <tbody>
            {local.commercial.map(t => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-700">{t.name}</td>
                <td className="px-3 py-2 text-center">
                  <BeltSelect value={t.belt} onChange={v => update('commercial', t.id, 'belt', v)} />
                </td>
                <td className="px-3 py-2 text-center">
                  <select
                    value={t.focus}
                    onChange={e => update('commercial', t.id, 'focus', e.target.value)}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {['Service','Install','Entry'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  <NumberInput value={t.currentHourly} onChange={v => update('commercial', t.id, 'currentHourly', v)} />
                </td>
                <td className="px-3 py-2 text-right">
                  <NumberInput value={t.newHourly} onChange={v => update('commercial', t.id, 'newHourly', v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Edit hourly rates, belt levels, and plan settings. Click <strong>Save Changes</strong> to apply to all analysis tabs.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={!edited}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors cursor-pointer
              ${edited ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-slate-200 text-slate-300 cursor-not-allowed'}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!edited}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer
              ${edited ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {edited && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2 rounded-lg">
          You have unsaved changes. Click <strong>Save Changes</strong> to update the analysis.
        </div>
      )}

      {renderResiService()}
      {renderResiInstall()}
      {renderCommercial()}
    </div>
  )
}

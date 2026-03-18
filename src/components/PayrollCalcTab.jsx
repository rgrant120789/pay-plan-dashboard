import { useState, useCallback, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Upload, ChevronDown, ChevronUp, Printer, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'

// ─── Pay Plan Config (matches your Google Sheet) ──────────────────────────────

const RESI_SERVICE_COMM_RATES = {
  1: { workDone: 0.06, soldBy: 0.05 },
  2: { workDone: 0.08, soldBy: 0.05 },
  3: { workDone: 0.10, soldBy: 0.05 },
  4: { workDone: 0.12, soldBy: 0.05 },
}

const SALES_REPS = [
  { name: 'Brandon Jestice',  pct: 0.025 },
  { name: 'Lee Roeder',       pct: 0.015 },
  { name: 'Kevin Hardy',      pct: 0.015 },
  { name: 'David Wilkerson',  pct: 0.015 },
  { name: 'Cliff Williams',   pct: 0.015 },
]

const RESI_SERVICE_ROSTER = [
  { name: 'Adam Engle',    level: 3 },
  { name: 'Kaleb Gosselin',level: 3 },
  { name: 'Tim White',     level: 3 },
  { name: 'Adam Duncan',   level: 3 },
  { name: 'Marisa Hill',   level: 3 },
  { name: 'Cannan Bonney', level: 3 },
  { name: 'JJ Leclerc',   level: 3 },
  { name: 'Josiah Brown',  level: 3 },
]

const RESI_INSTALL_ROSTER = ['Bubba Bryant', 'Greg Collins', 'Josh Smith', 'Josiah Brown', 'Mike Needham', 'Steve Gurganus']
const RESI_INSTALL_GOALS  = { billableHours: 160, revenue: 85000, sales: 10000 }

const COMMERCIAL_ROSTER = [
  { name: 'Brandon Gurganus', focus: 'Service' },
  { name: 'Chris Darlington', focus: 'Service' },
  { name: 'Grady Thomas',     focus: 'Service' },
  { name: 'Jack Dunham',      focus: 'Service' },
  { name: 'Alex Talbott',     focus: 'Install' },
  { name: 'Ethan Hatch',      focus: 'Install' },
  { name: 'Ronnie Sherman',   focus: 'Entry'   },
]
const COMMERCIAL_GOALS = {
  Service: { billableHours: 160, revenue: 65000, sales: 45000 },
  Install: { billableHours: 160, revenue: 85000, sales: 20000 },
  Entry:   { billableHours: 160, revenue: 65000, sales: 20000 },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt  = (n) => '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtN = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })
const pct  = (n) => (n * 100).toFixed(1) + '%'

function parseMoney(v) {
  if (v == null) return 0
  return parseFloat(String(v).replace(/[$,\s]/g, '')) || 0
}

function parseNum(v) {
  if (v == null) return 0
  return parseFloat(String(v).replace(/[,\s]/g, '')) || 0
}

// Flexible column finder — tries multiple common header names
function findCol(headers, candidates) {
  const norm = (s) => String(s).toLowerCase().replace(/[\s_\-]/g, '')
  const normedHeaders = headers.map(norm)
  for (const c of candidates) {
    const idx = normedHeaders.indexOf(norm(c))
    if (idx !== -1) return headers[idx]
  }
  return null
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function parseFileToTable(file, callback) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => callback(results.data, results.meta.fields, file.name),
    })
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const headers = data.length > 0 ? Object.keys(data[0]) : []
      callback(data, headers, file.name)
    }
    reader.readAsArrayBuffer(file)
  }
}

function UploadZone({ label, hint, onData, rowCount, fileName, accent = '#8dc63f' }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const processFile = useCallback((file) => {
    if (!file) return
    parseFileToTable(file, onData)
  }, [onData])

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]) }}
      className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all"
      style={{
        borderColor: dragging ? accent : rowCount > 0 ? 'rgba(141,198,63,0.6)' : 'rgba(255,255,255,0.15)',
        background: dragging ? 'rgba(141,198,63,0.08)' : rowCount > 0 ? 'rgba(141,198,63,0.05)' : 'rgba(255,255,255,0.02)',
      }}
    >
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
        onChange={(e) => processFile(e.target.files[0])} />
      {rowCount > 0 ? (
        <div className="flex flex-col items-center gap-1">
          <CheckCircle className="w-7 h-7" style={{ color: accent }} />
          <p className="font-bold text-sm" style={{ color: accent }}>{rowCount} rows loaded</p>
          <p className="text-xs text-slate-400">{fileName}</p>
          <p className="text-xs text-slate-500 mt-1">Click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <Upload className="w-7 h-7 text-slate-500" />
          <p className="font-semibold text-sm text-slate-300">{label}</p>
          <p className="text-xs text-slate-500">{hint}</p>
          <p className="text-xs text-slate-600 mt-1">.xlsx · .xls · .csv</p>
        </div>
      )}
    </div>
  )
}

// ─── Column Mapper UI ────────────────────────────────────────────────────────

function ColMapper({ headers, mapping, onChange, fields }) {
  if (!headers || headers.length === 0) return null
  return (
    <div className="rounded-xl border border-white/10 p-4 mt-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#8dc63f' }}>
        Column Mapping
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
            <select
              value={mapping[f.key] || ''}
              onChange={(e) => onChange({ ...mapping, [f.key]: e.target.value })}
              className="w-full rounded px-2 py-1 text-xs font-mono bg-[#0d2b4e] border border-[#8dc63f]/30 text-white focus:outline-none focus:border-[#8dc63f] cursor-pointer"
            >
              <option value="">— not mapped —</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 cursor-pointer"
        style={{ background: 'rgba(141,198,63,0.1)' }}
      >
        <span className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-wide uppercase" style={{ color: '#8dc63f', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}>{title}</span>
          {badge && <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e4d8c] text-slate-300">{badge}</span>}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}

// ─── Result Table ─────────────────────────────────────────────────────────────

function ResultRow({ name, detail, total, highlight }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr
        className="border-t border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => detail && setOpen(o => !o)}
      >
        <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
          {detail && <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>}
          {name}
        </td>
        {highlight}
        <td className="px-4 py-3 text-right font-bold text-lg" style={{ color: '#8dc63f' }}>{fmt(total)}</td>
      </tr>
      {open && detail && (
        <tr>
          <td colSpan={99} className="px-4 pb-3">
            <div className="rounded-lg overflow-hidden border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {detail}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── SALES COMMISSION CALCULATOR ─────────────────────────────────────────────

function autoMapSales(headers) {
  return {
    name:  findCol(headers, ['sold by', 'sold_by', 'salesperson', 'sold-by', 'tech_name', 'technician', 'name', 'employee']) || '',
    sales: findCol(headers, ['total', 'total_sales', 'total sales', 'sold_revenue', 'sold revenue', 'revenue', 'amount', 'sale_amount']) || '',
  }
}

function SalesSection({ roster, onRosterChange }) {
  const [rows, setRows]       = useState([])
  const [headers, setHeaders] = useState([])
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState({})

  const FIELDS = [
    { key: 'name',  label: 'Salesperson Name' },
    { key: 'sales', label: 'Total Sales $'    },
  ]

  function onData(data, hdrs, fname) {
    setHeaders(hdrs)
    setRows(data)
    setFileName(fname)
    setMapping(autoMapSales(hdrs))
  }

  // Aggregate by name
  const byName = {}
  rows.forEach(r => {
    const name  = String(r[mapping.name] || '').trim()
    const sales = parseMoney(r[mapping.sales])
    if (!name) return
    byName[name] = (byName[name] || 0) + sales
  })

  const results = roster.map(rep => {
    const totalSales = byName[rep.name] || 0
    const commission = totalSales * rep.pct
    return { ...rep, totalSales, commission }
  })

  const grandTotal = results.reduce((s, r) => s + r.commission, 0)

  return (
    <Section title="Sales Commission" badge="Weekly">
      {/* Roster level editor */}
      <div className="mb-4">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Salespeople &amp; Rates</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(141,198,63,0.12)' }}>
                <th className="px-3 py-2 text-left text-slate-300 font-semibold">Name</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Commission %</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((rep, i) => (
                <tr key={rep.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                  <td className="px-3 py-2 text-white">{rep.name}</td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number" min={0} max={20} step={0.5}
                      value={(rep.pct * 100).toFixed(1)}
                      onChange={e => {
                        const v = parseFloat(e.target.value)
                        if (!isNaN(v)) onRosterChange(rep.name, v / 100)
                      }}
                      className="w-20 text-center rounded px-2 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none"
                    />
                    <span className="ml-1 text-slate-400 text-xs">%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload */}
      <UploadZone
        label="Drop Sales Report CSV"
        hint="Needs: salesperson name + total sales columns"
        onData={onData}
        rowCount={rows.length}
        fileName={fileName}
      />
      <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={FIELDS} />

      {/* Results */}
      {rows.length > 0 && mapping.name && mapping.sales && (
        <div className="mt-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Commission Owed</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                  <th className="px-4 py-2.5 text-left font-bold">Name</th>
                  <th className="px-4 py-2.5 text-right font-bold">Total Sales</th>
                  <th className="px-4 py-2.5 text-right font-bold">Rate</th>
                  <th className="px-4 py-2.5 text-right font-bold">Commission Owed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2.5 font-semibold text-white">{r.name}</td>
                    <td className="px-4 py-2.5 text-right text-slate-300">{fmt(r.totalSales)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-300">{pct(r.pct)}</td>
                    <td className="px-4 py-2.5 text-right font-bold" style={{ color: '#8dc63f' }}>{fmt(r.commission)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(13,43,78,0.8)', borderTop: '1px solid rgba(141,198,63,0.3)' }}>
                  <td colSpan={3} className="px-4 py-2.5 text-right font-bold text-slate-200">TOTAL SALES COMMISSIONS</td>
                  <td className="px-4 py-2.5 text-right font-bold text-lg" style={{ color: '#8dc63f' }}>{fmt(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {Object.keys(byName).some(n => !roster.find(r => r.name === n)) && (
            <div className="mt-2 flex items-start gap-2 text-xs text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Some names in the report don't match the roster: {Object.keys(byName).filter(n => !roster.find(r => r.name === n)).join(', ')}. Check spelling or add them to the roster.</span>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

// ─── RESIDENTIAL SERVICE COMMISSION CALCULATOR ───────────────────────────────

function autoMapResiService(headers) {
  return {
    name:    findCol(headers, ['name', 'tech_name', 'technician', 'employee', 'tech']) || '',
    revenue: findCol(headers, ['completed revenue', 'completed_revenue', 'revenue', 'job_revenue', 'total_revenue']) || '',
    sales:   findCol(headers, ['total sales', 'total_sales', 'sold_revenue', 'sold revenue', 'sold_by_revenue']) || '',
    period:  findCol(headers, ['week', 'period', 'pay_period', 'week_ending', 'date', 'job_date']) || '',
  }
}

function ResiServiceSection({ roster, onRosterChange }) {
  const [rows, setRows]       = useState([])
  const [headers, setHeaders] = useState([])
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState({})
  const [periodMode, setPeriodMode] = useState('all') // 'all' | 'weekly'

  const FIELDS = [
    { key: 'name',    label: 'Tech Name'           },
    { key: 'revenue', label: 'Completed Revenue $'  },
    { key: 'sales',   label: 'Total Sales $'        },
    { key: 'period',  label: 'Week / Period (opt.)'  },
  ]

  function onData(data, hdrs, fname) {
    setHeaders(hdrs)
    setRows(data)
    setFileName(fname)
    setMapping(autoMapResiService(hdrs))
  }

  // Aggregate by name (and optionally by period)
  const byNamePeriod = {}
  rows.forEach(r => {
    const name    = String(r[mapping.name] || '').trim()
    const revenue = parseMoney(r[mapping.revenue])
    const sales   = parseMoney(r[mapping.sales])
    const period  = mapping.period ? String(r[mapping.period] || 'All').trim() : 'All'
    if (!name) return
    const key = periodMode === 'weekly' ? `${name}||${period}` : name
    if (!byNamePeriod[key]) byNamePeriod[key] = { name, period, revenue: 0, sales: 0 }
    byNamePeriod[key].revenue += revenue
    byNamePeriod[key].sales   += sales
  })

  const rosterMap = Object.fromEntries(roster.map(t => [t.name, t]))
  const entries = Object.values(byNamePeriod)

  const results = entries.map(e => {
    const tech = rosterMap[e.name]
    if (!tech) return { ...e, level: '?', commission: 0, matched: false }
    const rate = RESI_SERVICE_COMM_RATES[tech.level] || RESI_SERVICE_COMM_RATES[3]
    const commission = e.revenue * rate.workDone + e.sales * rate.soldBy
    return { ...e, level: tech.level, workDonePct: rate.workDone, soldByPct: rate.soldBy, commission, matched: true }
  })

  const grandTotal = results.reduce((s, r) => s + r.commission, 0)

  return (
    <Section title="Residential Service Commission" badge="Weekly">
      <div className="rounded-xl border px-4 py-3 mb-4 text-xs text-slate-300" style={{ borderColor: 'rgba(141,198,63,0.25)', background: 'rgba(141,198,63,0.05)' }}>
        <span className="font-bold text-white">Formula:</span> Commission = (Completed Revenue × Work Done %) + (Total Sales × Sold By %) &nbsp;·&nbsp; Techs get whichever is higher: commission or hourly pay (enter hourly separately on paycheck)
      </div>

      {/* Level editor */}
      <div className="mb-4">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Tech Service Levels</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(141,198,63,0.12)' }}>
                <th className="px-3 py-2 text-left text-slate-300 font-semibold">Name</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Level (1–4)</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Work Done %</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Sold By %</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Total %</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((t, i) => {
                const rate = RESI_SERVICE_COMM_RATES[t.level] || RESI_SERVICE_COMM_RATES[1]
                return (
                  <tr key={t.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-3 py-2 text-white">{t.name}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number" min={1} max={4} step={1}
                        value={t.level}
                        onChange={e => onRosterChange(t.name, 'level', parseInt(e.target.value))}
                        className="w-16 text-center rounded px-2 py-0.5 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-center text-slate-300">{pct(rate.workDone)}</td>
                    <td className="px-3 py-2 text-center text-slate-300">{pct(rate.soldBy)}</td>
                    <td className="px-3 py-2 text-center font-bold" style={{ color: '#8dc63f' }}>{pct(rate.workDone + rate.soldBy)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-slate-400">Calculation mode:</span>
        {['all', 'weekly'].map(m => (
          <button key={m} onClick={() => setPeriodMode(m)}
            className="text-xs px-3 py-1 rounded-lg font-bold cursor-pointer transition-all"
            style={{
              background: periodMode === m ? 'rgba(141,198,63,0.2)' : 'rgba(255,255,255,0.05)',
              color: periodMode === m ? '#8dc63f' : '#94a3b8',
              border: `1px solid ${periodMode === m ? 'rgba(141,198,63,0.5)' : 'transparent'}`,
            }}>
            {m === 'all' ? 'Aggregate (all rows)' : 'By Period/Week'}
          </button>
        ))}
      </div>

      <UploadZone
        label="Drop Resi Service Report CSV"
        hint="Needs: tech name, completed revenue, total sales"
        onData={onData}
        rowCount={rows.length}
        fileName={fileName}
      />
      <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={FIELDS} />

      {rows.length > 0 && mapping.name && mapping.revenue && (
        <div className="mt-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Commission Owed</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                  <th className="px-4 py-2.5 text-left font-bold">Name</th>
                  {periodMode === 'weekly' && <th className="px-4 py-2.5 text-left font-bold">Period</th>}
                  <th className="px-4 py-2.5 text-right font-bold">Lvl</th>
                  <th className="px-4 py-2.5 text-right font-bold">Completed Rev</th>
                  <th className="px-4 py-2.5 text-right font-bold">Total Sales</th>
                  <th className="px-4 py-2.5 text-right font-bold">Commission Owed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'} ${!r.matched ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-2.5 font-semibold text-white">
                      {r.name}
                      {!r.matched && <span className="ml-1 text-xs text-amber-400">*unmatched</span>}
                    </td>
                    {periodMode === 'weekly' && <td className="px-4 py-2.5 text-slate-400 text-xs">{r.period}</td>}
                    <td className="px-4 py-2.5 text-right text-slate-300">{r.level}</td>
                    <td className="px-4 py-2.5 text-right text-slate-300">{fmt(r.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-300">{fmt(r.sales)}</td>
                    <td className="px-4 py-2.5 text-right font-bold" style={{ color: r.matched ? '#8dc63f' : '#94a3b8' }}>{fmt(r.commission)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(13,43,78,0.8)', borderTop: '1px solid rgba(141,198,63,0.3)' }}>
                  <td colSpan={periodMode === 'weekly' ? 5 : 4} className="px-4 py-2.5 text-right font-bold text-slate-200">TOTAL RESI SERVICE COMMISSIONS</td>
                  <td className="px-4 py-2.5 text-right font-bold text-lg" style={{ color: '#8dc63f' }}>{fmt(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </Section>
  )
}

// ─── RESIDENTIAL INSTALL BONUS CALCULATOR ────────────────────────────────────

function autoMapInstall(headers) {
  return {
    name:          findCol(headers, ['name', 'tech_name', 'technician', 'employee', 'tech']) || '',
    billableHours: findCol(headers, ['job billable hours', 'billable_hours', 'billable hours', 'billed_hours', 'hours_billed', 'billable']) || '',
    revenue:       findCol(headers, ['completed revenue', 'completed_revenue', 'revenue', 'job_revenue', 'total_revenue']) || '',
    sales:         findCol(headers, ['total sales', 'total_sales', 'sales', 'sold_revenue', 'sold revenue']) || '',
  }
}

function GoalChip({ hit, goal, actual, unit = '$' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${hit ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 bg-white/5'}`}>
      {hit ? '✓' : '✗'} {unit === '$' ? fmt(actual) : fmtN(actual)} / {unit === '$' ? fmt(goal) : fmtN(goal)} {unit !== '$' ? 'hrs' : ''}
    </span>
  )
}

function ResiInstallSection({ goals, onGoalsChange }) {
  const [rows, setRows]       = useState([])
  const [headers, setHeaders] = useState([])
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState({})

  const FIELDS = [
    { key: 'name',          label: 'Tech Name'      },
    { key: 'billableHours', label: 'Billable Hours' },
    { key: 'revenue',       label: 'Revenue $'      },
    { key: 'sales',         label: 'Sales $'        },
  ]

  function onData(data, hdrs, fname) {
    setHeaders(hdrs)
    setRows(data)
    setFileName(fname)
    setMapping(autoMapInstall(hdrs))
  }

  // Aggregate by name across all rows
  const byName = {}
  rows.forEach(r => {
    const name    = String(r[mapping.name] || '').trim()
    const bh      = parseNum(r[mapping.billableHours])
    const revenue = parseMoney(r[mapping.revenue])
    const sales   = parseMoney(r[mapping.sales])
    if (!name) return
    if (!byName[name]) byName[name] = { name, billableHours: 0, revenue: 0, sales: 0 }
    byName[name].billableHours += bh
    byName[name].revenue       += revenue
    byName[name].sales         += sales
  })

  const results = RESI_INSTALL_ROSTER.map(name => {
    const d      = byName[name] || { billableHours: 0, revenue: 0, sales: 0 }
    const bhHit  = d.billableHours >= goals.billableHours
    const revHit = d.revenue >= goals.revenue
    const salHit = d.sales >= goals.sales
    const bonus  = (bhHit ? 1000 : 0) + (revHit ? 1000 : 0) + (salHit ? 1000 : 0)
    return { name, ...d, bhHit, revHit, salHit, bonus }
  })
  const grandTotal = results.reduce((s, r) => s + r.bonus, 0)

  return (
    <Section title="Residential Install Bonuses" badge="Monthly">
      <div className="rounded-xl border px-4 py-3 mb-4 text-xs text-slate-300" style={{ borderColor: 'rgba(141,198,63,0.25)', background: 'rgba(141,198,63,0.05)' }}>
        <span className="font-bold text-white">Formula:</span> Each month: <span style={{ color: '#8dc63f' }}>$1,000</span> if ≥ {fmtN(goals.billableHours)} billable hours &nbsp;+&nbsp; <span style={{ color: '#8dc63f' }}>$1,000</span> if ≥ {fmt(goals.revenue)} revenue &nbsp;+&nbsp; <span style={{ color: '#8dc63f' }}>$1,000</span> if ≥ {fmt(goals.sales)} sales &nbsp;·&nbsp; Max <span style={{ color: '#8dc63f' }}>$3,000/mo</span>
      </div>

      {/* Goal editor */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { key: 'billableHours', label: 'Billable Hours Goal', unit: 'hrs', step: 5  },
          { key: 'revenue',       label: 'Revenue Goal ($)',     unit: '$',  step: 5000 },
          { key: 'sales',         label: 'Sales Goal ($)',       unit: '$',  step: 1000 },
        ].map(f => (
          <div key={f.key} className="rounded-lg p-3 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
            <input
              type="number" step={f.step} min={0}
              value={goals[f.key]}
              onChange={e => onGoalsChange({ ...goals, [f.key]: parseFloat(e.target.value) || 0 })}
              className="w-full rounded px-2 py-1 text-sm font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none"
            />
          </div>
        ))}
      </div>

      <UploadZone
        label="Drop Resi Install Report CSV"
        hint="Needs: tech name, billable hours, revenue, sales — run one month at a time"
        onData={onData}
        rowCount={rows.length}
        fileName={fileName}
      />
      <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={FIELDS} />

      {rows.length > 0 && mapping.name && (
        <div className="mt-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Bonuses Owed</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                  <th className="px-4 py-2.5 text-left font-bold">Name</th>
                  <th className="px-4 py-2.5 text-center font-bold">Billable Hrs</th>
                  <th className="px-4 py-2.5 text-center font-bold">Revenue</th>
                  <th className="px-4 py-2.5 text-center font-bold">Sales</th>
                  <th className="px-4 py-2.5 text-right font-bold">Bonus Owed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2.5 font-semibold text-white">{r.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <GoalChip hit={r.bhHit} goal={goals.billableHours} actual={r.billableHours} unit="hrs" />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <GoalChip hit={r.revHit} goal={goals.revenue} actual={r.revenue} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <GoalChip hit={r.salHit} goal={goals.sales} actual={r.sales} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold" style={{ color: r.bonus > 0 ? '#8dc63f' : '#475569' }}>{fmt(r.bonus)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(13,43,78,0.8)', borderTop: '1px solid rgba(141,198,63,0.3)' }}>
                  <td colSpan={4} className="px-4 py-2.5 text-right font-bold text-slate-200">TOTAL RESI INSTALL BONUSES</td>
                  <td className="px-4 py-2.5 text-right font-bold text-lg" style={{ color: '#8dc63f' }}>{fmt(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      )}
    </Section>
  )
}

// ─── COMMERCIAL BONUS CALCULATOR ─────────────────────────────────────────────

function autoMapCommercial(headers) {
  return {
    name:          findCol(headers, ['tech_name', 'technician', 'name', 'employee', 'tech']) || '',
    billableHours: findCol(headers, ['billable_hours', 'billable hours', 'billed_hours', 'hours_billed', 'billable']) || '',
    revenue:       findCol(headers, ['revenue', 'completed_revenue', 'job_revenue', 'total_revenue']) || '',
    sales:         findCol(headers, ['total_sales', 'sales', 'sold_revenue', 'sold revenue']) || '',
    tgl:           findCol(headers, ['tgl', 'tgl_sales', 'tech_generated_lead', 'tech generated lead', 'tgl sales']) || '',
  }
}

function CommercialSection({ roster, onRosterChange, goals, onGoalsChange }) {
  const [rows, setRows]       = useState([])
  const [headers, setHeaders] = useState([])
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState({})

  const FIELDS = [
    { key: 'name',          label: 'Tech Name'      },
    { key: 'billableHours', label: 'Billable Hours' },
    { key: 'revenue',       label: 'Revenue $'      },
    { key: 'sales',         label: 'Sales $'        },
    { key: 'tgl',           label: 'TGL Sales $'    },
  ]

  function onData(data, hdrs, fname) {
    setHeaders(hdrs)
    setRows(data)
    setFileName(fname)
    setMapping(autoMapCommercial(hdrs))
  }

  const rosterMap = Object.fromEntries(roster.map(t => [t.name, t]))

  // Aggregate by name across all rows
  const byName = {}
  rows.forEach(r => {
    const name    = String(r[mapping.name] || '').trim()
    const bh      = parseNum(r[mapping.billableHours])
    const revenue = parseMoney(r[mapping.revenue])
    const sales   = parseMoney(r[mapping.sales])
    const tgl     = mapping.tgl ? parseMoney(r[mapping.tgl]) : 0
    if (!name) return
    if (!byName[name]) byName[name] = { billableHours: 0, revenue: 0, sales: 0, tgl: 0 }
    byName[name].billableHours += bh
    byName[name].revenue       += revenue
    byName[name].sales         += sales
    byName[name].tgl           += tgl
  })

  const results = roster.map(t => {
    const d          = byName[t.name] || { billableHours: 0, revenue: 0, sales: 0, tgl: 0 }
    const g          = goals[t.focus] || goals.Service
    const totalSales = d.sales + d.tgl
    const bhHit      = d.billableHours >= g.billableHours
    const revHit     = d.revenue >= g.revenue
    const salHit     = totalSales >= g.sales
    const bonus      = (bhHit ? 1000 : 0) + (revHit ? 1000 : 0) + (salHit ? 1000 : 0)
    return { name: t.name, focus: t.focus, ...d, totalSales, bhHit, revHit, salHit, bonus, g }
  })
  const grandTotal = results.reduce((s, r) => s + r.bonus, 0)

  const FOCUS_OPTIONS = ['Service', 'Install', 'Entry']

  return (
    <Section title="Commercial Bonuses" badge="Monthly">
      <div className="rounded-xl border px-4 py-3 mb-4 text-xs text-slate-300" style={{ borderColor: 'rgba(141,198,63,0.25)', background: 'rgba(141,198,63,0.05)' }}>
        <span className="font-bold text-white">Formula:</span> Each month: <span style={{ color: '#8dc63f' }}>$1,000</span> billable hours + <span style={{ color: '#8dc63f' }}>$1,000</span> revenue + <span style={{ color: '#8dc63f' }}>$1,000</span> (Sales + TGL Sales) &nbsp;·&nbsp; Goals differ by focus (Service / Install / Entry) &nbsp;·&nbsp; Max <span style={{ color: '#8dc63f' }}>$3,000/mo</span>
      </div>

      {/* Roster + focus */}
      <div className="mb-4">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Commercial Technicians &amp; Focus</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(141,198,63,0.12)' }}>
                <th className="px-3 py-2 text-left text-slate-300 font-semibold">Name</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Focus</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Billable Hrs Goal</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Revenue Goal</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Sales+TGL Goal</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((t, i) => {
                const g = goals[t.focus] || goals.Service
                return (
                  <tr key={t.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-3 py-2 text-white">{t.name}</td>
                    <td className="px-3 py-2 text-center">
                      <select
                        value={t.focus}
                        onChange={e => onRosterChange(t.name, 'focus', e.target.value)}
                        className="rounded px-2 py-0.5 text-xs font-bold bg-[#0d2b4e] border border-[#8dc63f]/40 text-[#8dc63f] focus:outline-none cursor-pointer"
                      >
                        {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center text-slate-300 text-xs">{fmtN(g.billableHours)} hrs</td>
                    <td className="px-3 py-2 text-center text-slate-300 text-xs">{fmt(g.revenue)}</td>
                    <td className="px-3 py-2 text-center text-slate-300 text-xs">{fmt(g.sales)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goal editors per focus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {FOCUS_OPTIONS.map(focus => (
          <div key={focus} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>{focus} Goals</p>
            {[
              { key: 'billableHours', label: 'Billable Hrs', step: 5 },
              { key: 'revenue',       label: 'Revenue $',    step: 5000 },
              { key: 'sales',         label: 'Sales+TGL $',  step: 2500 },
            ].map(f => (
              <div key={f.key} className="mb-2">
                <label className="block text-xs text-slate-400 mb-0.5">{f.label}</label>
                <input
                  type="number" step={f.step} min={0}
                  value={goals[focus][f.key]}
                  onChange={e => onGoalsChange({
                    ...goals,
                    [focus]: { ...goals[focus], [f.key]: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full rounded px-2 py-1 text-xs font-bold bg-[#0d2b4e] border border-[#8dc63f]/30 text-[#8dc63f] focus:outline-none"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <UploadZone
        label="Drop Commercial Report CSV"
        hint="Needs: tech name, billable hours, revenue, sales, TGL sales — run one month at a time"
        onData={onData}
        rowCount={rows.length}
        fileName={fileName}
      />
      <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={FIELDS} />

      {rows.length > 0 && mapping.name && (
        <div className="mt-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Bonuses Owed</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                  <th className="px-4 py-2.5 text-left font-bold">Name</th>
                  <th className="px-4 py-2.5 text-center font-bold">Focus</th>
                  <th className="px-4 py-2.5 text-center font-bold">Billable Hrs</th>
                  <th className="px-4 py-2.5 text-center font-bold">Revenue</th>
                  <th className="px-4 py-2.5 text-center font-bold">Sales + TGL</th>
                  <th className="px-4 py-2.5 text-right font-bold">Bonus Owed</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-4 py-2.5 font-semibold text-white">{r.name}</td>
                    <td className="px-4 py-2.5 text-center text-slate-300 text-xs">{r.focus}</td>
                    <td className="px-4 py-2.5 text-center">
                      <GoalChip hit={r.bhHit} goal={r.g.billableHours} actual={r.billableHours} unit="hrs" />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <GoalChip hit={r.revHit} goal={r.g.revenue} actual={r.revenue} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <GoalChip hit={r.salHit} goal={r.g.sales} actual={r.totalSales} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold" style={{ color: r.bonus > 0 ? '#8dc63f' : '#475569' }}>{fmt(r.bonus)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(13,43,78,0.8)', borderTop: '1px solid rgba(141,198,63,0.3)' }}>
                  <td colSpan={6} className="px-4 py-2.5 text-right font-bold text-slate-200">TOTAL COMMERCIAL BONUSES</td>
                  <td className="px-4 py-2.5 text-right font-bold text-lg" style={{ color: '#8dc63f' }}>{fmt(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      )}
    </Section>
  )
}

// ─── MAIN TAB ────────────────────────────────────────────────────────────────

export default function PayrollCalcTab() {
  // Editable rosters / rates
  const [salesRoster,    setSalesRoster]    = useState(SALES_REPS.map(r => ({ ...r })))
  const [resiSvcRoster,  setResiSvcRoster]  = useState(RESI_SERVICE_ROSTER.map(r => ({ ...r })))
  const [commercialRoster, setCommercialRoster] = useState(COMMERCIAL_ROSTER.map(r => ({ ...r })))

  // Editable goals
  const [resiInstallGoals,  setResiInstallGoals]  = useState({ ...RESI_INSTALL_GOALS })
  const [commercialGoals,   setCommercialGoals]   = useState({
    Service: { ...COMMERCIAL_GOALS.Service },
    Install: { ...COMMERCIAL_GOALS.Install },
    Entry:   { ...COMMERCIAL_GOALS.Entry   },
  })

  function resetAll() {
    setSalesRoster(SALES_REPS.map(r => ({ ...r })))
    setResiSvcRoster(RESI_SERVICE_ROSTER.map(r => ({ ...r })))
    setCommercialRoster(COMMERCIAL_ROSTER.map(r => ({ ...r })))
    setResiInstallGoals({ ...RESI_INSTALL_GOALS })
    setCommercialGoals({
      Service: { ...COMMERCIAL_GOALS.Service },
      Install: { ...COMMERCIAL_GOALS.Install },
      Entry:   { ...COMMERCIAL_GOALS.Entry   },
    })
  }

  return (
    <div className="space-y-6">

      {/* Header card */}
      <div className="rounded-xl border px-5 py-4 flex items-start gap-4" style={{ borderColor: 'rgba(141,198,63,0.3)', background: 'rgba(141,198,63,0.06)' }}>
        <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#8dc63f' }} />
        <div>
          <p className="text-sm font-bold text-white mb-1">Payroll Commission Calculator</p>
          <p className="text-xs text-slate-300">Upload your Service Titan CSV exports below for each pay type. The calculator will automatically detect columns and compute exactly what each person is owed. You can adjust levels, rates, and goals at any time — changes recalculate instantly.</p>
          <p className="text-xs text-slate-400 mt-1">Tip: The column mapper lets you manually match any ST export format. No need to rename your columns.</p>
        </div>
        <button onClick={resetAll} className="ml-auto shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all"
          style={{ background: 'rgba(141,198,63,0.12)', color: '#8dc63f', border: '1px solid rgba(141,198,63,0.4)' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(141,198,63,0.25)'}
          onMouseOut={e => e.currentTarget.style.background='rgba(141,198,63,0.12)'}
        >
          <RefreshCw className="w-3 h-3" /> Reset All
        </button>
      </div>

      {/* CSV Format hint */}
      <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-2 text-slate-400">Expected CSV Columns (flexible — use the mapper to match your actual headers)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { label: 'Sales Report',          cols: 'Salesperson name, Total sales $' },
            { label: 'Resi Service Report',   cols: 'Tech name, Completed revenue $, Total sales $' },
            { label: 'Resi Install Report',          cols: 'Tech name, Billable hours, Revenue $, Sales $' },
            { label: 'Commercial Report',     cols: 'Tech name, Billable hours, Revenue $, Sales $, TGL Sales $' },
          ].map(r => (
            <div key={r.label} className="rounded-lg p-2.5 border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="font-bold text-slate-300 mb-1">{r.label}</p>
              <p className="text-slate-500">{r.cols}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Print button */}
      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-bold cursor-pointer transition-all"
          style={{ background: 'rgba(141,198,63,0.12)', color: '#8dc63f', border: '1px solid rgba(141,198,63,0.4)' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(141,198,63,0.25)'}
          onMouseOut={e => e.currentTarget.style.background='rgba(141,198,63,0.12)'}
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
      </div>

      {/* ── Four pay plan sections ── */}
      <SalesSection
        roster={salesRoster}
        onRosterChange={(name, newPct) =>
          setSalesRoster(prev => prev.map(r => r.name === name ? { ...r, pct: newPct } : r))
        }
      />

      <ResiServiceSection
        roster={resiSvcRoster}
        onRosterChange={(name, field, val) =>
          setResiSvcRoster(prev => prev.map(t => t.name === name ? { ...t, [field]: val } : t))
        }
      />

      <ResiInstallSection
        goals={resiInstallGoals}
        onGoalsChange={setResiInstallGoals}
      />

      <CommercialSection
        roster={commercialRoster}
        onRosterChange={(name, field, val) =>
          setCommercialRoster(prev => prev.map(t => t.name === name ? { ...t, [field]: val } : t))
        }
        goals={commercialGoals}
        onGoalsChange={setCommercialGoals}
      />

    </div>
  )
}

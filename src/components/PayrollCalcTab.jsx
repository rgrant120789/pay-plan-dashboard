import { useState, useCallback, useRef, useEffect } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Upload, ChevronDown, ChevronUp, Printer, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'

// ─── Google Sheet CSV URL (Payroll tab) ───────────────────────────────────────
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRKnMSCtFqzHDhdhbcDc_2zPGCs87tX4S-DjLE8TqAAPcvqntB43Mrqigt6MBn05jWDLXWAKyt1DDuC/pub?gid=704511217&single=true&output=csv'

// ─── Static fallback rates (levels 1-4) ───────────────────────────────────────
const RESI_SERVICE_COMM_RATES = {
  1: { workDone: 0.06, soldBy: 0.05 },
  2: { workDone: 0.08, soldBy: 0.05 },
  3: { workDone: 0.10, soldBy: 0.05 },
  4: { workDone: 0.12, soldBy: 0.05 },
}

// ─── Parse Payroll CSV into config ────────────────────────────────────────────
function parsePayrollCSV(csvText) {
  const lines = csvText.split('\n').map(l => l.split(',').map(c => c.replace(/^"|"|\r$/g, '').trim()))

  const salesReps      = []
  const resiSvcRoster  = []
  const resiInstallRoster = []
  const resiInstallGoals  = { billableHours: 160, revenue: 85000, sales: 10000 }
  const commercialRoster  = []
  const commercialGoals   = {
    Service: { billableHours: 160, revenue: 65000, sales: 45000 },
    Install: { billableHours: 160, revenue: 85000, sales: 20000 },
    Entry:   { billableHours: 160, revenue: 65000, sales: 20000 },
  }

  // Column layout from sheet:
  // Col0: Sales Name  | Col1: Sales %
  // Col3: RS Name     | Col4: RS Level | Col5: RS workDone% | Col6: RS soldBy%
  // Col8: Install bonus label | Col9: Install goal value
  // Col12: Comm bonus label | Col13: Comm goal value (Service)
  // Row 7+ Col8: Install tech names
  // Row 19+ Col12: Comm tech name | Col13: Comm focus

  const installGoalLabels  = { 'Billable Hour': 'billableHours', 'Revenue': 'revenue', 'Sales': 'sales' }
  const commSvcGoalLabels  = { 'Billable Hour': 'billableHours', 'Revenue': 'revenue', 'Sales + TGL Sales': 'sales' }
  const commInstGoalLabels = { 'Billable Hour': 'billableHours', 'Revenue': 'revenue', 'Sales + TGL Sales': 'sales' }
  const commEntGoalLabels  = { 'Billable Hour': 'billableHours', 'Revenue': 'revenue', 'Sales + TGL Sales': 'sales' }

  let installGoalRow = 0  // rows 3-5 have install goals (0-indexed row 2-4)
  let commSvcGoalRow = 0
  let commInstGoalRow = 0
  let commEntGoalRow = 0

  lines.forEach((cols, i) => {
    // Row 0 = headers, Row 1 = column headers, data starts row 2
    if (i < 2) return

    // Sales reps (col 0 = name, col 1 = pct like "2.5%")
    const salesName = cols[0]
    const salesPctStr = cols[1]
    if (salesName && salesPctStr && salesPctStr.includes('%')) {
      const pct = parseFloat(salesPctStr) / 100
      if (!isNaN(pct)) salesReps.push({ name: salesName, pct })
    }

    // Resi Service (col 3 = name, col 4 = level)
    const rsName = cols[3]
    const rsLevel = parseInt(cols[4])
    if (rsName && !isNaN(rsLevel) && rsLevel >= 1 && rsLevel <= 4) {
      resiSvcRoster.push({ name: rsName, level: rsLevel })
    }

    // Install goals (rows 2-4: col 8 = label, col 9 = value)
    const instLabel = cols[8]
    const instVal   = cols[9]
    if (instLabel && instVal && installGoalLabels[instLabel]) {
      const key = installGoalLabels[instLabel]
      resiInstallGoals[key] = parseMoney(instVal) || parseFloat(instVal) || resiInstallGoals[key]
    }

    // Install roster (rows 7+ col 8)
    if (i >= 7 && cols[8] && !installGoalLabels[cols[8]] && !cols[8].includes('Install') && !cols[8].includes('Billable') && !cols[8].includes('Revenue') && !cols[8].includes('Sales')) {
      resiInstallRoster.push(cols[8])
    }

    // Commercial Service goals (rows 2-4: col 12 = label, col 13 = value)
    const commSvcLabel = cols[12]
    const commSvcVal   = cols[13]
    if (commSvcLabel && commSvcVal && commSvcGoalLabels[commSvcLabel]) {
      const key = commSvcGoalLabels[commSvcLabel]
      commercialGoals.Service[key] = parseMoney(commSvcVal) || parseFloat(commSvcVal) || commercialGoals.Service[key]
    }

    // Commercial Install goals (rows 8-10)
    if (i >= 7 && i <= 10) {
      const ciLabel = cols[12]
      const ciVal   = cols[13]
      if (ciLabel && ciVal && commInstGoalLabels[ciLabel]) {
        const key = commInstGoalLabels[ciLabel]
        commercialGoals.Install[key] = parseMoney(ciVal) || parseFloat(ciVal) || commercialGoals.Install[key]
      }
    }

    // Commercial Entry goals (rows 14-16)
    if (i >= 13 && i <= 16) {
      const ceLabel = cols[12]
      const ceVal   = cols[13]
      if (ceLabel && ceVal && commEntGoalLabels[ceLabel]) {
        const key = commEntGoalLabels[ceLabel]
        commercialGoals.Entry[key] = parseMoney(ceVal) || parseFloat(ceVal) || commercialGoals.Entry[key]
      }
    }

    // Commercial technicians (rows 19+: col 12 = name, col 13 = focus)
    if (i >= 18) {
      const commName  = cols[12]
      const commFocus = cols[13]
      if (commName && ['Service','Install','Entry'].includes(commFocus)) {
        commercialRoster.push({ name: commName, focus: commFocus })
      }
    }
  })

  return { salesReps, resiSvcRoster, resiInstallRoster, resiInstallGoals, commercialRoster, commercialGoals }
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
      {/* Roster display (read-only) */}
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
                  <td className="px-3 py-2 text-center font-bold" style={{ color: '#8dc63f' }}>{(rep.pct * 100).toFixed(1)}%</td>
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

      {/* Level display (read-only) */}
      <div className="mb-4">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Tech Service Levels</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(141,198,63,0.12)' }}>
                <th className="px-3 py-2 text-left text-slate-300 font-semibold">Name</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Level</th>
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
                    <td className="px-3 py-2 text-center font-bold" style={{ color: '#8dc63f' }}>{t.level}</td>
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

function ResiInstallSection({ roster, goals, onGoalsChange }) {
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

  const results = roster.map(name => {
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

      {/* Goal display (read-only) */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { key: 'billableHours', label: 'Billable Hours Goal', fmt: v => fmtN(v) + ' hrs' },
          { key: 'revenue',       label: 'Revenue Goal',        fmt: v => fmt(v) },
          { key: 'sales',         label: 'Sales Goal',          fmt: v => fmt(v) },
        ].map(f => (
          <div key={f.key} className="rounded-lg p-3 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-slate-400 mb-1">{f.label}</p>
            <p className="text-sm font-bold" style={{ color: '#8dc63f' }}>{f.fmt(goals[f.key])}</p>
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
    name:          findCol(headers, ['name', 'tech_name', 'technician', 'employee', 'tech']) || '',
    billableHours: findCol(headers, ['job billable hours', 'billable_hours', 'billable hours', 'billed_hours', 'hours_billed', 'billable']) || '',
    revenue:       findCol(headers, ['completed revenue', 'completed_revenue', 'revenue', 'job_revenue', 'total_revenue']) || '',
    sales:         findCol(headers, ['total sales', 'total_sales', 'sales', 'sold_revenue', 'sold revenue']) || '',
    tgl:           findCol(headers, ['total tech lead sales', 'tgl', 'tgl_sales', 'tech_generated_lead', 'tech generated lead', 'tgl sales']) || '',
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

      {/* Roster + focus (read-only) */}
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
                    <td className="px-3 py-2 text-center font-bold" style={{ color: '#8dc63f' }}>{t.focus}</td>
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
  const [salesRoster,      setSalesRoster]      = useState([])
  const [resiSvcRoster,    setResiSvcRoster]    = useState([])
  const [resiInstallRoster,setResiInstallRoster]= useState([])
  const [commercialRoster, setCommercialRoster] = useState([])
  const [resiInstallGoals, setResiInstallGoals] = useState({ billableHours: 160, revenue: 85000, sales: 10000 })
  const [commercialGoals,  setCommercialGoals]  = useState({
    Service: { billableHours: 160, revenue: 65000, sales: 45000 },
    Install: { billableHours: 160, revenue: 85000, sales: 20000 },
    Entry:   { billableHours: 160, revenue: 65000, sales: 20000 },
  })
  const [sheetLoading, setSheetLoading] = useState(true)
  const [sheetError,   setSheetError]   = useState(null)

  useEffect(() => {
    fetch(SHEET_CSV_URL)
      .then(r => r.text())
      .then(csv => {
        const cfg = parsePayrollCSV(csv)
        if (cfg.salesReps.length)      setSalesRoster(cfg.salesReps)
        if (cfg.resiSvcRoster.length)  setResiSvcRoster(cfg.resiSvcRoster)
        if (cfg.resiInstallRoster.length) setResiInstallRoster(cfg.resiInstallRoster)
        if (cfg.commercialRoster.length)  setCommercialRoster(cfg.commercialRoster)
        setResiInstallGoals(cfg.resiInstallGoals)
        setCommercialGoals(cfg.commercialGoals)
        setSheetLoading(false)
      })
      .catch(err => {
        setSheetError('Could not load pay plan config from Google Sheet.')
        setSheetLoading(false)
      })
  }, [])

  function resetAll() {
    setSheetLoading(true)
    setSheetError(null)
    fetch(SHEET_CSV_URL)
      .then(r => r.text())
      .then(csv => {
        const cfg = parsePayrollCSV(csv)
        if (cfg.salesReps.length)      setSalesRoster(cfg.salesReps)
        if (cfg.resiSvcRoster.length)  setResiSvcRoster(cfg.resiSvcRoster)
        if (cfg.resiInstallRoster.length) setResiInstallRoster(cfg.resiInstallRoster)
        if (cfg.commercialRoster.length)  setCommercialRoster(cfg.commercialRoster)
        setResiInstallGoals(cfg.resiInstallGoals)
        setCommercialGoals(cfg.commercialGoals)
        setSheetLoading(false)
      })
      .catch(() => { setSheetError('Could not reload config.'); setSheetLoading(false) })
  }

  return (
    <div className="space-y-6">

      {/* Header card */}
      <div className="rounded-xl border px-5 py-4 flex items-start gap-4" style={{ borderColor: 'rgba(141,198,63,0.3)', background: 'rgba(141,198,63,0.06)' }}>
        <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#8dc63f' }} />
        <div>
          <p className="text-sm font-bold text-white mb-1">Payroll Commission Calculator</p>
          <p className="text-xs text-slate-300">Upload your Service Titan exports below for each pay type. Rosters, rates, goals, and focus are pulled live from your Google Sheet — update the sheet and refresh to apply changes.</p>
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

      {/* Sheet loading / error */}
      {sheetLoading && (
        <div className="text-center text-slate-400 text-sm py-4">Loading pay plan config from Google Sheet…</div>
      )}
      {sheetError && (
        <div className="flex items-center gap-2 text-amber-400 text-xs px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/5">
          <AlertCircle className="w-4 h-4 shrink-0" />{sheetError}
        </div>
      )}

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
        roster={resiInstallRoster}
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

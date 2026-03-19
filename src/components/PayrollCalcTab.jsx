import { useState, useCallback, useRef, useEffect } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Upload, ChevronDown, ChevronUp, Printer, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'

// ─── Print stylesheet (injected once) ────────────────────────────────────────
const PRINT_STYLE = [
  '@media print {',
  '  .no-print { display: none !important; }',
  '  .print-hide { display: none !important; }',
  '  body, html { background: #fff; color: #111; }',
  '  table { width: 100%; border-collapse: collapse; font-size: 9pt; table-layout: auto; }',
  '  th { background: #1e3a5f !important; color: #fff !important; padding: 4px 6px; text-align: left !important; white-space: nowrap; font-size: 8.5pt; }',
  '  td { padding: 3px 6px; border-bottom: 1px solid #e5e7eb; color: #111 !important; text-align: left !important; white-space: nowrap; vertical-align: middle; }',
  '  td * { color: #111 !important; }',
  '  td span { white-space: nowrap; }',
  '  tr:nth-child(even) td { background: #f3f4f6; }',
  '  tfoot td { background: #e8f5d0 !important; font-weight: 700; color: #111 !important; white-space: nowrap; }',
  '  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
  '}',
].join('\n')

function usePrintStyle() {
  useEffect(() => {
    if (document.getElementById('payroll-print-style')) return
    const el = document.createElement('style')
    el.id = 'payroll-print-style'
    el.textContent = PRINT_STYLE
    document.head.appendChild(el)
  }, [])
}

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
  const parsed = Papa.parse(csvText, { skipEmptyLines: false })
  const lines  = parsed.data.map(row => row.map(c => String(c).trim()))

  const salesReps      = []
  const resiSvcRoster  = []
  const resiInstallRoster = []
  const resiInstallGoals  = { billableHours: 150, revenue: 85000, sales: 10000 }
  const commercialRoster  = []
  const commercialGoals   = {
    Service: { billableHours: 150, revenue: 65000, sales: 45000 },
    Install: { billableHours: 150, revenue: 85000, sales: 20000 },
    Entry:   { billableHours: 150, revenue: 65000, sales: 20000 },
  }

  // Column layout from sheet:
  // Col0: Sales Name  | Col1: Sales %
  // Col3: RS Name     | Col4: RS Hourly | Col5: RS Level | Col6: RS workDone% | Col7: RS soldBy%
  // Col9: Install bonus label | Col10: Install goal value
  // Col13: Comm bonus label | Col14: Comm goal value (Service)
  // Row 7+ Col9: Install tech names
  // Row 18+ Col13: Comm tech name | Col14: Comm focus

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

    // Resi Service (col 3 = name, col 4 = hourly, col 5 = level)
    const rsName  = cols[3]
    const rsHourly = parseFloat(String(cols[4]).replace(/[$,\s]/g, '')) || 0
    const rsLevel = parseInt(cols[5])
    if (rsName && !isNaN(rsLevel) && rsLevel >= 1 && rsLevel <= 4) {
      resiSvcRoster.push({ name: rsName, level: rsLevel, hourly: rsHourly })
    }

    // Install goals (rows 2-4: col 9 = label, col 10 = value)
    const instLabel = cols[9]
    const instVal   = cols[10]
    if (instLabel && instVal && installGoalLabels[instLabel]) {
      const key = installGoalLabels[instLabel]
      resiInstallGoals[key] = parseMoney(instVal) || parseFloat(instVal) || resiInstallGoals[key]
    }

    // Install roster (rows 7+ col 9)
    if (i >= 7 && cols[9] && !installGoalLabels[cols[9]] && !cols[9].includes('Install') && !cols[9].includes('Billable') && !cols[9].includes('Revenue') && !cols[9].includes('Sales') && !cols[9].includes('Technician')) {
      resiInstallRoster.push(cols[9])
    }

    // Commercial Service goals (rows 2-4: col 13 = label, col 14 = value)
    const commSvcLabel = cols[13]
    const commSvcVal   = cols[14]
    if (commSvcLabel && commSvcVal && commSvcGoalLabels[commSvcLabel]) {
      const key = commSvcGoalLabels[commSvcLabel]
      commercialGoals.Service[key] = parseMoney(commSvcVal) || parseFloat(commSvcVal) || commercialGoals.Service[key]
    }

    // Commercial Install goals (rows 8-10)
    if (i >= 7 && i <= 10) {
      const ciLabel = cols[13]
      const ciVal   = cols[14]
      if (ciLabel && ciVal && commInstGoalLabels[ciLabel]) {
        const key = commInstGoalLabels[ciLabel]
        commercialGoals.Install[key] = parseMoney(ciVal) || parseFloat(ciVal) || commercialGoals.Install[key]
      }
    }

    // Commercial Entry goals (rows 14-16)
    if (i >= 13 && i <= 16) {
      const ceLabel = cols[13]
      const ceVal   = cols[14]
      if (ceLabel && ceVal && commEntGoalLabels[ceLabel]) {
        const key = commEntGoalLabels[ceLabel]
        commercialGoals.Entry[key] = parseMoney(ceVal) || parseFloat(ceVal) || commercialGoals.Entry[key]
      }
    }

    // Commercial technicians (rows 18+: col 13 = name, col 14 = focus)
    if (i >= 17) {
      const commName  = cols[13]
      const commFocus = cols[14]
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
      <div className="no-print mb-4">
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
      <div className="no-print">
      <UploadZone
        label="Drop Sales Report CSV"
        hint="Needs: salesperson name + total sales columns"
        onData={onData}
        rowCount={rows.length}
        fileName={fileName}
      />
      <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={FIELDS} />
      </div>

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
    primaryTech: findCol(headers, ['primary technician', 'primary_technician', 'primary tech', 'technician', 'tech', 'name', 'tech_name', 'employee']) || '',
    soldBy:      findCol(headers, ['sold by', 'sold_by', 'salesperson', 'sold-by']) || '',
    total:       findCol(headers, ['total', 'invoice total', 'job total', 'amount', 'revenue']) || '',
    period:      findCol(headers, ['completed date', 'completion date', 'completed_date', 'completion_date', 'invoice date', 'invoice_date', 'week', 'period', 'pay_period', 'date', 'job_date']) || '',
  }
}

function autoMapResiHours(headers) {
  return {
    name:      findCol(headers, ['name', 'full name', 'full_name', 'tech name', 'tech_name', 'technician', 'employee', 'tech']) || '',
    firstName: findCol(headers, ['first name', 'first_name', 'firstname']) || '',
    lastName:  findCol(headers, ['last name', 'last_name', 'lastname', 'surname']) || '',
    regHours:  findCol(headers, ['hours-regular', 'hours_regular', 'regular hours', 'regular_hours', 'reg hours', 'reg_hours', 'regular']) || '',
    otHours:   findCol(headers, ['hours-overtime', 'hours_overtime', 'overtime hours', 'overtime_hours', 'ot hours', 'ot_hours', 'overtime', 'over time']) || '',
    totalHours: findCol(headers, ['hours worked', 'hours_worked', 'total hours', 'total_hours', 'hours', 'time', 'worked']) || '',
  }
}

function ResiServiceSection({ roster, onRosterChange }) {
  const [rows, setRows]           = useState([])
  const [headers, setHeaders]     = useState([])
  const [fileName, setFileName]   = useState('')
  const [mapping, setMapping]     = useState({})

  const [hoursRows, setHoursRows]         = useState([])
  const [hoursHeaders, setHoursHeaders]   = useState([])
  const [hoursFileName, setHoursFileName] = useState('')
  const [hoursMapping, setHoursMapping]   = useState({})

  const JOB_FIELDS = [
    { key: 'primaryTech', label: 'Primary Technician'   },
    { key: 'soldBy',      label: 'Sold By'              },
    { key: 'total',       label: 'Job Total $'           },
    { key: 'period',      label: 'Completed Date (opt.)' },
  ]

  const HOURS_FIELDS = [
    { key: 'firstName', label: 'First Name'    },
    { key: 'lastName',  label: 'Last Name'     },
    { key: 'regHours',  label: 'Regular Hours' },
    { key: 'otHours',   label: 'Overtime Hours' },
  ]

  function onData(data, hdrs, fname) {
    setHeaders(hdrs)
    setRows(data)
    setFileName(fname)
    setMapping(autoMapResiService(hdrs))
  }

  function onHoursData(data, hdrs, fname) {
    setHoursHeaders(hdrs)
    setHoursRows(data)
    setHoursFileName(fname)
    setHoursMapping(autoMapResiHours(hdrs))
  }

  // Build hours-worked map from the time tracking upload
  // Supports: combined name OR first+last name columns; total OR reg+OT columns
  const hoursMap = {}   // name -> { reg, ot }
  hoursRows.forEach(r => {
    const fullName  = String(r[hoursMapping.name]      || '').trim()
    const firstName = String(r[hoursMapping.firstName] || '').trim()
    const lastName  = String(r[hoursMapping.lastName]  || '').trim()
    const name = fullName || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName)
    if (!name) return
    const reg   = parseNum(r[hoursMapping.regHours])
    const ot    = parseNum(r[hoursMapping.otHours])
    const total = parseNum(r[hoursMapping.totalHours])
    if (!hoursMap[name]) hoursMap[name] = { reg: 0, ot: 0 }
    if (reg || ot) {
      hoursMap[name].reg += reg
      hoursMap[name].ot  += ot
    } else if (total) {
      hoursMap[name].reg += total
    }
  })

  // Aggregate per tech: workRevenue = rows where primary tech, soldRevenue = rows where sold by
  const byTech = {}
  const ensureTech = (name) => {
    if (!byTech[name]) byTech[name] = { name, workRevenue: 0, soldRevenue: 0 }
  }
  rows.forEach(r => {
    const primary = String(r[mapping.primaryTech] || '').trim()
    const soldBy  = String(r[mapping.soldBy]      || '').trim()
    const total   = parseMoney(r[mapping.total])
    if (!total) return
    if (primary) { ensureTech(primary); byTech[primary].workRevenue += total }
    if (soldBy)  { ensureTech(soldBy);  byTech[soldBy].soldRevenue  += total }
  })

  const rosterMap = Object.fromEntries(roster.map(t => [t.name, t]))

  // Build results for everyone who appears in data, ordered by roster first then unmatched
  const allNames = [
    ...roster.map(t => t.name).filter(n => byTech[n]),
    ...Object.keys(byTech).filter(n => !rosterMap[n]),
  ]

  const results = allNames.map(name => {
    const d             = byTech[name] || { workRevenue: 0, soldRevenue: 0 }
    const tech          = rosterMap[name]
    const hEntry        = hoursMap[name] || { reg: 0, ot: 0 }
    const regularHours  = Math.max(hEntry.reg, 0)
    const overtimeHours = Math.max(hEntry.ot, 0)
    const totalHours    = regularHours + overtimeHours
    if (!tech) return { name, ...d, totalHours, regularHours, overtimeHours, level: '?', commissionPay: 0, hourlyPay: 0, finalPay: 0, matched: false }

    const rate           = RESI_SERVICE_COMM_RATES[tech.level] || RESI_SERVICE_COMM_RATES[3]
    const commissionPay  = d.workRevenue * rate.workDone + d.soldRevenue * rate.soldBy
    const hourlyRate     = Math.max(tech.hourly || 0, 0)
    const hourlyPay      = hourlyRate * regularHours + hourlyRate * 1.5 * overtimeHours

    // Straight-time base = hourly rate × ALL hours (no OT multiplier).
    // The payroll system pays Regular + Overtime lines; these are pre-handled.
    // We only need to tell it what to enter for the two Commission lines.
    const straightTimePay = hourlyRate * totalHours  // base the payroll system already covers via Regular+OT lines

    let winningType, commPerf, commPerfOT, finalPay
    if (commissionPay > hourlyPay) {
      winningType  = 'commission'
      // Surplus above straight-time base → Commission - Performance line
      commPerf     = Math.max(commissionPay - straightTimePay, 0)
      // Half-time adder for OT hours → Commission - Performance OT line
      commPerfOT   = overtimeHours > 0 ? 0.5 * (commissionPay / totalHours) * overtimeHours : 0
      finalPay     = commissionPay + commPerfOT
    } else {
      winningType  = 'hourly'
      commPerf     = 0
      commPerfOT   = 0
      finalPay     = hourlyPay
    }

    return {
      name, ...d,
      level: tech.level, workDonePct: rate.workDone, soldByPct: rate.soldBy,
      hourlyRate, totalHours, regularHours, overtimeHours,
      hourlyPay, commissionPay, straightTimePay, winningType,
      commPerf, commPerfOT, finalPay,
      matched: true,
    }
  })

  const grandTotal = results.reduce((s, r) => s + r.finalPay, 0)

  return (
    <Section title="Residential Service Commission" badge="Weekly">
      <div className="no-print rounded-xl border px-4 py-3 mb-4 text-xs text-slate-300" style={{ borderColor: 'rgba(141,198,63,0.25)', background: 'rgba(141,198,63,0.05)' }}>
        <span className="font-bold text-white">Formula:</span> Pay = higher of (hourly + 1.5× OT) or commission &nbsp;·&nbsp; If commission wins with OT: add <span style={{ color: '#8dc63f' }}>0.5 × (commission ÷ total hrs) × OT hrs</span> true-up
      </div>

      {/* Level display (read-only) */}
      <div className="no-print mb-4">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Tech Service Levels</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(141,198,63,0.12)' }}>
                <th className="px-3 py-2 text-left text-slate-300 font-semibold">Name</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Hourly Rate</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Level</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Work Done %</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Sold By %</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((t, i) => {
                const rate = RESI_SERVICE_COMM_RATES[t.level] || RESI_SERVICE_COMM_RATES[1]
                return (
                  <tr key={t.name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                    <td className="px-3 py-2 text-white">{t.name}</td>
                    <td className="px-3 py-2 text-center font-bold" style={{ color: '#8dc63f' }}>{t.hourly ? fmt(t.hourly) + '/hr' : '—'}</td>
                    <td className="px-3 py-2 text-center font-bold" style={{ color: '#8dc63f' }}>{t.level}</td>
                    <td className="px-3 py-2 text-center text-slate-300">{pct(rate.workDone)}</td>
                    <td className="px-3 py-2 text-center text-slate-300">{pct(rate.soldBy)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="no-print">
        <UploadZone
          label="Drop Resi Service Job Report"
          hint="Needs: Primary Technician, Sold By, Total"
          onData={onData}
          rowCount={rows.length}
          fileName={fileName}
          accent="#8dc63f"
        />
        <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={JOB_FIELDS} />
        <div className="mt-3">
          <UploadZone
            label="Drop Weekly Time Tracking Report"
            hint="Needs: Tech name + hours worked for the week"
            onData={onHoursData}
            rowCount={hoursRows.length}
            fileName={hoursFileName}
            accent="#60a5fa"
          />
          <ColMapper headers={hoursHeaders} mapping={hoursMapping} onChange={setHoursMapping} fields={HOURS_FIELDS} />
        </div>
      </div>

      {rows.length > 0 && mapping.primaryTech && mapping.total && (
        <div className="mt-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Paystub Commission Lines — Enter These in Payroll</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#8dc63f] text-[#0d2b4e]">
                  <th className="px-3 py-2.5 text-left font-bold">Name</th>
                  <th className="px-3 py-2.5 text-center font-bold">Reg Hrs</th>
                  <th className="px-3 py-2.5 text-center font-bold">OT Hrs</th>
                  <th className="px-3 py-2.5 text-right font-bold">Commission Total</th>
                  <th className="px-3 py-2.5 text-center font-bold">Winner</th>
                  <th className="px-3 py-2.5 text-right font-bold" style={{ background: 'rgba(13,43,78,0.3)' }}>Commission – Performance</th>
                  <th className="px-3 py-2.5 text-right font-bold" style={{ background: 'rgba(13,43,78,0.3)' }}>Commission – Performance OT</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'} ${!r.matched ? 'opacity-60' : ''}`}>
                    <td className="px-3 py-2.5 font-semibold text-white">
                      {r.name}
                      {!r.matched && <span className="ml-1 text-xs text-amber-400">*unmatched</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-300 text-xs">{fmtN(r.regularHours)}</td>
                    <td className="px-3 py-2.5 text-center text-xs" style={{ color: r.overtimeHours > 0 ? '#f59e0b' : '#64748b' }}>{fmtN(r.overtimeHours)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-300 text-xs">
                      {fmt(r.commissionPay)}
                      {r.matched && <div className="text-slate-500 print-hide">{fmt(r.workRevenue)}×{pct(r.workDonePct)} + {fmt(r.soldRevenue)}×{pct(r.soldByPct)}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        r.winningType === 'commission' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                      }`}>{r.winningType || '—'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-base" style={{ color: r.commPerf > 0 ? '#8dc63f' : '#64748b' }}>
                      {r.commPerf > 0 ? fmt(r.commPerf) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-base" style={{ color: r.commPerfOT > 0 ? '#f59e0b' : '#64748b' }}>
                      {r.commPerfOT > 0 ? fmt(r.commPerfOT) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(13,43,78,0.8)', borderTop: '1px solid rgba(141,198,63,0.3)' }}>
                  <td colSpan={5} className="px-3 py-2.5 text-right font-bold text-slate-200">TOTALS</td>
                  <td className="px-3 py-2.5 text-right font-bold" style={{ color: '#8dc63f' }}>{fmt(results.reduce((s,r)=>s+r.commPerf,0))}</td>
                  <td className="px-3 py-2.5 text-right font-bold" style={{ color: '#f59e0b' }}>{fmt(results.reduce((s,r)=>s+r.commPerfOT,0))}</td>
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
      <div className="no-print rounded-xl border px-4 py-3 mb-4 text-xs text-slate-300" style={{ borderColor: 'rgba(141,198,63,0.25)', background: 'rgba(141,198,63,0.05)' }}>
        <span className="font-bold text-white">Formula:</span> Each month: <span style={{ color: '#8dc63f' }}>$1,000</span> if ≥ {fmtN(goals.billableHours)} billable hours &nbsp;+&nbsp; <span style={{ color: '#8dc63f' }}>$1,000</span> if ≥ {fmt(goals.revenue)} revenue &nbsp;+&nbsp; <span style={{ color: '#8dc63f' }}>$1,000</span> if ≥ {fmt(goals.sales)} sales &nbsp;·&nbsp; Max <span style={{ color: '#8dc63f' }}>$3,000/mo</span>
      </div>

      {/* Roster display (read-only) */}
      <div className="no-print mb-4">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#8dc63f' }}>Residential Install Technicians</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(141,198,63,0.12)' }}>
                <th className="px-3 py-2 text-left text-slate-300 font-semibold">Name</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Billable Hrs Goal</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Revenue Goal</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Sales Goal</th>
                <th className="px-3 py-2 text-center text-slate-300 font-semibold">Max Bonus</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((name, i) => (
                <tr key={name} className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}>
                  <td className="px-3 py-2 text-white">{name}</td>
                  <td className="px-3 py-2 text-center text-slate-300 text-xs">{fmtN(goals.billableHours)} hrs</td>
                  <td className="px-3 py-2 text-center text-slate-300 text-xs">{fmt(goals.revenue)}</td>
                  <td className="px-3 py-2 text-center text-slate-300 text-xs">{fmt(goals.sales)}</td>
                  <td className="px-3 py-2 text-center font-bold text-xs" style={{ color: '#8dc63f' }}>$3,000</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goal display (read-only) */}
      <div className="no-print grid grid-cols-3 gap-3 mb-4">
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

      <div className="no-print">
        <UploadZone
          label="Drop Resi Install Report CSV"
          hint="Needs: tech name, billable hours, revenue, sales — run one month at a time"
          onData={onData}
          rowCount={rows.length}
          fileName={fileName}
        />
        <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={FIELDS} />
      </div>

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
      <div className="no-print rounded-xl border px-4 py-3 mb-4 text-xs text-slate-300" style={{ borderColor: 'rgba(141,198,63,0.25)', background: 'rgba(141,198,63,0.05)' }}>
        <span className="font-bold text-white">Formula:</span> Each month: <span style={{ color: '#8dc63f' }}>$1,000</span> billable hours + <span style={{ color: '#8dc63f' }}>$1,000</span> revenue + <span style={{ color: '#8dc63f' }}>$1,000</span> (Sales + TGL Sales) &nbsp;·&nbsp; Goals differ by focus (Service / Install / Entry) &nbsp;·&nbsp; Max <span style={{ color: '#8dc63f' }}>$3,000/mo</span>
      </div>

      {/* Roster + focus (read-only) */}
      <div className="no-print mb-4">
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

      <div className="no-print">
        <UploadZone
          label="Drop Commercial Report CSV"
          hint="Needs: tech name, billable hours, revenue, sales, TGL sales — run one month at a time"
          onData={onData}
          rowCount={rows.length}
          fileName={fileName}
        />
        <ColMapper headers={headers} mapping={mapping} onChange={setMapping} fields={FIELDS} />
      </div>

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
  usePrintStyle()
  const [salesRoster,      setSalesRoster]      = useState([])
  const [resiSvcRoster,    setResiSvcRoster]    = useState([])
  const [resiInstallRoster,setResiInstallRoster]= useState([])
  const [commercialRoster, setCommercialRoster] = useState([])
  const [resiInstallGoals, setResiInstallGoals] = useState({ billableHours: 150, revenue: 85000, sales: 10000 })
  const [commercialGoals,  setCommercialGoals]  = useState({
    Service: { billableHours: 150, revenue: 65000, sales: 45000 },
    Install: { billableHours: 150, revenue: 85000, sales: 20000 },
    Entry:   { billableHours: 150, revenue: 65000, sales: 20000 },
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
      <div className="no-print rounded-xl border px-5 py-4 flex items-start gap-4" style={{ borderColor: 'rgba(141,198,63,0.3)', background: 'rgba(141,198,63,0.06)' }}>
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

      {/* Reports Required */}
      <div className="no-print rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-3 text-slate-400">Reports Required</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            {
              section: 'Sales Commission',
              reports: [
                { system: 'ServiceTitan', name: 'A1 Pay Plan - Sales', fields: ['Salesperson', 'Total Sales $'] },
              ],
            },
            {
              section: 'Residential Service',
              reports: [
                { system: 'ServiceTitan', name: 'A1 Pay Plan - Residential Service (Weekly Pay)', fields: ['Primary Technician', 'Sold By', 'Job Total $', 'Completed Date'] },
                { system: 'BambooHR', name: 'A1 Resi Service Tech Hours', fields: ['First Name', 'Last Name', 'Hours-Regular', 'Hours-Overtime'] },
              ],
            },
            {
              section: 'Residential Install',
              reports: [
                { system: 'ServiceTitan', name: 'A1 Pay Plan - Residential Install', fields: ['Tech Name', 'Billable Hours', 'Revenue $', 'Sales $'] },
              ],
            },
            {
              section: 'Commercial',
              reports: [
                { system: 'ServiceTitan', name: 'A1 Pay Plan - Commercial', fields: ['Tech Name', 'Billable Hours', 'Revenue $', 'Sales $', 'TGL Sales $'] },
              ],
            },
          ].map(sec => (
            <div key={sec.section} className="rounded-lg p-3 border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="font-bold text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' }}>{sec.section}</p>
              {sec.reports.map(r => (
                <div key={r.name} className="mb-1.5 last:mb-0">
                  <p><span className="font-semibold" style={{ color: '#8dc63f' }}>{r.system}</span><span className="text-slate-400"> · </span><span className="font-semibold text-white">{r.name}</span></p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Print button */}
      <div className="no-print flex justify-end">
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
        <div className="no-print text-center text-slate-400 text-sm py-4">Loading pay plan config from Google Sheet…</div>
      )}
      {sheetError && (
        <div className="no-print flex items-center gap-2 text-amber-400 text-xs px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/5">
          <AlertCircle className="w-4 h-4 shrink-0" />{sheetError}
        </div>
      )}

      {/* ── Weekly sections ── */}
      <div className="rounded-2xl border-2 p-4 space-y-4" style={{ borderColor: '#f59e0b', background: 'rgba(245,158,11,0.04)' }}>
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#f59e0b' }}>⟳ Weekly Pay</p>
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
      </div>

      {/* ── Monthly sections ── */}
      <div className="rounded-2xl border-2 p-4 space-y-4" style={{ borderColor: '#60a5fa', background: 'rgba(96,165,250,0.04)' }}>
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#60a5fa' }}>⟳ Monthly Pay</p>
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

    </div>
  )
}

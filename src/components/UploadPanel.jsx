import { useCallback, useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react'

const EXPECTED_COLUMNS = [
  'tech_name', 'job_date', 'job_type', 'category',
  'hours_worked', 'billable_hours', 'revenue', 'sales', 'sold_revenue'
]

const SAMPLE_ROWS = [
  ['tech_name','job_date','job_type','category','hours_worked','billable_hours','revenue','sales','sold_revenue'],
  // Resi Service techs
  ['Adam D.','2025-01-05','service','resi','6','6','1100','0','900'],
  ['Adam D.','2025-01-12','service','resi','5','5','850','0','700'],
  ['Adam D.','2025-02-03','service','resi','7','7','1300','0','1100'],
  ['Adam D.','2025-02-18','service','resi','6','6','950','0','800'],
  ['Adam E.','2025-01-06','service','resi','8','8','2500','2100','2100'],
  ['Adam E.','2025-01-20','service','resi','8','8','2800','2300','2300'],
  ['Adam E.','2025-02-05','service','resi','7','7','2200','1900','1900'],
  ['Adam E.','2025-02-19','service','resi','8','8','2600','2200','2200'],
  ['Tim W.','2025-01-07','service','resi','8','8','2200','1800','1800'],
  ['Tim W.','2025-01-21','service','resi','7','7','1900','1500','1500'],
  ['Tim W.','2025-02-10','service','resi','8','8','2400','2000','2000'],
  ['Kaleb G.','2025-01-09','service','resi','6','6','1050','0','800'],
  ['Kaleb G.','2025-01-23','service','resi','5','5','890','0','750'],
  ['Kaleb G.','2025-02-14','service','resi','7','7','1200','0','1000'],
  ['Cannan B.','2025-01-15','service','resi','6','6','780','0','600'],
  ['Cannan B.','2025-02-05','service','resi','5','5','820','0','650'],
  ['JJ L.','2025-01-20','service','resi','6','6','800','0','620'],
  ['JJ L.','2025-02-11','service','resi','5','5','760','0','580'],
  ['Marissa H.','2025-01-25','service','resi','5','5','770','0','600'],
  ['Marissa H.','2025-02-20','service','resi','6','6','810','0','640'],
  // Resi Install techs
  ['Mike N.','2025-01-08','install','resi','9','9','18500','12000','12000'],
  ['Mike N.','2025-01-22','install','resi','10','10','22000','15000','15000'],
  ['Mike N.','2025-02-06','install','resi','9','9','19000','13000','13000'],
  ['Mike N.','2025-02-19','install','resi','10','10','21000','14000','14000'],
  ['Steve G.','2025-01-10','install','resi','9','9','17000','11000','11000'],
  ['Steve G.','2025-01-24','install','resi','10','10','20000','13500','13500'],
  ['Steve G.','2025-02-08','install','resi','9','9','18000','12000','12000'],
  ['Bubba B.','2025-01-14','install','resi','8','8','16000','10500','10500'],
  ['Bubba B.','2025-02-03','install','resi','9','9','17500','11500','11500'],
  ['Josiah B.','2025-01-17','install','resi','8','8','15000','9500','9500'],
  ['Josiah B.','2025-02-12','install','resi','9','9','16500','10000','10000'],
  ['Greg C.','2025-01-19','install','resi','7','7','13000','8000','8000'],
  ['Greg C.','2025-02-15','install','resi','8','8','14500','9000','9000'],
  ['Josh S.','2025-01-26','install','resi','7','7','12500','7500','7500'],
  ['Josh S.','2025-02-22','install','resi','8','8','13800','8500','8500'],
  // Commercial techs
  ['Dorie L.','2025-01-06','service','commercial','8','8','9800','7000','0'],
  ['Dorie L.','2025-01-20','service','commercial','8','8','10200','7500','0'],
  ['Dorie L.','2025-02-04','service','commercial','9','9','11000','8000','0'],
  ['Dorie L.','2025-02-17','service','commercial','8','8','9500','6800','0'],
  ['Grady T.','2025-01-08','service','commercial','8','8','8900','6200','0'],
  ['Grady T.','2025-01-22','service','commercial','7','7','8400','5800','0'],
  ['Grady T.','2025-02-10','service','commercial','8','8','9200','6500','0'],
  ['Jack D.','2025-01-11','service','commercial','8','8','7800','5200','0'],
  ['Jack D.','2025-02-06','service','commercial','7','7','7200','4900','0'],
  ['Alex T.','2025-01-13','install','commercial','9','9','19500','14000','0'],
  ['Alex T.','2025-01-27','install','commercial','10','10','22000','16000','0'],
  ['Alex T.','2025-02-09','install','commercial','9','9','20000','14500','0'],
  ['Brandon G.','2025-01-15','install','commercial','8','8','16000','11000','0'],
  ['Brandon G.','2025-02-14','install','commercial','9','9','18000','12500','0'],
  ['Ethan H.','2025-01-18','install','commercial','8','8','15500','10500','0'],
  ['Ethan H.','2025-02-16','install','commercial','9','9','17000','11500','0'],
  ['Ronnie S.','2025-01-21','install','commercial','7','7','12000','8000','0'],
  ['Ronnie S.','2025-02-18','install','commercial','8','8','13500','9000','0'],
]

function downloadSampleCSV() {
  const csv = SAMPLE_ROWS.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample_job_data_2025.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function UploadPanel({ onUpload, jobCount }) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState(null)

  const handleFile = useCallback((file) => {
    if (!file) return
    setFileName(file.name)
    onUpload(file)
  }, [onUpload])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Import 2025 Job Data</h2>
        <p className="text-slate-500 text-sm mb-6">
          Upload your CSV export from your field management system to begin the pay plan comparison.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
            ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-300 hover:bg-slate-50'}`}
          onClick={() => document.getElementById('csv-input').click()}
        >
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleChange}
          />
          {jobCount > 0 ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <p className="font-semibold text-green-700">{jobCount} jobs loaded</p>
              <p className="text-slate-500 text-sm">{fileName}</p>
              <p className="text-slate-400 text-xs mt-1">Click to replace with a different file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-slate-400" />
              <p className="font-medium text-slate-700">Drop your CSV here or click to browse</p>
              <p className="text-slate-400 text-sm">Supports .csv files exported from ServiceTitan, Jobber, or similar</p>
            </div>
          )}
        </div>
      </div>

      {/* Expected Format Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-700">Expected CSV Format</h3>
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Your CSV must include the following column headers (case-insensitive). Extra columns are ignored.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EXPECTED_COLUMNS.map(col => (
            <div key={col} className="bg-slate-50 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 border border-slate-200">
              {col}
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 text-xs text-slate-500">
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">tech_name</span>
            <span>Technician name (e.g., "Adam D." or "Adam Duncan" — will be matched to roster)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">job_date</span>
            <span>Date of job (any standard date format, e.g., 2025-01-15)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">job_type</span>
            <span>Type of job: "service", "install", or "commercial"</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">category</span>
            <span>Subcategory: "resi" or "commercial"</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">hours_worked</span>
            <span>Total hours worked on job (numeric)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">billable_hours</span>
            <span>Billable hours (numeric)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">revenue</span>
            <span>Total job revenue (numeric, no $ sign)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">sales</span>
            <span>Sales amount attributed to this tech (numeric)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-slate-700 w-32 shrink-0">sold_revenue</span>
            <span>Revenue on jobs this tech sold (for service commission calculation)</span>
          </div>
        </div>
      </div>

      {/* Sample Data Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 flex-1">
          <p className="font-semibold mb-1">Don't have your data ready?</p>
          <p className="mb-3">Download the sample CSV pre-populated with all roster techs to explore the dashboard immediately. Replace it with your real ServiceTitan export when ready.</p>
          <button
            onClick={downloadSampleCSV}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV
          </button>
        </div>
      </div>
    </div>
  )
}

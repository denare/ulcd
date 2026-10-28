import React from 'react'
import Papa from 'papaparse'
import { Upload, Download, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { validateImportRow, CSV_TEMPLATE_HEADER, type ImportRowData } from '@/lib/validation/import.schema'
import { importLecturers } from '@/services/admin.service'
import supabase from '@/lib/supabase'

type Step = 'upload' | 'preview' | 'result'

interface RowResult {
  row: Record<string, string>
  parsed?: ImportRowData
  errors?: string[]
}

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

function downloadTemplate() {
  const content = CSV_TEMPLATE_HEADER
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ulcd-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function ImportPage() {
  const [step, setStep] = React.useState<Step>('upload')
  const [rows, setRows] = React.useState<RowResult[]>([])
  const [importing, setImporting] = React.useState(false)
  const [result, setResult] = React.useState<ImportResult | null>(null)
  const [institutionId, setInstitutionId] = React.useState<string>('')

  React.useEffect(() => {
    supabase.from('institutions').select('id').eq('slug', 'udom').single()
      .then(({ data }) => { if (data) setInstitutionId(data.id) })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: RowResult[] = results.data.map((row) => {
          const { data, errors } = validateImportRow(row)
          return { row, parsed: data, errors }
        })
        setRows(parsed)
        setStep('preview')
      },
    })
  }

  const validRows = rows.filter(r => r.parsed && !r.errors?.length)
  const invalidRows = rows.filter(r => r.errors?.length)

  const handleImport = async () => {
    if (!institutionId) return
    setImporting(true)
    try {
      const res = await importLecturers(institutionId, validRows.map(r => r.parsed!))
      setResult(res)
      setStep('result')
    } catch (e) {
      setResult({ imported: 0, skipped: 0, errors: [(e as Error).message] })
      setStep('result')
    } finally {
      setImporting(false)
    }
  }

  if (step === 'result' && result) return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-display font-bold text-text-primary">Import Complete</h1>
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <span className="font-medium">{result.imported} lecturer{result.imported !== 1 ? 's' : ''} imported</span>
        </div>
        {result.skipped > 0 && (
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warning" />
            <span>{result.skipped} rows skipped (duplicates or invalid)</span>
          </div>
        )}
        {result.errors.length > 0 && (
          <div>
            <p className="font-medium text-danger mb-2">{result.errors.length} error(s):</p>
            <ul className="space-y-1 text-sm text-text-secondary">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>
      <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => { setStep('upload'); setRows([]); setResult(null) }}>
        Import more
      </Button>
    </div>
  )

  if (step === 'preview') return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-text-primary">Review Import</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="green">{validRows.length} valid</Badge>
          {invalidRows.length > 0 && <Badge variant="red">{invalidRows.length} invalid</Badge>}
        </div>
      </div>

      <div className="card overflow-hidden max-h-[60vh] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-surface-muted border-b border-border sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Email</th>
              <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Phone</th>
              <th className="text-left px-3 py-2 font-medium">Issues</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-b border-border ${r.errors?.length ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2">
                  {r.errors?.length
                    ? <XCircle className="h-4 w-4 text-danger" />
                    : <CheckCircle className="h-4 w-4 text-success" />}
                </td>
                <td className="px-3 py-2 font-medium">{r.parsed?.display_name ?? `${r.row.first_name} ${r.row.last_name}`}</td>
                <td className="px-3 py-2 hidden md:table-cell">{r.parsed?.email ?? r.row.email ?? '—'}</td>
                <td className="px-3 py-2 hidden md:table-cell font-mono">{r.parsed?.mobile_phone ?? r.row.mobile_phone ?? '—'}</td>
                <td className="px-3 py-2 text-danger">{r.errors?.join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleImport} loading={importing} disabled={validRows.length === 0}>
          Import {validRows.length} Valid Row{validRows.length !== 1 ? 's' : ''}
        </Button>
        <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => { setStep('upload'); setRows([]) }}>
          Start Over
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-display font-bold text-text-primary">Import Lecturers</h1>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-text-primary">Step 1: Download the template</h2>
        <p className="text-sm text-text-secondary">
          Download the CSV template, fill in lecturer data, then upload. Required columns: first_name, last_name.
        </p>
        <Button variant="secondary" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={downloadTemplate}>
          Download CSV Template
        </Button>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-text-primary">Step 2: Upload your CSV</h2>
        <label htmlFor="csv-upload"
          className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <Upload className="h-8 w-8 text-text-muted" aria-hidden="true" />
          <span className="text-sm text-text-secondary">Click to select a .csv file</span>
          <input id="csv-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
        </label>
        <p className="text-xs text-text-muted">
          Imported lecturers are set to Draft status. No contacts are published automatically.
          All contacts require verification before they can be made public.
        </p>
      </div>
    </div>
  )
}

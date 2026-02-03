'use client'

import { useEffect, useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { pollJob, uploadPdf, type IngestJob } from '@/lib/api'

const isTerminalStatus = (status?: IngestJob['status']) =>
  status === 'completed' || status === 'failed'

const getStatusLabel = (status?: IngestJob['status']) => {
  switch (status) {
    case 'queued':
      return 'En espera'
    case 'processing':
      return 'Procesando'
    case 'completed':
      return 'Listo'
    case 'failed':
      return 'Con error'
    default:
      return 'Sin estado'
  }
}

export default function ExtractPage() {
  const [job, setJob] = useState<IngestJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)
    try {
      const created = await uploadPdf(file)
      setJob(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar el proceso.')
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (!job?.job_id || isTerminalStatus(job.status)) return
    let cancelled = false
    const poll = async () => {
      try {
        const updated = await pollJob(job.job_id)
        if (!cancelled) {
          setJob(updated)
          if (!isTerminalStatus(updated.status)) {
            setTimeout(poll, 2000)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No pudimos actualizar el estado.')
        }
      }
    }
    const timeout = setTimeout(poll, 2000)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [job?.job_id, job?.status])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Extracción de PDF</h1>
        <p className="text-sm text-neutral-500">Sube un PDF para generar un resumen.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm">{error}</div>}

      <FileUpload onUpload={handleUpload} label={isUploading ? 'Subiendo...' : 'Subir PDF'} />

      {job && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-neutral-700">Proceso:</span>
            <span className="text-sm text-neutral-500">{job.job_id}</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
              {getStatusLabel(job.status)}
            </span>
          </div>
          {job.summary && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-neutral-800">Resumen</h2>
              <p className="mt-2 text-sm text-neutral-600 whitespace-pre-wrap">{job.summary}</p>
            </div>
          )}
          {job.error && (
            <div className="mt-4 text-sm text-red-600">Error: {job.error}</div>
          )}
          {job.result && !job.summary && (
            <pre className="mt-4 whitespace-pre-wrap rounded bg-neutral-50 p-3 text-xs text-neutral-600">
              {JSON.stringify(job.result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

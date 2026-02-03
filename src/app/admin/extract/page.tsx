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

const STORAGE_KEY = 'ingest_jobs'

export default function ExtractPage() {
  const [jobs, setJobs] = useState<IngestJob[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)
    try {
      const created = await uploadPdf(file)
      setJobs((prev) => [created, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar el proceso.')
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as IngestJob[]
        setJobs(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  }, [jobs])

  useEffect(() => {
    const activeJobs = jobs.filter((job) => job.job_id && !isTerminalStatus(job.status))
    if (activeJobs.length === 0) return
    let cancelled = false
    const poll = async () => {
      try {
        const updates = await Promise.all(activeJobs.map((job) => pollJob(job.job_id)))
        if (cancelled) return
        setJobs((prev) =>
          prev.map((job) => updates.find((updated) => updated.job_id === job.job_id) ?? job),
        )
        if (!cancelled && updates.some((updated) => !isTerminalStatus(updated.status))) {
          setTimeout(poll, 2000)
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
  }, [jobs])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Extracción de PDF</h1>
        <p className="text-sm text-neutral-500">Sube un PDF para generar un resumen.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm">{error}</div>}

      <FileUpload onUpload={handleUpload} label={isUploading ? 'Subiendo...' : 'Subir PDF'} />

      {jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => {
            const hasResult = job.result !== undefined && job.result !== null
            return (
              <div key={job.job_id} className="rounded-lg border border-neutral-200 bg-white p-6">
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
                    <p className="mt-2 text-sm text-neutral-600 whitespace-pre-wrap">
                      {job.summary}
                    </p>
                  </div>
                )}
                {job.error && (
                  <div className="mt-4 text-sm text-red-600">Error: {job.error}</div>
                )}
                {hasResult && !job.summary && (
                  <pre className="mt-4 whitespace-pre-wrap rounded bg-neutral-50 p-3 text-xs text-neutral-600">
                    {JSON.stringify(job.result, null, 2)}
                  </pre>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

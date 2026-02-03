'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'

type FileUploadProps = {
  onUpload: (file: File) => Promise<void> | void
  accept?: string
  label?: string
}

export const FileUpload = ({ onUpload, accept = '.pdf', label = 'Subir PDF' }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!file) {
      setError('Selecciona un PDF para subirlo.')
      return
    }
    await onUpload(file)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
      <div>
        <label className="text-sm font-medium text-neutral-700">Archivo PDF</label>
        <input
          type="file"
          accept={accept}
          className="mt-2 block w-full text-sm"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        {file && <p className="mt-2 text-xs text-neutral-500">Seleccionado: {file.name}</p>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-sm text-white">
        {label}
      </button>
    </form>
  )
}

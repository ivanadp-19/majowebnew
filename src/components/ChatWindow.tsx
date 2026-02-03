'use client'

import type { FormEvent } from 'react'
import type { UIMessage } from 'ai'
import { Streamdown } from 'streamdown'

type ChatWindowProps = {
  messages: UIMessage[]
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  onStop?: () => void
  error?: string | null
}

export const ChatWindow = ({
  messages,
  input,
  onInputChange,
  onSend,
  status,
  onStop,
  error,
}: ChatWindowProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!input.trim()) return
    onSend()
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="max-h-[480px] space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500">Escribe un mensaje para empezar.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              message.role === 'user'
                ? 'ml-auto w-fit bg-neutral-900 text-white'
                : 'mr-auto w-fit bg-neutral-100 text-neutral-700'
            }`}
          >
            {message.parts.map((part, index) =>
              part.type === 'text' ? (
                message.role === 'assistant' ? (
                  <Streamdown key={index}>{part.text}</Streamdown>
                ) : (
                  <span key={index}>{part.text}</span>
                )
              ) : null,
            )}
            {message.parts.length === 0 && status === 'streaming' && message.role === 'assistant'
              ? '...'
              : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-neutral-200 px-4 py-3">
        <textarea
          rows={3}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          className="w-full resize-none rounded border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Escribe tu pregunta..."
          disabled={status !== 'ready'}
        />
        <div className="mt-3 flex justify-end">
          {status !== 'ready' && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="rounded border border-neutral-300 px-4 py-2 text-sm"
            >
              Detener
            </button>
          ) : (
            <button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              Enviar
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-red-500">Algo salió mal.</p>}
      </form>
    </div>
  )
}

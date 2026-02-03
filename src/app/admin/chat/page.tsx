'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { Loader } from '@/components/ai-elements/loader'
import { CopyIcon, RefreshCcwIcon } from 'lucide-react'

const SESSION_KEY = 'chat_session_id'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const sessionRef = useRef<string | null>(null)

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: '/api/chat',
      }),
    [],
  )

  const { messages, sendMessage, status, error, regenerate, setMessages } = useChat({
    transport,
  })

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      sessionRef.current = stored
      setSessionId(stored)
      return
    }
    const generated = crypto.randomUUID()
    sessionRef.current = generated
    setSessionId(generated)
    localStorage.setItem(SESSION_KEY, generated)
  }, [])

  const ensureSessionId = () => {
    if (sessionRef.current) return sessionRef.current
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      sessionRef.current = stored
      setSessionId(stored)
      return stored
    }
    const generated = crypto.randomUUID()
    sessionRef.current = generated
    setSessionId(generated)
    localStorage.setItem(SESSION_KEY, generated)
    return generated
  }

  const startNewChat = () => {
    const generated = crypto.randomUUID()
    sessionRef.current = generated
    setSessionId(generated)
    localStorage.setItem(SESSION_KEY, generated)
    setMessages([])
  }

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim()
    if (!text) return
    const stableSessionId = ensureSessionId()
    sendMessage(
      { text },
      {
        body: {
          session_id: stableSessionId,
        },
      },
    )
    setInput('')
  }

  const canSubmit = status === 'ready' && input.trim().length > 0

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Chat</h1>
          <p className="text-sm text-neutral-500">Respuestas al instante para tus preguntas.</p>
        </div>
        <button
          onClick={startNewChat}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
          type="button"
        >
          Nuevo chat
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <Conversation className="flex-1">
          <ConversationContent className="space-y-4 px-4 py-6">
            {messages.length === 0 && (
              <div className="text-sm text-neutral-500">Escribe un mensaje para empezar.</div>
            )}
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, index) => {
                  if (part.type !== 'text') return null
                  return (
                    <Message key={`${message.id}-${index}`} from={message.role}>
                      <MessageContent>
                        <MessageResponse>{part.text}</MessageResponse>
                      </MessageContent>
                      {message.role === 'assistant' && index === message.parts.length - 1 && (
                        <MessageActions>
                          <MessageAction tooltip="Reintentar" onClick={() => regenerate()}>
                            <RefreshCcwIcon className="size-3" />
                          </MessageAction>
                          <MessageAction
                            tooltip="Copiar"
                            onClick={() => navigator.clipboard.writeText(part.text)}
                          >
                            <CopyIcon className="size-3" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </Message>
                  )
                })}
              </div>
            ))}
            {status === 'submitted' && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Loader size={14} /> Pensando...
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-neutral-200 p-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputSubmit status={status} disabled={!canSubmit} />
            </PromptInputFooter>
          </PromptInput>
          {error && <p className="mt-2 text-xs text-red-500">Algo salió mal.</p>}
        </div>
      </div>
    </div>
  )
}

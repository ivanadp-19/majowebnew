import type { UIMessage } from 'ai'

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

const extractLastUserText = (messages: UIMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (message.role !== 'user') continue
    const textParts = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
    return textParts.join('')
  }
  return ''
}

const parseSseChunk = (chunk: string) => {
  const blocks = chunk.split('\n\n')
  const dataLines: string[] = []
  for (const block of blocks) {
    const lines = block.split('\n')
    for (const line of lines) {
      if (line.startsWith('data:')) {
        dataLines.push(line.replace('data:', '').trim())
      }
    }
  }
  return dataLines
}

export async function POST(req: Request) {
  const body = await req.json()
  const messages = (body.messages ?? []) as UIMessage[]
  const sessionId = body.session_id ?? null
  const userId = body.user_id ?? null
  const message = extractLastUserText(messages)

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id: userId,
    }),
  })

  if (!response.ok || !response.body) {
    return new Response('Upstream chat failed.', { status: 502 })
  }

  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true })
      if (!buffer.includes('\n\n')) return
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        for (const data of parseSseChunk(part)) {
          if (!data || data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const text =
              parsed.delta ??
              parsed.token ??
              parsed.message ??
              parsed.content ??
              parsed.response ??
              parsed.text ??
              ''
            if (text) controller.enqueue(encoder.encode(String(text)))
          } catch {
            controller.enqueue(encoder.encode(data))
          }
        }
      }
    },
    flush(controller) {
      if (!buffer.trim()) return
      for (const data of parseSseChunk(buffer)) {
        if (!data || data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const text =
            parsed.delta ??
            parsed.token ??
            parsed.message ??
            parsed.content ??
            parsed.response ??
            parsed.text ??
            ''
          if (text) controller.enqueue(encoder.encode(String(text)))
        } catch {
          controller.enqueue(encoder.encode(data))
        }
      }
    },
  })

  const readable = response.body.pipeThrough(transform)

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

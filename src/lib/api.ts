export type Meal = {
  id: string
  name: string
  ingredients: string[]
  notes?: string
}

export type MealInput = Omit<Meal, 'id'> & { id?: string }

export type MealsPage = {
  items: Meal[]
  next_cursor?: number | string | null
}

export type MealSearchParams = {
  must_include?: string[]
  exclude?: string[]
  max_calories?: number
  min_protein?: number
  meal_type?: string
  q?: string
  limit?: number
  cursor?: number | string | null
}

export type IngestJob = {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  summary?: string
  error?: string
  result?: unknown
}

export type ChatStreamEvent = {
  event?: string
  data: string
}

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const buildUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

const ensureOk = async (response: Response) => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }
}

export const fetchMeals = async (params?: { limit?: number; cursor?: number | string | null }) => {
  const url = new URL(buildUrl('/meals'))
  if (params?.limit) url.searchParams.set('limit', String(params.limit))
  if (params?.cursor !== undefined && params?.cursor !== null) {
    url.searchParams.set('cursor', String(params.cursor))
  }
  const response = await fetch(url.toString())
  await ensureOk(response)
  return (await response.json()) as MealsPage
}

export const searchMeals = async (params?: MealSearchParams) => {
  const response = await fetch(buildUrl('/meals/search'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(params ?? {}),
  })
  await ensureOk(response)
  return (await response.json()) as MealsPage
}

export const createMeal = async (payload: MealInput) => {
  const response = await fetch(buildUrl('/meals'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })
  await ensureOk(response)
  return (await response.json()) as Meal
}

export const updateMeal = async (mealId: string, payload: MealInput) => {
  const response = await fetch(buildUrl(`/meals/${mealId}`), {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })
  await ensureOk(response)
  return (await response.json()) as Meal
}

export const deleteMeal = async (mealId: string) => {
  const response = await fetch(buildUrl(`/meals/${mealId}`), {
    method: 'DELETE',
  })
  await ensureOk(response)
}

export const uploadPdf = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(buildUrl('/ingest'), {
    method: 'POST',
    body: formData,
  })
  await ensureOk(response)
  return (await response.json()) as IngestJob
}

export const pollJob = async (jobId: string) => {
  const response = await fetch(buildUrl(`/ingest/${jobId}`))
  await ensureOk(response)
  return (await response.json()) as IngestJob
}

const parseSseChunk = (chunk: string): ChatStreamEvent[] => {
  const events: ChatStreamEvent[] = []
  const blocks = chunk.split('\n\n')
  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trimEnd())
    let event: string | undefined
    const dataLines: string[] = []
    for (const line of lines) {
      if (!line) continue
      if (line.startsWith('event:')) {
        event = line.replace('event:', '').trim()
        continue
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.replace('data:', '').trim())
      }
    }
    if (dataLines.length) {
      events.push({ event, data: dataLines.join('\n') })
    }
  }
  return events
}

export const streamChat = async (options: {
  message: string
  sessionId?: string
  onEvent: (event: ChatStreamEvent) => void
  signal?: AbortSignal
}) => {
  const response = await fetch(buildUrl('/chat'), {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      message: options.message,
      session_id: options.sessionId,
    }),
    signal: options.signal,
  })

  await ensureOk(response)
  if (!response.body) {
    throw new Error('Streaming response not available.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    if (!buffer.includes('\n\n')) continue
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      const events = parseSseChunk(part)
      for (const event of events) {
        options.onEvent(event)
      }
    }
  }

  if (buffer.trim()) {
    const events = parseSseChunk(buffer)
    for (const event of events) {
      options.onEvent(event)
    }
  }
}

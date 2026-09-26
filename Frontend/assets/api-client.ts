/**
 * Typed API client — drop-in starting point.
 *
 * Adapt to the project's conventions rather than pasting verbatim. The parts
 * that are load-bearing, and why:
 *
 *  - The token is fetched per request. Clerk session tokens are short-lived;
 *    a token captured once produces intermittent 401s that look like a backend
 *    fault.
 *  - The token is never stored. Not in a module variable, ref, state,
 *    localStorage, or a URL.
 *  - Every failure normalizes to one ApiError, so call sites can branch.
 *  - Responses are schema-parsed at the boundary, so contract drift fails here
 *    rather than three components deep.
 *  - Only idempotent requests retry, and only on transient failures.
 *
 * Requires: zod (or swap parse() for your validator of choice).
 */

import { z } from 'zod'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
if (!BASE_URL) throw new Error('NEXT_PUBLIC_API_URL is not configured')

const DEFAULT_TIMEOUT_MS = 15_000
const RETRYABLE_STATUS = new Set([429, 502, 503, 504])
const MAX_RETRIES = 2

/** The single error shape every endpoint returns. */
export const ApiErrorBody = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** Not signed in — send the user to sign-in. */
  get isUnauthenticated() {
    return this.status === 401
  }

  /** Signed in but not entitled — this is the only case that shows an upgrade path. */
  get isPlanRequired() {
    return this.status === 403 && this.code === 'PLAN_REQUIRED'
  }

  /** Signed in, not permitted, and upgrading would not help. */
  get isForbidden() {
    return this.status === 403 && this.code !== 'PLAN_REQUIRED'
  }
}

type RequestOptions<T> = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  schema: z.ZodType<T>
  signal?: AbortSignal
  timeoutMs?: number
  /** Stable across retries of one intent; never regenerated per attempt. */
  idempotencyKey?: string
  /** Returns a fresh token. Pass Clerk's getToken; omit for public endpoints. */
  getToken?: () => Promise<string | null>
}

export async function request<T>(
  path: string,
  { method = 'GET', body, schema, signal, timeoutMs = DEFAULT_TIMEOUT_MS, idempotencyKey, getToken }: RequestOptions<T>,
): Promise<T> {
  const isIdempotent = method === 'GET' || Boolean(idempotencyKey)
  let lastError: unknown

  for (let attempt = 0; attempt <= (isIdempotent ? MAX_RETRIES : 0); attempt++) {
    const timeout = new AbortController()
    const timer = setTimeout(() => timeout.abort(), timeoutMs)
    const composed = signal ? AbortSignal.any([signal, timeout.signal]) : timeout.signal

    try {
      // Fetched here, on every attempt, deliberately. Do not hoist.
      const token = await getToken?.()

      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        signal: composed,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!res.ok) {
        const err = await toApiError(res)
        // Retry only transient failures, and only when it is safe to repeat.
        if (isIdempotent && RETRYABLE_STATUS.has(res.status) && attempt < MAX_RETRIES) {
          lastError = err
          await backoff(attempt, res.headers.get('Retry-After'))
          continue
        }
        throw err
      }

      // 204 has no body — the endpoint's schema must accept undefined (z.void()).
      if (res.status === 204) return schema.parse(undefined)

      // The backend is still untrusted input to the client. Fail loudly here.
      return schema.parse(await res.json())
    } catch (err) {
      if (err instanceof ApiError) throw err
      if (signal?.aborted) throw err // caller cancelled — do not retry
      if (attempt < MAX_RETRIES && isIdempotent) {
        lastError = err
        await backoff(attempt, null)
        continue
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError
}

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const parsed = ApiErrorBody.parse(await res.json())
    return new ApiError(res.status, parsed.error.code, parsed.error.message, parsed.error.details)
  } catch {
    // Never surface a raw body or status text to the user.
    return new ApiError(res.status, 'UNKNOWN', 'Something went wrong. Please try again.')
  }
}

function backoff(attempt: number, retryAfter: string | null): Promise<void> {
  const header = retryAfter ? Number(retryAfter) * 1000 : NaN
  // Exponential with jitter — synchronised retries turn a degraded backend into a down one.
  const delay = Number.isFinite(header) ? header : 2 ** attempt * 300 + Math.random() * 300
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/* ------------------------------------------------------------------ *
 * Per-resource wrappers own their schemas.
 * ------------------------------------------------------------------ */

export const Report = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string().datetime(),
  ownerId: z.string(),
})
export type Report = z.infer<typeof Report>

export const ReportPage = z.object({
  data: z.array(Report),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  }),
})

export const reports = {
  list: (getToken: () => Promise<string | null>, page = 1) =>
    request(`/api/v1/reports?page=${page}&pageSize=20`, { schema: ReportPage, getToken }),

  create: (getToken: () => Promise<string | null>, input: { title: string }, idempotencyKey: string) =>
    request('/api/v1/reports', {
      method: 'POST',
      body: input,
      schema: Report,
      idempotencyKey, // derived from the intent by the caller, e.g. `report:v1:${draftId}`
      getToken,
    }),
}

/* ------------------------------------------------------------------ *
 * Client-side usage
 *
 *   'use client'
 *   import { useAuth } from '@clerk/nextjs'
 *
 *   export function useReports() {
 *     const { getToken } = useAuth()
 *     return useQuery({
 *       queryKey: ['reports'],
 *       queryFn: () => reports.list(getToken),
 *     })
 *   }
 *
 * Server-side, pass getToken from `await auth()` instead.
 * ------------------------------------------------------------------ */

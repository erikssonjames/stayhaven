export const ACTOR_USER_ID_HEADER = "X-Actor-User-Id"

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  message: string | null
}

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  actorUserId?: string | null
  body?: unknown
  headers?: HeadersInit
}

export class ApiError extends Error {
  readonly status: number
  readonly response: unknown

  constructor(message: string, status: number, response: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.response = response
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

export async function apiRequest<T>(
  path: string,
  { actorUserId, body, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers)
  requestHeaders.set("Accept", "application/json")

  if (actorUserId) {
    requestHeaders.set(ACTOR_USER_ID_HEADER, actorUserId)
  }

  const requestInit: RequestInit = {
    cache: "no-store",
    ...init,
    headers: requestHeaders,
  }

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json")
    requestInit.body = JSON.stringify(body)
  }

  const response = await fetch(toApiUrl(path), requestInit)
  const payload = await parseResponse<T>(response)

  if (!response.ok || !payload.success) {
    throw new ApiError(
      payload.message ?? `Request failed with status ${response.status}.`,
      response.status,
      payload,
    )
  }

  return payload.data as T
}

function toApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text()

  if (!text) {
    return { success: response.ok, data: null, message: null }
  }

  try {
    return JSON.parse(text) as ApiResponse<T>
  } catch {
    return {
      success: false,
      data: null,
      message: text,
    }
  }
}

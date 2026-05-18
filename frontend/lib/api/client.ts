export const AUTH_TOKEN_STORAGE_KEY = "stayhaven.authToken"

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
  { actorUserId: _actorUserId, body, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers)
  requestHeaders.set("Accept", "application/json")

  const authToken = getStoredAuthToken()
  if (authToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${authToken}`)
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

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function storeAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    window.location.href = "/sign-in"
  }
}

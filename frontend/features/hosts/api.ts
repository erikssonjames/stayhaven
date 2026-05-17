import { apiRequest, type ApiRequestOptions } from "@/lib/api/client"

export type Host = {
  id: string
  userId: string
  displayName: string
  bio: string | null
}

export type CreateHostRequest = {
  userId: string
  displayName: string
  bio?: string | null
}

export function getHost(hostId: string, options?: ApiRequestOptions) {
  return apiRequest<Host>(`/api/hosts/${hostId}`, options)
}

export function createHost(request: CreateHostRequest, options?: ApiRequestOptions) {
  return apiRequest<Host>("/api/hosts", {
    ...options,
    method: "POST",
    body: request,
  })
}

export function acceptHost(hostId: string, options?: ApiRequestOptions) {
  return apiRequest<Host>(`/api/hosts/${hostId}/accept`, {
    ...options,
    method: "PUT",
  })
}

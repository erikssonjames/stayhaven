import { apiRequest, type ApiRequestOptions } from "@/lib/api/client"

export type UserRole = "USER" | "HOST" | "ADMIN" | "SUPERADMIN"

export type User = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
}

export type CreateUserRequest = {
  email: string
  firstName?: string | null
  lastName?: string | null
}

export type UpdateUserRequest = CreateUserRequest

export function getUser(userId: string, options?: ApiRequestOptions) {
  return apiRequest<User>(`/api/users/${userId}`, options)
}

export function createUser(request: CreateUserRequest, options?: ApiRequestOptions) {
  return apiRequest<User>("/api/users", {
    ...options,
    method: "POST",
    body: request,
  })
}

export function updateUser(
  userId: string,
  request: UpdateUserRequest,
  options?: ApiRequestOptions,
) {
  return apiRequest<User>(`/api/users/${userId}`, {
    ...options,
    method: "PUT",
    body: request,
  })
}

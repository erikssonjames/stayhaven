import { apiRequest } from "@/lib/api/client"
import type { User } from "@/features/users/api"

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  token: string
  user: User
}

export function login(request: LoginRequest) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: request,
  })
}

export function getCurrentUser() {
  return apiRequest<User>("/api/auth/me")
}

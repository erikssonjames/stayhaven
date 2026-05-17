"use client"

import type { ReactNode } from "react"

import { type UserRole } from "@/features/users/api"
import { useCurrentRole } from "@/features/auth/use-current-role"

type RoleGuardProps = {
  allowedRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
  userId?: string | null
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
  loadingFallback = null,
  userId,
}: RoleGuardProps) {
  const { hasRole, isLoading } = useCurrentRole({ userId })

  if (isLoading) {
    return loadingFallback
  }

  if (!hasRole(allowedRoles)) {
    return fallback
  }

  return children
}

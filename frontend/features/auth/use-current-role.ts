"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { ACTOR_STORAGE_KEY } from "@/features/auth/demo-actors"
import { getUser, type UserRole } from "@/features/users/api"

type UseCurrentRoleOptions = {
  userId?: string | null
}

export function useCurrentRole(options: UseCurrentRoleOptions = {}) {
  const queryClient = useQueryClient()
  const [storedUserId, setStoredUserId] = useState<string | null>(() => {
    if (options.userId !== undefined) {
      return options.userId
    }

    if (typeof window === "undefined") {
      return null
    }

    return window.localStorage.getItem(ACTOR_STORAGE_KEY)
  })

  const actorUserId = options.userId ?? storedUserId
  const currentUserQuery = useQuery({
    queryKey: ["current-user", actorUserId],
    queryFn: () => getUser(actorUserId as string, { actorUserId }),
    enabled: Boolean(actorUserId),
  })

  const setActorUserId = useCallback(
    (nextUserId: string | null) => {
      setStoredUserId(nextUserId)

      if (typeof window !== "undefined") {
        if (nextUserId) {
          window.localStorage.setItem(ACTOR_STORAGE_KEY, nextUserId)
        } else {
          window.localStorage.removeItem(ACTOR_STORAGE_KEY)
        }
      }

      void queryClient.invalidateQueries({ queryKey: ["current-user"] })
    },
    [queryClient],
  )

  return useMemo(
    () => ({
      user: actorUserId ? (currentUserQuery.data ?? null) : null,
      userId: actorUserId,
      role: actorUserId ? (currentUserQuery.data?.role ?? null) : null,
      isAuthenticated: Boolean(actorUserId && currentUserQuery.data),
      isLoading: actorUserId ? currentUserQuery.isLoading : false,
      error: actorUserId && currentUserQuery.error instanceof Error ? currentUserQuery.error : null,
      setActorUserId,
      hasRole: (roles: UserRole | UserRole[]) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles]
        return Boolean(actorUserId && currentUserQuery.data?.role && allowedRoles.includes(currentUserQuery.data.role))
      },
    }),
    [actorUserId, currentUserQuery.data, currentUserQuery.error, currentUserQuery.isLoading, setActorUserId],
  )
}

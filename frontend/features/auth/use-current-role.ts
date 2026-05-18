"use client"

import { createContext, createElement, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getCurrentUser } from "@/features/auth/api"
import { AUTH_TOKEN_STORAGE_KEY, clearAuthToken, getStoredAuthToken, storeAuthToken } from "@/lib/api/client"
import { type User, type UserRole } from "@/features/users/api"

type UseCurrentRoleOptions = {
  userId?: string | null
}

type CurrentRoleContextValue = {
  user: User | null
  userId: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  setAuthToken: (nextToken: string | null, user?: User) => void
  setActorUserId: (nextUserId: string | null) => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

const CurrentRoleContext = createContext<CurrentRoleContextValue | null>(null)

export function CurrentRoleProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [authToken, setAuthTokenState] = useState<string | null>(() => getStoredAuthToken())

  const currentUserQuery = useQuery({
    queryKey: ["current-user", authToken],
    queryFn: getCurrentUser,
    enabled: Boolean(authToken),
  })

  const setAuthToken = useCallback(
    (nextToken: string | null, user?: User) => {
      setAuthTokenState(nextToken)

      if (nextToken) {
        storeAuthToken(nextToken)
        if (user) {
          queryClient.setQueryData(["current-user", nextToken], user)
        }
      } else {
        clearAuthToken()
        queryClient.removeQueries({ queryKey: ["current-user"] })
      }

      void queryClient.invalidateQueries({ queryKey: ["current-user"] })
    },
    [queryClient],
  )

  useEffect(() => {
    function syncAuthToken(event: StorageEvent) {
      if (event.key === AUTH_TOKEN_STORAGE_KEY) {
        setAuthTokenState(event.newValue)
        void queryClient.invalidateQueries({ queryKey: ["current-user"] })
      }
    }

    window.addEventListener("storage", syncAuthToken)
    return () => window.removeEventListener("storage", syncAuthToken)
  }, [queryClient])

  const value = useMemo(
    () => ({
      user: authToken ? (currentUserQuery.data ?? null) : null,
      userId: currentUserQuery.data?.id ?? null,
      role: authToken ? (currentUserQuery.data?.role ?? null) : null,
      isAuthenticated: Boolean(authToken && currentUserQuery.data),
      isLoading: authToken ? currentUserQuery.isLoading : false,
      error: authToken && currentUserQuery.error instanceof Error ? currentUserQuery.error : null,
      setAuthToken,
      setActorUserId: () => setAuthToken(null),
      hasRole: (roles: UserRole | UserRole[]) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles]
        return Boolean(authToken && currentUserQuery.data?.role && allowedRoles.includes(currentUserQuery.data.role))
      },
    }),
    [authToken, currentUserQuery.data, currentUserQuery.error, currentUserQuery.isLoading, setAuthToken],
  )

  return createElement(CurrentRoleContext.Provider, { value }, children)
}

export function useCurrentRole(options: UseCurrentRoleOptions = {}) {
  const context = useContext(CurrentRoleContext)

  if (!context) {
    throw new Error("useCurrentRole must be used within CurrentRoleProvider.")
  }

  return useMemo(
    () => ({
      ...context,
      userId: context.userId ?? options.userId ?? null,
    }),
    [context, options.userId],
  )
}

"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { CurrentRoleProvider } from "@/features/auth/use-current-role"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <CurrentRoleProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </CurrentRoleProvider>
    </QueryClientProvider>
  )
}

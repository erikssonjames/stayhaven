"use client"

import Link from "next/link"
import { ArrowRight, SignOut } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useCurrentRole } from "@/features/auth/use-current-role"

export function DashboardIndex() {
  const { user, role, isLoading, error, setActorUserId } = useCurrentRole()

  if (isLoading) {
    return <DashboardFrame title="Loading dashboard" subtitle="Checking your demo session." />
  }

  if (!user || !role) {
    return (
      <DashboardFrame
        title={error ? "Session unavailable" : "Sign in required"}
        subtitle={
          error
            ? "The frontend could not load your account from the API gateway."
            : "Sign in with your email and password to route into the right workspace."
        }
      >
        <Button asChild>
          <Link href="/sign-in">
            Go to sign in
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </DashboardFrame>
    )
  }

  return (
    <DashboardFrame
      title={`Welcome back, ${user.firstName ?? "there"}`}
      subtitle="Your current role determines which workspace is available."
    >
      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={() => setActorUserId(null)}>
          <SignOut data-icon="inline-start" />
          Sign out
        </Button>
      </div>
    </DashboardFrame>
  )
}

function DashboardFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children?: React.ReactNode
}) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <p className="text-sm font-semibold uppercase text-primary">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  )
}

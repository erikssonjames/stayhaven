"use client"

import Link from "next/link"
import { ArrowRight, SignOut } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useCurrentRole } from "@/features/auth/use-current-role"
import { demoActors, rolePath } from "@/features/auth/demo-actors"
import { cn } from "@/lib/utils"

export function DashboardIndex() {
  const { user, role, isLoading, error, setActorUserId } = useCurrentRole()

  if (isLoading) {
    return <DashboardFrame title="Loading dashboard" subtitle="Checking your demo session." />
  }

  if (!user || !role) {
    return (
      <DashboardFrame
        title={error ? "Backend session unavailable" : "Choose a demo role"}
        subtitle={
          error
            ? "The frontend could not load the signed-in actor from the API gateway."
            : "Sign in with a seeded account to route into the right workspace."
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
      <div className="grid gap-3 sm:grid-cols-2">
        {demoActors.map((actor) => {
          const isCurrent = actor.role === role

          return (
            <Link
              key={actor.role}
              href={rolePath(actor.role)}
              className={cn(
                "border bg-card p-4 text-card-foreground transition hover:bg-muted",
                isCurrent && "border-ring ring-1 ring-ring",
              )}
            >
              <span className="text-xs font-semibold text-primary">{actor.role}</span>
              <span className="mt-2 block text-lg font-semibold">{actor.role.toLowerCase()} dashboard</span>
              <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                {isCurrent ? "Available for your signed-in demo role." : "Sign in as this role to unlock."}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href={rolePath(role)}>
            Open current workspace
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
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

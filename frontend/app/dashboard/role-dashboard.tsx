"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  ChartLineUp,
  HouseLine,
  ShieldCheck,
  UserCircle,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCurrentRole } from "@/features/auth/use-current-role"
import type { UserRole } from "@/features/users/api"

type DashboardConfig = {
  eyebrow: string
  title: string
  subtitle: string
  stats: Array<{ label: string; value: string }>
  actions: Array<{ label: string; detail: string; icon: typeof CalendarCheck }>
}

const dashboardConfig: Record<UserRole, DashboardConfig> = {
  USER: {
    eyebrow: "Guest workspace",
    title: "Plan, book, and track dependable stays.",
    subtitle: "Guests get booking status, dates, payment context, and support handoffs in one place.",
    stats: [
      { label: "Upcoming stays", value: "1" },
      { label: "Saved homes", value: "6" },
      { label: "Open tasks", value: "2" },
    ],
    actions: [
      { label: "Review booking", detail: "Harbor Loft, confirmed in two weeks.", icon: CalendarCheck },
      { label: "Update profile", detail: "Keep contact details and preferences fresh.", icon: UserCircle },
      { label: "Explore rentals", detail: "Find verified homes for your next trip.", icon: HouseLine },
    ],
  },
  HOST: {
    eyebrow: "Host workspace",
    title: "Keep properties, bookings, and revenue moving.",
    subtitle: "Hosts can manage listings, watch reservations, and prepare guest-ready operations.",
    stats: [
      { label: "Active rentals", value: "1" },
      { label: "Occupancy", value: "82%" },
      { label: "Monthly revenue", value: "$4.8k" },
    ],
    actions: [
      { label: "Manage rentals", detail: "Refresh rates, descriptions, and readiness.", icon: HouseLine },
      { label: "Confirm arrivals", detail: "Prepare stays that need host attention.", icon: CalendarCheck },
      { label: "Review payouts", detail: "Track captured and pending payments.", icon: Wallet },
    ],
  },
  ADMIN: {
    eyebrow: "Admin workspace",
    title: "Operate the marketplace with clear controls.",
    subtitle: "Admins can review hosts, resolve user issues, and monitor core platform activity.",
    stats: [
      { label: "Users", value: "4" },
      { label: "Hosts", value: "1" },
      { label: "Bookings", value: "1" },
    ],
    actions: [
      { label: "Review hosts", detail: "Accept or follow up on pending host profiles.", icon: ShieldCheck },
      { label: "Manage users", detail: "Inspect account status and support requests.", icon: UsersThree },
      { label: "Watch bookings", detail: "Find reservations needing operational help.", icon: CalendarCheck },
    ],
  },
  SUPERADMIN: {
    eyebrow: "Superadmin workspace",
    title: "Full-platform visibility and permission control.",
    subtitle: "Superadmins can oversee admins, payments, permissions, and platform-wide records.",
    stats: [
      { label: "Permissions", value: "14" },
      { label: "Admin seats", value: "2" },
      { label: "Payment states", value: "8" },
    ],
    actions: [
      { label: "Manage admins", detail: "Grant and audit elevated access.", icon: ShieldCheck },
      { label: "Payment review", detail: "Inspect provider status and ledger events.", icon: Wallet },
      { label: "Platform health", detail: "Watch system-level operational trends.", icon: ChartLineUp },
    ],
  },
}

export function RoleDashboard({ expectedRole }: { expectedRole: UserRole }) {
  const { user, role, isLoading, error } = useCurrentRole()
  const config = dashboardConfig[expectedRole]
  const hasAccess = role === expectedRole

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {isLoading ? (
          <StatePanel title="Loading workspace" text="Checking your seeded demo account." />
        ) : !user || error ? (
          <StatePanel
            title={error ? "Backend session unavailable" : "Sign in required"}
            text={
              error
                ? "The dashboard requires the API gateway to return the selected seeded actor."
                : "Choose a demo account before opening this dashboard."
            }
          >
            <Button asChild>
              <Link href="/sign-in">
                Go to sign in
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </StatePanel>
        ) : !hasAccess ? (
          <StatePanel
            title="Role route locked"
            text={`You are signed in as ${role?.toLowerCase()}, so this ${expectedRole.toLowerCase()} route is read-protected.`}
          >
            <Button asChild>
              <Link href={`/dashboard/${role?.toLowerCase()}`}>
                Open your dashboard
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </StatePanel>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-primary">{config.eyebrow}</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                  {config.title}
                </h1>
                <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">{config.subtitle}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {config.stats.map((stat) => (
                  <Card key={stat.label} className="p-5">
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                  <div>
                    <h2 className="text-xl font-semibold">Priority actions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Role-specific work for {user.firstName ?? user.email}.</p>
                  </div>
                  <ChartLineUp className="size-6 text-primary" weight="duotone" />
                </CardHeader>
                <CardContent className="grid gap-3 p-6">
                  {config.actions.map((action) => (
                    <article key={action.label} className="flex gap-4 border p-4">
                      <action.icon className="mt-1 size-5 shrink-0 text-primary" weight="duotone" />
                      <div>
                        <h3 className="font-semibold">{action.label}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{action.detail}</p>
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <p className="text-sm font-semibold uppercase text-primary">Signed in as</p>
                  <p className="mt-3 text-2xl font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
                </CardHeader>
                <CardContent>
                  <p className="border-t pt-6 text-sm leading-6 text-muted-foreground">
                    Requests from this browser include the seeded actor ID, allowing backend role checks
                    to exercise USER, HOST, ADMIN, and SUPERADMIN permissions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

function StatePanel({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <Card className="p-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{text}</p>
      <div className="mt-6">{children}</div>
    </Card>
  )
}

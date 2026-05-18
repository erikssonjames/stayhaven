"use client"

import Link from "next/link"
import { ArrowRight, Bell, GlobeHemisphereWest, ShieldCheck, UserCircle } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCurrentRole } from "@/features/auth/use-current-role"

export default function SettingsPage() {
  const { user, role, isLoading, error } = useCurrentRole()

  if (isLoading) {
    return <SettingsFrame title="Loading settings" subtitle="Checking the current demo actor." />
  }

  if (!user || !role) {
    return (
      <SettingsFrame
        title={error ? "Settings unavailable" : "Sign in to view settings"}
        subtitle={
          error
            ? "The API gateway could not return the selected actor."
            : "Settings are available after choosing one of the seeded demo accounts."
        }
      >
        <Button asChild>
          <Link href="/sign-in">
            Sign in
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </SettingsFrame>
    )
  }

  return (
    <SettingsFrame title="Account settings" subtitle="Profile and preference controls for the signed-in demo user.">
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6">
          <UserCircle className="size-10 text-primary" weight="duotone" />
          <h2 className="mt-4 text-2xl font-semibold">
            {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          <Badge className="mt-5" variant="secondary">
            {role.toLowerCase()}
          </Badge>
        </Card>

        <section className="grid gap-3">
          <SettingCard
            icon={GlobeHemisphereWest}
            title="Locale and timezone"
            text="Europe/Stockholm is seeded for the demo accounts and used for travel-facing dates."
          />
          <SettingCard
            icon={Bell}
            title="Email preferences"
            text="Marketing and operational email flags are stored in the user settings table."
          />
          <SettingCard
            icon={ShieldCheck}
            title="Role access"
            text="Navigation and dashboards use the current role returned by the API gateway."
          />
        </section>
      </div>
    </SettingsFrame>
  )
}

function SettingsFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children?: React.ReactNode
}) {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <p className="text-sm font-semibold uppercase text-primary">Settings</p>
        <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  )
}

function SettingCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof GlobeHemisphereWest
  title: string
  text: string
}) {
  return (
    <Card className="flex gap-4 p-5">
      <Icon className="mt-1 size-5 shrink-0 text-primary" weight="duotone" />
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 leading-7 text-muted-foreground">{text}</p>
      </div>
    </Card>
  )
}

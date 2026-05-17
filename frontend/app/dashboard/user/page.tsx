"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, CalendarBlank, HouseLine, SignIn } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCurrentRole } from "@/features/auth/use-current-role"
import { getUpcomingBookings, type BookingStatus, type UpcomingBooking } from "@/features/bookings/api"
import { formatCurrency, nightsBetween } from "@/features/rentals/catalog"
import { cn } from "@/lib/utils"

export default function UserDashboardPage() {
  const { user, role, userId, isLoading, error } = useCurrentRole()
  const bookingsQuery = useQuery({
    queryKey: ["upcoming-bookings", userId],
    queryFn: () => getUpcomingBookings({ actorUserId: userId }),
    enabled: Boolean(userId && role === "USER"),
  })

  if (isLoading) {
    return <StatePanel title="Loading bookings" text="Checking your Stayhaven account." />
  }

  if (!user || error) {
    return (
      <StatePanel
        title={error ? "Backend session unavailable" : "Sign in required"}
        text={
          error
            ? "The dashboard needs the API gateway to return the selected seeded actor."
            : "Choose a guest account before opening upcoming bookings."
        }
      >
        <Button asChild>
          <Link href="/sign-in">
            <SignIn data-icon="inline-start" />
            Go to sign in
          </Link>
        </Button>
      </StatePanel>
    )
  }

  if (role !== "USER") {
    return (
      <StatePanel
        title="Guest dashboard locked"
        text={`You are signed in as ${role?.toLowerCase()}, so this guest dashboard is read-protected.`}
      >
        <Button asChild>
          <Link href={`/dashboard/${role?.toLowerCase()}`}>
            Open your dashboard
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </StatePanel>
    )
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Upcoming bookings</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">Your stays</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Real reservations for {user.firstName ?? user.email}, sorted by check-in date.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/rentals">
              <HouseLine data-icon="inline-start" />
              Browse rentals
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          {bookingsQuery.isLoading ? (
            <BookingSkeleton />
          ) : bookingsQuery.error instanceof Error ? (
            <MessageCard title="Bookings unavailable" text={bookingsQuery.error.message} />
          ) : bookingsQuery.data && bookingsQuery.data.length > 0 ? (
            <div className="grid gap-4">
              {bookingsQuery.data.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyBookings />
          )}
        </div>
      </section>
    </main>
  )
}

function BookingCard({ booking }: { booking: UpcomingBooking }) {
  const nights = nightsBetween(booking.checkIn, booking.checkOut)
  const estimatedTotal = booking.pricePerNight * nights

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusClassName(booking.status)} variant="outline">
              {formatStatus(booking.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">{booking.hostName}</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold">{booking.listingName}</h2>
        </div>
        <Button asChild variant="outline">
          <Link href={`/rentals/${booking.listingId}`}>
            View rental
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:grid-cols-3">
        <BookingFact label="Check-in" value={formatDate(booking.checkIn)} />
        <BookingFact label="Check-out" value={formatDate(booking.checkOut)} />
        <BookingFact
          label={`${nights} ${nights === 1 ? "night" : "nights"}`}
          value={formatCurrency(estimatedTotal)}
        />
      </CardContent>
    </Card>
  )
}

function BookingFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <CalendarBlank className="mt-0.5 size-5 shrink-0 text-primary" weight="duotone" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </div>
    </div>
  )
}

function EmptyBookings() {
  return (
    <MessageCard
      icon={<CalendarBlank className="size-8 text-primary" weight="duotone" />}
      title="No upcoming bookings"
      text="Once you reserve a Stayhaven rental, it will appear here with dates, host, and status."
    >
      <Button asChild className="mt-6">
        <Link href="/rentals">
          Find a stay
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    </MessageCard>
  )
}

function MessageCard({
  title,
  text,
  icon,
  children,
}: {
  title: string
  text: string
  icon?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Card className="p-8">
      {icon}
      <h2 className={cn("text-2xl font-semibold", icon && "mt-5")}>{title}</h2>
      <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text}</p>
      {children}
    </Card>
  )
}

function BookingSkeleton() {
  return (
    <div className="grid gap-4">
      {[0, 1].map((item) => (
        <Card key={item} className="p-5">
          <div className="h-5 w-32 animate-pulse bg-muted" />
          <div className="mt-4 h-8 w-72 max-w-full animate-pulse bg-muted" />
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="h-12 animate-pulse bg-muted" />
            <div className="h-12 animate-pulse bg-muted" />
            <div className="h-12 animate-pulse bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function StatePanel({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background px-5 py-8 text-foreground sm:px-8">
      <Card className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text}</p>
        <div className="mt-6">{children}</div>
      </Card>
    </main>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatStatus(status: BookingStatus) {
  return status.toLowerCase().replace("_", " ")
}

function statusClassName(status: BookingStatus) {
  return cn(
    status === "CONFIRMED" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-700",
    status === "RESERVED" && "border-sky-500/50 bg-sky-500/10 text-sky-700",
    status === "REQUESTED" && "border-amber-500/50 bg-amber-500/10 text-amber-700",
  )
}

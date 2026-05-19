"use client"

import Link from "next/link"
import { useMutation, UseMutationResult, useQuery } from "@tanstack/react-query"
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  HouseLineIcon,
  SignInIcon
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCurrentRole } from "@/features/auth/use-current-role"
import { cancelBooking, getUpcomingBookings, type BookingStatus, type UpcomingBooking } from "@/features/bookings/api"
import { formatCurrency, nightsBetween } from "@/features/rentals/catalog"
import type { UserRole } from "@/features/users/api"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { user, role, userId, isLoading, error } = useCurrentRole()
  const canShowBookings = role === "USER" || role === "HOST"
  const bookingsQuery = useQuery({
    queryKey: ["upcoming-bookings", role, userId],
    queryFn: () => getUpcomingBookings({ actorUserId: userId }),
    enabled: Boolean(userId && canShowBookings),
  })

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking cancelled")
      bookingsQuery.refetch()
    },
  })

  if (isLoading) {
    return <StatePanel title="Loading dashboard" text="Checking your Stayhaven account." />
  }

  if (!user || error || !role) {
    return (
      <StatePanel
        title={error ? "Backend session unavailable" : "Sign in required"}
        text={
          error
            ? "The dashboard needs the API gateway to return the selected account."
            : "Sign in to open the workspace for your role."
        }
      >
        <Button asChild>
          <Link href="/sign-in">
            <SignInIcon data-icon="inline-start" />
            Go to sign in
          </Link>
        </Button>
      </StatePanel>
    )
  }

  if (role === "HOST") {
    return (
      <HostDashboard
        firstName={user.firstName ?? user.email}
        bookings={bookingsQuery.data ?? []}
        isLoadingBookings={bookingsQuery.isLoading}
        bookingsError={bookingsQuery.error instanceof Error ? bookingsQuery.error : null}
      />
    )
  }

  if (role !== "USER") {
    return <RoleDashboard role={role} firstName={user.firstName ?? user.email} />
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Guest dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">Your stays</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Real reservations for {user.firstName ?? user.email}, sorted by check-in date.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/rentals">
              <HouseLineIcon data-icon="inline-start" />
              Browse rentals
            </Link>
          </Button>
        </div>

        <BookingList
          bookings={bookingsQuery.data ?? []}
          isLoading={bookingsQuery.isLoading}
          error={bookingsQuery.error instanceof Error ? bookingsQuery.error : null}
          cancelBooking={cancelBookingMutation}
        />
      </section>
    </main>
  )
}

function HostDashboard({
  bookings,
  isLoadingBookings,
  bookingsError,
}: {
  firstName: string
  bookings: UpcomingBooking[]
  isLoadingBookings: boolean
  bookingsError: Error | null
}) {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Rental bookings</h2>
              <p className="mt-2 text-muted-foreground">Upcoming reservations made on your rentals.</p>
            </div>
          </div>
          <BookingList
            bookings={bookings}
            isLoading={isLoadingBookings}
            error={bookingsError}
            emptyTitle="No rental bookings"
            emptyText="Confirmed guest reservations on your rentals will appear here with stay dates and status."
            canCancel={false}
          />
        </div>
      </section>
    </main>
  )
}

function RoleDashboard({ firstName }: { role: Exclude<UserRole, "USER">; firstName: string }) {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="border-b pb-6">
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Welcome back, {firstName}.
          </p>
        </div>
      </section>
    </main>
  )
}

function BookingCard({
  booking,
  cancelBooking,
  canCancel = true,
}: {
  booking: UpcomingBooking
  cancelBooking?: UseMutationResult<unknown, Error, string, unknown>
  canCancel?: boolean
}) {
  const nights = nightsBetween(booking.checkIn, booking.checkOut)
  const estimatedTotal = booking.pricePerNight * nights

  const { mutate: cancelBookingMutate, isPending } = cancelBooking ?? {}

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
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/rentals/${booking.listingId}`}>
              View rental
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>

          {canCancel && cancelBookingMutate ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Cancel</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently cancel your booking and refund payment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => cancelBookingMutate(booking.id)}
                    disabled={isPending}
                  >
                    Cancel booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:grid-cols-3">
        <BookingFact label="Check-in" value={formatDate(booking.checkIn)} />
        <BookingFact label="Check-out" value={formatDate(booking.checkOut)} />
        <BookingFact label={`${nights} ${nights === 1 ? "night" : "nights"}`} value={formatCurrency(estimatedTotal)} />
      </CardContent>
    </Card>
  )
}

function BookingList({
  bookings,
  isLoading,
  error,
  cancelBooking,
  emptyTitle,
  emptyText,
  canCancel = true,
}: {
  bookings: UpcomingBooking[]
  isLoading: boolean
  error: Error | null
  cancelBooking?: UseMutationResult<unknown, Error, string, unknown>
  emptyTitle?: string
  emptyText?: string
  canCancel?: boolean
}) {
  if (isLoading) {
    return <BookingSkeleton />
  }

  if (error) {
    return <MessageCard title="Bookings unavailable" text={error.message} />
  }

  if (bookings.length === 0) {
    return <EmptyBookings title={emptyTitle} text={emptyText} showAction={canCancel} />
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} cancelBooking={cancelBooking} canCancel={canCancel} />
      ))}
    </div>
  )
}

function BookingFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <CalendarBlankIcon className="mt-0.5 size-5 shrink-0 text-primary" weight="duotone" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </div>
    </div>
  )
}

function EmptyBookings({
  title = "No upcoming bookings",
  text = "Once you reserve a Stayhaven rental, it will appear here with dates, host, and status.",
  showAction = true,
}: {
  title?: string
  text?: string
  showAction?: boolean
}) {
  return (
    <MessageCard
      icon={<CalendarBlankIcon className="size-8 text-primary" weight="duotone" />}
      title={title}
      text={text}
    >
      {showAction ? (
        <Button asChild className="mt-6">
          <Link href="/rentals">
            Find a stay
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      ) : null}
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

"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { CalendarBlank, CreditCard, MapPin, ShieldCheck, Star } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookingCalendar } from "@/features/bookings/booking-calendar"
import { createBooking } from "@/features/bookings/api"
import { useCurrentRole } from "@/features/auth/use-current-role"
import { formatCurrency, getRentalImages, nightsBetween } from "@/features/rentals/catalog"
import { getAvailableRentals } from "@/features/rentals/api"
import { ApiError } from "@/lib/api/client"

export default function RentalOverviewPage() {
  const params = useParams<{ rentalId: string }>()
  const router = useRouter()
  const { userId } = useCurrentRole()
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [isReserving, setIsReserving] = useState(false)

  const rentalsQuery = useQuery({
    queryKey: ["available-rentals"],
    queryFn: () => getAvailableRentals(),
  })

  const rental = useMemo(
    () => rentalsQuery.data?.find((item) => item.id === params.rentalId) ?? null,
    [params.rentalId, rentalsQuery.data],
  )
  const images = useMemo(() => getRentalImages(params.rentalId), [params.rentalId])
  const nights = nightsBetween(checkIn, checkOut)
  const subtotal = rental ? rental.pricePerNight * nights : 0
  const serviceFee = nights > 0 ? Math.round(subtotal * 0.12) : 0
  const total = subtotal + serviceFee

  async function continueToPayment() {
    if (!rental || nights === 0 || isReserving) {
      return
    }
    if (!userId) {
      toast.error("Sign in before reserving this rental.")
      return
    }

    setIsReserving(true)
    try {
      const booking = await createBooking(
        {
          userId,
          hostId: rental.hostId,
          listingId: rental.id,
          checkIn,
          checkOut,
        },
        { actorUserId: userId },
      )
      const query = new URLSearchParams({
        bookingId: booking.id,
        checkIn,
        checkOut,
        nights: String(nights),
        total: String(total),
      })

      router.push(`/rentals/${rental.id}/payment?${query.toString()}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(error.message)
        return
      }
      toast.error(error instanceof Error ? error.message : "Could not reserve this rental.")
    } finally {
      setIsReserving(false)
    }
  }

  if (rentalsQuery.isLoading) {
    return <StatePanel title="Loading rental" text="Getting this Stayhaven rental ready." />
  }

  if (rentalsQuery.error instanceof Error) {
    return <StatePanel title="Rental unavailable" text={rentalsQuery.error.message} />
  }

  if (!rental) {
    return <StatePanel title="Rental not found" text="This rental is not in the current public catalog." />
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Available</Badge>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {rental.hostName}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">{rental.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
              {rental.description ?? "A prepared Stayhaven rental with host-managed availability."}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Feature icon={<Star weight="fill" />} title="Guest ready" text="Fresh listing review and host notes." />
              <Feature icon={<ShieldCheck weight="fill" />} title="Verified host" text="Active Stayhaven host account." />
              <Feature icon={<CalendarBlank weight="fill" />} title="Flexible dates" text="Choose dates before checkout." />
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-4 md:grid-rows-[220px_160px]">
              {images.map((image, index) => (
                <div
                  key={image}
                  aria-label={`${rental.name} photo ${index + 1}`}
                  className={index === 0 ? "min-h-72 bg-cover bg-center md:col-span-2 md:row-span-2" : "min-h-40 bg-cover bg-center"}
                  role="img"
                  style={{ backgroundImage: `url(${image})` }}
                />
              ))}
            </div>
          </div>

          <Card className="h-fit lg:sticky lg:top-24">
            <CardContent className="space-y-5 px-5">
              <div>
                <p className="text-3xl font-semibold">{formatCurrency(rental.pricePerNight)}</p>
                <p className="text-sm text-muted-foreground">per night</p>
              </div>

              <BookingCalendar
                rentalId={rental.id}
                checkIn={checkIn}
                checkOut={checkOut}
                onDatesChange={(dates) => {
                  setCheckIn(dates.checkIn)
                  setCheckOut(dates.checkOut)
                }}
              />

              <div className="space-y-3 border-t pt-5 text-sm">
                <SummaryRow label={`${formatCurrency(rental.pricePerNight)} x ${nights || 0} nights`} value={formatCurrency(subtotal)} />
                <SummaryRow label="Service fee" value={formatCurrency(serviceFee)} />
                <SummaryRow label="Total" value={formatCurrency(total)} strong />
              </div>

              <Button className="w-full" disabled={nights === 0 || isReserving} onClick={continueToPayment}>
                <CreditCard data-icon="inline-start" />
                {isReserving ? "Reserving..." : "Continue to payment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="border p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-center justify-between text-base font-semibold" : "flex items-center justify-between text-muted-foreground"}>
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function StatePanel({ title, text }: { title: string; text: string }) {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background px-5 py-8 text-foreground sm:px-8">
      <Card className="mx-auto max-w-7xl p-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text}</p>
      </Card>
    </main>
  )
}

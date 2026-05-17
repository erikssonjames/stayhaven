"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { CalendarBlank, CheckCircle, CreditCard, LockKey, MapPin } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { checkReservationStatus } from "@/features/bookings/api"
import { useCurrentRole } from "@/features/auth/use-current-role"
import { createPayment } from "@/features/payments/api"
import { formatCurrency, getRentalImages, nightsBetween } from "@/features/rentals/catalog"
import { getAvailableRentals } from "@/features/rentals/api"
import { ApiError } from "@/lib/api/client"

export default function RentalPaymentPage() {
  const params = useParams<{ rentalId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId } = useCurrentRole()
  const [isPaid, setIsPaid] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expires: "",
    cvc: "",
    email: "",
    country: "",
    postalCode: "",
  })

  const bookingId = searchParams.get("bookingId")
  const checkIn = searchParams.get("checkIn") ?? ""
  const checkOut = searchParams.get("checkOut") ?? ""
  const requestedNights = Number(searchParams.get("nights") ?? 0)

  const rentalsQuery = useQuery({
    queryKey: ["available-rentals"],
    queryFn: () => getAvailableRentals(),
  })

  const rental = useMemo(
    () => rentalsQuery.data?.find((item) => item.id === params.rentalId) ?? null,
    [params.rentalId, rentalsQuery.data],
  )
  const image = useMemo(() => getRentalImages(params.rentalId)[0], [params.rentalId])
  const nights = requestedNights || nightsBetween(checkIn, checkOut)
  const subtotal = rental ? rental.pricePerNight * nights : 0
  const serviceFee = nights > 0 ? Math.round(subtotal * 0.12) : 0
  const total = subtotal + serviceFee
  const canCheckReservation = Boolean(rental && checkIn && checkOut && userId)

  const reservationQuery = useQuery({
    queryKey: ["reservation-status", rental?.id, checkIn, checkOut, bookingId, userId],
    queryFn: () => checkReservationStatus(rental?.id ?? "", checkIn, checkOut, bookingId, { actorUserId: userId }),
    enabled: canCheckReservation,
    retry: false,
  })

  useEffect(() => {
    if (rentalsQuery.isLoading || canCheckReservation) {
      return
    }

    if (!userId) {
      toast.error("Sign in before paying for this rental.")
    } else if (!checkIn || !checkOut) {
      toast.error("Choose booking dates before payment.")
    }
    router.replace(`/rentals/${params.rentalId}`)
  }, [canCheckReservation, checkIn, checkOut, params.rentalId, rentalsQuery.isLoading, router, userId])

  useEffect(() => {
    if (!(reservationQuery.error instanceof Error) || !rental) {
      return
    }

    toast.error(reservationQuery.error.message)
    router.replace(`/rentals/${rental.id}`)
  }, [rental, reservationQuery.error, router])

  function prefillDummyData() {
    setFormData({
      name: "Maya Stone",
      cardNumber: "4242 4242 4242 4242",
      expires: "12 / 30",
      cvc: "123",
      email: "maya.stone@example.com",
      country: "United States",
      postalCode: "10001",
    })
  }

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rental || !userId || isPaying) {
      return
    }

    setIsPaying(true)
    try {
      await createPayment(
        {
          bookingId,
          userId,
          hostId: rental.hostId,
          listingId: rental.id,
          checkIn,
          checkOut,
          amount: total,
          currency: "USD",
        },
        { actorUserId: userId },
      )
      setIsPaid(true)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(error.message)
        router.replace(`/rentals/${rental.id}`)
        return
      }
      toast.error(error instanceof Error ? error.message : "Payment failed.")
    } finally {
      setIsPaying(false)
    }
  }

  if (rentalsQuery.isLoading) {
    return <StatePanel title="Loading checkout" text="Preparing your booking summary." />
  }

  if (rentalsQuery.error instanceof Error) {
    return <StatePanel title="Checkout unavailable" text={rentalsQuery.error.message} />
  }

  if (!rental) {
    return <StatePanel title="Rental not found" text="This rental is not in the current public catalog." />
  }

  if (isPaid) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-background px-5 py-8 text-foreground sm:px-8">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <CheckCircle className="mx-auto size-12 text-primary" weight="fill" />
          <h1 className="mt-5 text-3xl font-semibold">Booking confirmed</h1>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">
            {rental.name} is reserved from {formatDate(checkIn)} to {formatDate(checkOut)}. A confirmation has been prepared for this demo checkout.
          </p>
          <div className="mt-7 flex justify-center gap-2">
            <Button asChild>
              <Link href="/rentals">Browse more rentals</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/rentals/${rental.id}`}>View rental</Link>
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background text-foreground">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_380px]">
        <form className="space-y-6" onSubmit={submitPayment}>
          <div>
            <Badge variant="outline">Secure checkout</Badge>
            <h1 className="mt-4 text-4xl font-semibold">Payment details</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Complete the booking for {rental.name}. Your reservation will be confirmed after payment is captured.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="size-5 text-primary" />
                  Card
                </div>
                <Button type="button" variant="outline" onClick={prefillDummyData}>
                  Prefill dummy data
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="card-name">Name on card</Label>
                  <Input id="card-name" required placeholder="Maya Stone" value={formData.name} onChange={(event) => setFormData((data) => ({ ...data, name: event.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input id="card-number" inputMode="numeric" required placeholder="4242 4242 4242 4242" value={formData.cardNumber} onChange={(event) => setFormData((data) => ({ ...data, cardNumber: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expires</Label>
                  <Input id="expires" required placeholder="MM / YY" value={formData.expires} onChange={(event) => setFormData((data) => ({ ...data, expires: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" inputMode="numeric" required placeholder="123" value={formData.cvc} onChange={(event) => setFormData((data) => ({ ...data, cvc: event.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LockKey className="size-5 text-primary" />
                Billing
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="guest@example.com" value={formData.email} onChange={(event) => setFormData((data) => ({ ...data, email: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" required placeholder="United States" value={formData.country} onChange={(event) => setFormData((data) => ({ ...data, country: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal code</Label>
                  <Input id="postal-code" required placeholder="10001" value={formData.postalCode} onChange={(event) => setFormData((data) => ({ ...data, postalCode: event.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full sm:w-auto" disabled={nights === 0 || reservationQuery.isLoading || isPaying} type="submit">
            {isPaying ? "Processing payment..." : `Pay ${formatCurrency(total)}`}
          </Button>
        </form>

        <Card className="h-fit lg:sticky lg:top-24">
          <div aria-hidden="true" className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
          <CardContent className="space-y-5 p-5">
            <div>
              <h2 className="text-2xl font-semibold">{rental.name}</h2>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {rental.hostName}
              </p>
            </div>

            <div className="space-y-3 border-t pt-5 text-sm">
              <SummaryRow icon={<CalendarBlank />} label="Check-in" value={formatDate(checkIn)} />
              <SummaryRow icon={<CalendarBlank />} label="Check-out" value={formatDate(checkOut)} />
              <SummaryRow label={`${formatCurrency(rental.pricePerNight)} x ${nights || 0} nights`} value={formatCurrency(subtotal)} />
              <SummaryRow label="Service fee" value={formatCurrency(serviceFee)} />
              <SummaryRow label="Total" value={formatCurrency(total)} strong />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function SummaryRow({
  icon,
  label,
  value,
  strong = false,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className={strong ? "flex items-center justify-between text-base font-semibold" : "flex items-center justify-between gap-4 text-muted-foreground"}>
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-right text-foreground">{value}</span>
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

function formatDate(value: string) {
  if (!value) {
    return "Select dates"
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

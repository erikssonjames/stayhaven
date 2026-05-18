import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  HouseLineIcon,
  ShieldCheckIcon,
  SparkleIcon,
  StarIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const features = [
  {
    icon: CalendarCheckIcon,
    title: "Clear stays from search to checkout",
    text: "Guests can compare homes, reserve dates, pay securely, and return to the details that matter.",
  },
  {
    icon: HouseLineIcon,
    title: "Daily host work in one rhythm",
    text: "Hosts can manage availability, booking changes, payments, and guest context without jumping between tools.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Marketplace oversight that stays quiet",
    text: "Admins can review host activity, support guests, follow payments, and keep access boundaries tidy.",
  },
]

const prices = [
  { name: "Guest", price: "Free", detail: "Find homes, book dates, and manage upcoming stays." },
  { name: "Host", price: "5%", detail: "A simple service fee on confirmed bookings." },
  { name: "Teams", price: "Custom", detail: "Shared controls for operators with several homes or regions." },
]

const reviews = [
  {
    quote: "Stayhaven gives us the booking picture before small problems become guest problems.",
    author: "Linnea, city host",
  },
  {
    quote: "The role split is clear. Our ops team can move quickly without asking engineering for every lookup.",
    author: "Marcus, property lead",
  },
  {
    quote: "It feels like a travel app and an operations tool finally agreed on the same truth.",
    author: "Samira, frequent guest",
  },
]

export default function Page() {
  const year = new Date().getFullYear()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20">
        <div className="max-w-3xl">
          <Badge className="mb-6 gap-2" variant="secondary">
            <SparkleIcon weight="fill" />
            Thoughtful homes, prepared hosts, smoother stays
          </Badge>
          <h1 className="max-w-4xl text-5xl font-semibold leading-none tracking-normal sm:text-6xl lg:text-7xl">
            Book places that feel ready when you arrive.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Stayhaven brings guests, hosts, and marketplace teams into the same flow, so every reservation
            has clear dates, clean handoffs, and fewer last-minute surprises.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-in">
                Plan your stay
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/rentals">Browse rentals</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 border-y py-5 text-sm">
            <div>
              <p className="text-2xl font-semibold">2k+</p>
              <p className="text-muted-foreground">guest nights</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">24/7</p>
              <p className="text-muted-foreground">booking access</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">5%</p>
              <p className="text-muted-foreground">host fee</p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div
            aria-label="Modern apartment building with warm evening windows"
            role="img"
            className="min-h-80 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80)",
            }}
          />
          <CardContent className="p-6">
            <p className="max-w-sm text-2xl font-semibold">Harbor Loft is ready for its next confirmed stay.</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <Badge variant="secondary">Dates held</Badge>
              <Badge variant="secondary">Host ready</Badge>
              <Badge variant="secondary">Paid today</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-16 sm:px-8 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="mb-5 size-7 text-primary" weight="duotone" />
                <h2 className="text-xl font-semibold">{feature.title}</h2>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold">Simple plans for every side of a stay.</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {prices.map((price) => (
            <Card key={price.name}>
              <CardHeader>
                <Badge variant={price.name === "Teams" ? "outline" : "secondary"}>{price.name}</Badge>
                <p className="mt-6 text-4xl font-semibold">{price.price}</p>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">{price.detail}</p>
                <Button asChild className="mt-6 w-full" variant={price.name === "Teams" ? "outline" : "default"}>
                  <Link href="/sign-in">{price.name === "Teams" ? "Talk to us" : "Get started"}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.author}>
                <CardHeader>
                  <div className="flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarIcon key={index} className="size-4" weight="fill" />
                    ))}
                  </div>
                  <p className="mt-5 leading-7">&ldquo;{review.quote}&rdquo;</p>
                  <p className="mt-5 text-sm text-muted-foreground">{review.author}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <Link href="/" className="text-sm font-semibold">
              Stayhaven
            </Link>
            <p className="mt-3 max-w-md leading-7 text-muted-foreground">
              Homes for the people arriving, tools for the people hosting, and enough structure to keep
              every stay moving.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <p className="font-semibold">Explore</p>
            <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/rentals">
              Rentals
            </Link>
            <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/sign-in">
              Sign in
            </Link>
          </div>
          <div className="grid gap-3 text-sm">
            <p className="font-semibold">Support</p>
            <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/settings">
              Account settings
            </Link>
            <a className="text-muted-foreground transition-colors hover:text-foreground" href="mailto:hello@stayhaven.local">
              Contact
            </a>
            <p className="text-muted-foreground">&copy; {year} Stayhaven</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

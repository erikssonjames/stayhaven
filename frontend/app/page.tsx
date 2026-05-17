import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  HouseLine,
  ShieldCheck,
  Sparkle,
  Star,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const features = [
  {
    icon: CalendarCheck,
    title: "Guest stays without admin drag",
    text: "Search, reserve, pay, and keep every stay detail in one calm place.",
  },
  {
    icon: HouseLine,
    title: "Host operations built in",
    text: "Run properties, bookings, handoffs, availability, and guest context from one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Admin controls for trust",
    text: "Review hosts, manage users, watch payments, and keep permission boundaries explicit.",
  },
]

const prices = [
  { name: "Guest", price: "Free", detail: "Book homes and manage trip details." },
  { name: "Host", price: "5%", detail: "A simple fee on confirmed stays." },
  { name: "Teams", price: "Custom", detail: "Admin tooling for property groups." },
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
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20">
        <div className="max-w-3xl">
          <Badge className="mb-6 gap-2" variant="secondary">
            <Sparkle weight="fill" />
            Demo-ready homes, hosts, admins, and superadmins
          </Badge>
          <h1 className="max-w-4xl text-5xl font-semibold leading-none tracking-normal sm:text-6xl lg:text-7xl">
            Stayhaven
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            A role-aware rental platform for guests booking dependable stays, hosts running clean
            operations, and admins keeping the marketplace healthy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-in">
                Try demo sign in
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/rentals">Browse rentals</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 border-y py-5 text-sm">
            <div>
              <p className="text-2xl font-semibold">4</p>
              <p className="text-muted-foreground">demo roles</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">24/7</p>
              <p className="text-muted-foreground">ops visibility</p>
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
            className="min-h-[320px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80)",
            }}
          />
          <CardContent className="p-6">
            <p className="max-w-sm text-2xl font-semibold">Harbor Loft is ready for its next confirmed stay.</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <Badge variant="secondary">Guest booked</Badge>
              <Badge variant="secondary">Host paid</Badge>
              <Badge variant="secondary">Admin clear</Badge>
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
          <h2 className="mt-3 text-3xl font-semibold">Simple plans for every side of the stay.</h2>
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
                  <Link href="/sign-in">Open demo</Link>
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
                      <Star key={index} className="size-4" weight="fill" />
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
    </main>
  )
}

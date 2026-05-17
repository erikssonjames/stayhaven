"use client"

import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Funnel, MagnifyingGlass, MapPin, SlidersHorizontal } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, getRentalImages } from "@/features/rentals/catalog"
import { getAvailableRentals, type PublicRental } from "@/features/rentals/api"

type SortValue = "recommended" | "price-asc" | "price-desc" | "name"

export default function RentalsPage() {
  const [query, setQuery] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState<SortValue>("recommended")
  const parentRef = useRef<HTMLDivElement>(null)

  const rentalsQuery = useQuery({
    queryKey: ["available-rentals"],
    queryFn: () => getAvailableRentals(),
  })

  const rentals = useMemo(() => rentalsQuery.data ?? [], [rentalsQuery.data])
  const filteredRentals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const parsedMaxPrice = Number(maxPrice)

    return rentals
      .filter((rental) => {
        const matchesSearch =
          !normalizedQuery ||
          [rental.name, rental.hostName, rental.description].some((value) =>
            value?.toLowerCase().includes(normalizedQuery),
          )
        const matchesPrice = !maxPrice || (Number.isFinite(parsedMaxPrice) && rental.pricePerNight <= parsedMaxPrice)

        return matchesSearch && matchesPrice
      })
      .sort((left, right) => {
        if (sort === "price-asc") {
          return left.pricePerNight - right.pricePerNight
        }
        if (sort === "price-desc") {
          return right.pricePerNight - left.pricePerNight
        }
        if (sort === "name") {
          return left.name.localeCompare(right.name)
        }
        return left.hostName.localeCompare(right.hostName)
      })
  }, [maxPrice, query, rentals, sort])

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filteredRentals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 188,
    overscan: 6,
  })

  return (
    <main className="h-[calc(100svh-4rem)] overflow-hidden bg-background text-foreground">
      <section className="mx-auto flex h-full max-w-7xl flex-col px-5 py-8 sm:px-8">
        <Card className="grid gap-4 p-4 lg:grid-cols-[1fr_170px_190px_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="rental-search">
              <MagnifyingGlass className="size-4" />
              Search
            </Label>
            <Input
              id="rental-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, host, or description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-price">
              <Funnel className="size-4" />
              Max price
            </Label>
            <Input
              id="max-price"
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value.replace(/[^\d.]/g, ""))}
              placeholder="Any"
            />
          </div>
          <div className="space-y-2">
            <Label>
              <SlidersHorizontal className="size-4" />
              Sort
            </Label>
            <Select value={sort} onValueChange={(value) => setSort(value as SortValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-asc">Lowest price</SelectItem>
                <SelectItem value="price-desc">Highest price</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setQuery("")
              setMaxPrice("")
              setSort("recommended")
            }}
          >
            Reset
          </Button>
        </Card>

        <div className="mt-6 min-h-0 flex-1">
          {rentalsQuery.isLoading ? (
            <StatePanel title="Loading rentals" text="Fetching the public rental catalog from the API gateway." />
          ) : rentalsQuery.error instanceof Error ? (
            <StatePanel title="Rentals unavailable" text={rentalsQuery.error.message} />
          ) : filteredRentals.length === 0 ? (
            <StatePanel title="No rentals match" text="Try a different search term or clear the maximum price filter." />
          ) : (
            <div ref={parentRef} className="h-full overflow-auto pr-1">
              <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const rental = filteredRentals[virtualItem.index]

                  return (
                    <div
                      key={rental.id}
                      className="absolute left-0 top-0 w-full pb-4"
                      style={{ transform: `translateY(${virtualItem.start}px)` }}
                    >
                      <RentalRow rental={rental} index={virtualItem.index} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function RentalRow({ rental }: { rental: PublicRental; index: number }) {
  const rentalImage = getRentalImages(rental.id)[0]

  return (
    <Link href={`/rentals/${rental.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="grid min-h-44 overflow-hidden transition hover:ring-primary/50 sm:grid-cols-[220px_1fr]">
        <div
          aria-hidden="true"
          className="h-44 w-full bg-cover bg-center sm:h-full"
          style={{ backgroundImage: `url(${rentalImage})` }}
        />
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Available</Badge>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {rental.hostName}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold">{rental.name}</h2>
            <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
              {rental.description ?? "A prepared Stayhaven rental with host-managed availability."}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 border-t pt-4 lg:block lg:min-w-40 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div>
              <p className="text-3xl font-semibold">{formatCurrency(rental.pricePerNight)}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
            <span className="mt-0 inline-flex h-8 items-center gap-1.5 bg-primary px-2.5 text-xs font-medium text-primary-foreground lg:mt-5">
              View
              <ArrowRight data-icon="inline-end" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatePanel({ title, text }: { title: string; text: string }) {
  return (
    <Card className="p-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text}</p>
    </Card>
  )
}

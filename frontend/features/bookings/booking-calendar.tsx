"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { DateRange } from "react-day-picker"
import { SpinnerGap } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { getRentalAvailability } from "@/features/bookings/api"

type BookingCalendarProps = {
  rentalId: string
  checkIn: string
  checkOut: string
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void
}

export function BookingCalendar({ rentalId, checkIn, checkOut, onDatesChange }: BookingCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today))
  const [availabilityRevision, setAvailabilityRevision] = useState(0)
  const [visitedRange, setVisitedRange] = useState(() => {
    const start = startOfMonth(today)

    return {
      start,
      end: addMonths(start, 1),
    }
  })
  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!checkIn) {
      return undefined
    }

    return {
      from: parseDateInputValue(checkIn),
      to: checkOut ? parseDateInputValue(checkOut) : undefined,
    }
  }, [checkIn, checkOut])
  const availabilityStart = toDateInputValue(visitedRange.start)
  const availabilityEnd = toDateInputValue(visitedRange.end)

  const availabilityQuery = useQuery({
    queryKey: ["rental-availability", rentalId, availabilityStart, availabilityEnd, availabilityRevision],
    queryFn: () => getRentalAvailability(rentalId, availabilityStart, availabilityEnd),
  })

  const blockedDateValues = useMemo(
    () => new Set(availabilityQuery.data?.blockedDates ?? []),
    [availabilityQuery.data?.blockedDates],
  )
  const blockedDates = useMemo(
    () => Array.from(blockedDateValues).map(parseDateInputValue),
    [blockedDateValues],
  )

  function handleSelect(range: DateRange | undefined) {
    const from = range?.from ? toDateInputValue(range.from) : ""
    const to = range?.to ? toDateInputValue(range.to) : ""

    onDatesChange({ checkIn: from, checkOut: to })
  }

  function handleMonthChange(month: Date) {
    const nextMonth = startOfMonth(month)
    setVisibleMonth(nextMonth)
    setAvailabilityRevision((revision) => revision + 1)
    setVisitedRange((currentRange) => ({
      start: minDate(currentRange.start, nextMonth),
      end: maxDate(currentRange.end, addMonths(nextMonth, 1)),
    }))
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Select dates</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{checkIn ? formatShortDate(checkIn) : "Check-in"}</Badge>
          <Badge variant="secondary">{checkOut ? formatShortDate(checkOut) : "Check-out"}</Badge>
        </div>
      </div>

      <Calendar
        className="w-full p-0"
        disabled={[{ before: today }, ...blockedDates]}
        excludeDisabled
        mode="range"
        modifiers={{ unavailable: blockedDates }}
        modifiersClassNames={{
          unavailable: "bg-muted text-muted-foreground opacity-45 line-through",
        }}
        month={visibleMonth}
        onMonthChange={handleMonthChange}
        onSelect={handleSelect}
        selected={selectedRange}
      />

      <div className="mt-4 min-h-5">
        {availabilityQuery.isFetching ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <SpinnerGap className="size-3 animate-spin" />
            Syncing availability
          </span>
        ) : null}
        {availabilityQuery.error instanceof Error ? (
          <span className="text-xs text-destructive">{availabilityQuery.error.message}</span>
        ) : null}
      </div>
    </Card>
  )
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return startOfMonth(next)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function minDate(left: Date, right: Date) {
  return left.getTime() <= right.getTime() ? left : right
}

function maxDate(left: Date, right: Date) {
  return left.getTime() >= right.getTime() ? left : right
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(parseDateInputValue(value))
}

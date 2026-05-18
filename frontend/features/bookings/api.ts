import { apiRequest, type ApiRequestOptions } from "@/lib/api/client"

export type BookingStatus = "RESERVED" | "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

export type Booking = {
  id: string
  userId: string
  hostId: string
  listingId: string
  checkIn: string
  checkOut: string
  status: BookingStatus
}

export type UpcomingBooking = Booking & {
  hostName: string
  listingName: string
  pricePerNight: number
}

export type CreateBookingRequest = {
  userId: string
  hostId: string
  listingId: string
  checkIn: string
  checkOut: string
}

export type BookingAvailability = {
  listingId: string
  checkIn: string
  checkOut: string
  blockedDates: string[]
}

export type BookingReservationStatus = {
  available: boolean
  message: string | null
}

export function getBooking(bookingId: string, options?: ApiRequestOptions) {
  return apiRequest<Booking>(`/api/bookings/${bookingId}`, options)
}

export function getUpcomingBookings(options?: ApiRequestOptions) {
  return apiRequest<UpcomingBooking[]>("/api/bookings/upcoming", options)
}

export function getRentalAvailability(
  rentalId: string,
  checkIn: string,
  checkOut: string,
  options?: ApiRequestOptions,
) {
  const params = new URLSearchParams({ checkIn, checkOut })

  return apiRequest<BookingAvailability>(`/api/rentals/${rentalId}/availability?${params.toString()}`, options)
}

export function checkReservationStatus(
  listingId: string,
  checkIn: string,
  checkOut: string,
  bookingId?: string | null,
  options?: ApiRequestOptions,
) {
  const params = new URLSearchParams({ listingId, checkIn, checkOut })

  if (bookingId) {
    params.set("bookingId", bookingId)
  }

  return apiRequest<BookingReservationStatus>(`/api/bookings/reservation-status?${params.toString()}`, options)
}

export function createBooking(request: CreateBookingRequest, options?: ApiRequestOptions) {
  return apiRequest<Booking>("/api/bookings", {
    ...options,
    method: "POST",
    body: request,
  })
}

export function deleteBooking(bookingId: string, options?: ApiRequestOptions) {
  return apiRequest(`/api/bookings/${bookingId}`, {
    ...options,
    method: "DELETE",
  })
}
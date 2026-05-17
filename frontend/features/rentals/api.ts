import { apiRequest, type ApiRequestOptions } from "@/lib/api/client"

export type Rental = {
  id: string
  hostId: string
  name: string
  description: string | null
  pricePerNight: number
}

export type PublicRental = Rental & {
  hostName: string
}

export type CreateRentalRequest = {
  name: string
  description?: string | null
  pricePerNight: number
}

export type UpdateRentalRequest = CreateRentalRequest

export function getAvailableRentals(options?: ApiRequestOptions) {
  return apiRequest<PublicRental[]>("/api/rentals", options)
}

export function getRentals(hostId: string, options?: ApiRequestOptions) {
  return apiRequest<Rental[]>(`/api/hosts/${hostId}/rentals`, options)
}

export function createRental(
  hostId: string,
  request: CreateRentalRequest,
  options?: ApiRequestOptions,
) {
  return apiRequest<Rental>(`/api/hosts/${hostId}/rentals`, {
    ...options,
    method: "POST",
    body: request,
  })
}

export function updateRental(
  hostId: string,
  rentalId: string,
  request: UpdateRentalRequest,
  options?: ApiRequestOptions,
) {
  return apiRequest<Rental>(`/api/hosts/${hostId}/rentals/${rentalId}`, {
    ...options,
    method: "PUT",
    body: request,
  })
}

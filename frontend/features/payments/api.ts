import { apiRequest, type ApiRequestOptions } from "@/lib/api/client"

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED"

export type Payment = {
  id: string
  bookingId: string
  amount: number
  currency: string
  status: PaymentStatus
}

export type CreatePaymentRequest = {
  bookingId?: string | null
  userId: string
  hostId: string
  listingId: string
  checkIn: string
  checkOut: string
  amount: number
  currency: string
}

export function getPayment(paymentId: string, options?: ApiRequestOptions) {
  return apiRequest<Payment>(`/api/payments/${paymentId}`, options)
}

export function createPayment(request: CreatePaymentRequest, options?: ApiRequestOptions) {
  return apiRequest<Payment>("/api/payments", {
    ...options,
    method: "POST",
    body: request,
  })
}

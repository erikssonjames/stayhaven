import { apiRequest, type ApiRequestOptions } from "@/lib/api/client"

export type AdminSummary = {
  userCount: number
  hostCount: number
  bookingCount: number
  paymentCount: number
}

export function getAdminSummary(options?: ApiRequestOptions) {
  return apiRequest<AdminSummary>("/api/admin/summary", options)
}

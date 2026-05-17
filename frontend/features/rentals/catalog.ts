export const rentalImages = [
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
]

export function getRentalImages(rentalId: string) {
  const offset = rentalId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % rentalImages.length

  return rentalImages.map((_, index) => rentalImages[(offset + index) % rentalImages.length]).slice(0, 5)
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "$0"
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0
  }

  const start = new Date(`${checkIn}T00:00:00`)
  const end = new Date(`${checkOut}T00:00:00`)
  const diff = end.getTime() - start.getTime()

  if (!Number.isFinite(diff) || diff <= 0) {
    return 0
  }

  return Math.round(diff / 86_400_000)
}

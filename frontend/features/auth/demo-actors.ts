import type { UserRole } from "@/features/users/api"

export type DemoActor = {
  id: string
  role: UserRole
  email: string
  name: string
  description: string
}

export const ACTOR_STORAGE_KEY = "stayhaven.actorUserId"

export const demoActors: DemoActor[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    role: "USER",
    email: "user@stayhaven.test",
    name: "Maya Stone",
    description: "Browse stays, manage bookings, and keep trip details tidy.",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    role: "HOST",
    email: "host@stayhaven.test",
    name: "Jonas Reed",
    description: "Manage rentals, availability, guest handoffs, and revenue.",
  },
  {
    id: "10000000-0000-0000-0000-000000000111",
    role: "USER",
    email: "guest.ava@stayhaven.test",
    name: "Ava Brooks",
    description: "Plan city breaks, track dates, and manage reservation details.",
  },
  {
    id: "10000000-0000-0000-0000-000000000112",
    role: "USER",
    email: "guest.luca@stayhaven.test",
    name: "Luca Stone",
    description: "Explore rentals, reserve trips, and keep upcoming stays organized.",
  },
]

export function rolePath(role: UserRole) {
  return `/dashboard/${role.toLowerCase()}`
}

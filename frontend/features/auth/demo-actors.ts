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
    id: "10000000-0000-0000-0000-000000000003",
    role: "USER",
    email: "alex@stayhaven.test",
    name: "Alex Carter",
    description: "Plan upcoming stays and keep reservations organized.",
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    role: "USER",
    email: "nora@stayhaven.test",
    name: "Nora Bennett",
    description: "Explore listings, reserve trips, and track travel dates.",
  },
]

export function rolePath(role: UserRole) {
  return `/dashboard/${role.toLowerCase()}`
}

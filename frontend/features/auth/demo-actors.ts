import type { UserRole } from "@/features/users/api"

export type DemoActor = {
  role: UserRole
  email: string
  name: string
}

export const demoActors: DemoActor[] = [
  {
    role: "USER",
    email: "user@stayhaven.test",
    name: "Maya Stone",
  },
  {
    role: "HOST",
    email: "host@stayhaven.test",
    name: "Jonas Reed",
  },
  {
    role: "ADMIN",
    email: "admin@stayhaven.test",
    name: "Priya Nair",
  },
  {
    role: "SUPERADMIN",
    email: "superadmin@stayhaven.test",
    name: "Elena Vale",
  },
]

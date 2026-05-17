"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Buildings, GearSix, HouseLine, SignOut, UserCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { rolePath } from "@/features/auth/demo-actors"
import { useCurrentRole } from "@/features/auth/use-current-role"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rentals", label: "Rentals" },
  { href: "/dashboard", label: "Dashboard" },
]

export function AppNavbar() {
  const pathname = usePathname()
  const { user, role, isLoading, setActorUserId } = useCurrentRole()
  const signedInName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email

  if (pathname.startsWith("/sign-in")) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
              <Buildings weight="fill" />
            </span>
            Stayhaven
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Button key={link.href} asChild variant={isActive(pathname, link.href) ? "secondary" : "ghost"} size="sm">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {user && role ? (
            <>
              <div className="hidden min-w-0 items-center gap-2 md:flex">
                <UserCircle className="size-5 text-muted-foreground" weight="duotone" />
                <span className="max-w-44 truncate text-sm font-medium">{signedInName}</span>
                <Badge variant="secondary">{role.toLowerCase()}</Badge>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={rolePath(role)}>
                  <HouseLine data-icon="inline-start" />
                  Workspace
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon-sm" aria-label="Settings" title="Settings">
                <Link href="/settings">
                  <GearSix />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Sign out"
                title="Sign out"
                onClick={() => setActorUserId(null)}
              >
                <SignOut />
              </Button>
            </>
          ) : (
            <>
              <span className={cn("hidden text-sm text-muted-foreground md:inline", isLoading && "animate-pulse")}>
                {isLoading ? "Checking session" : "Browsing as guest"}
              </span>
              <Button asChild size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </>
          )}
        </div>

        <nav className="grid w-full grid-cols-3 gap-1 sm:hidden">
          {navLinks.map((link) => (
            <Button key={link.href} asChild variant={isActive(pathname, link.href) ? "secondary" : "ghost"} size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

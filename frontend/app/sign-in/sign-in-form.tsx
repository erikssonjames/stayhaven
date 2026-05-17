"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle, SignIn } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ACTOR_STORAGE_KEY, demoActors, rolePath } from "@/features/auth/demo-actors"
import { cn } from "@/lib/utils"

export function SignInForm() {
  const router = useRouter()
  const [selectedActorId, setSelectedActorId] = useState(demoActors[0]?.id)
  const selectedActor = demoActors.find((actor) => actor.id === selectedActorId) ?? demoActors[0]

  function signIn() {
    if (!selectedActor) {
      return
    }

    window.localStorage.setItem(ACTOR_STORAGE_KEY, selectedActor.id)
    router.push(rolePath(selectedActor.role))
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-primary">Sign in</p>
        <h2 className="mt-3 text-3xl font-semibold">Choose a seeded account.</h2>
      </div>
      <div className="grid gap-3">
        {demoActors.map((actor) => {
          const isSelected = actor.id === selectedActor?.id

          return (
            <button
              key={actor.id}
              type="button"
              onClick={() => setSelectedActorId(actor.id)}
              className={cn(
                "border bg-card p-4 text-left text-card-foreground transition hover:bg-muted",
                isSelected && "border-ring ring-1 ring-ring",
              )}
            >
              <span className="flex items-start justify-between gap-4">
                <span>
                  <span className="text-xs font-semibold text-primary">{actor.role}</span>
                  <span className="mt-1 block text-lg font-semibold">{actor.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{actor.email}</span>
                  <span className="mt-3 block leading-6 text-muted-foreground">{actor.description}</span>
                </span>
                {isSelected ? <CheckCircle className="size-5 shrink-0 text-primary" weight="fill" /> : null}
              </span>
            </button>
          )
        })}
      </div>
      <Button onClick={signIn} size="lg" className="mt-6 w-full">
        <SignIn data-icon="inline-start" />
        Continue to {selectedActor?.role.toLowerCase()} dashboard
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}

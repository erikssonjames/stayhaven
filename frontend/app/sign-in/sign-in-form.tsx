"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, SignInIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/features/auth/api"
import { demoActors } from "@/features/auth/demo-actors"
import { useCurrentRole } from "@/features/auth/use-current-role"

export function SignInForm() {
  const router = useRouter()
  const { setAuthToken } = useCurrentRole()
  const [email, setEmail] = useState(demoActors[0]?.email ?? "")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await login({ email, password })
      setAuthToken(response.token, response.user)
      router.push("/dashboard/user")
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Sign in failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={signIn} className="w-full max-w-xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-primary">Sign in</p>
        <h2 className="mt-3 text-3xl font-semibold">Use your Stayhaven account.</h2>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <div className="border bg-muted/40 p-4 text-sm text-muted-foreground">
          Seeded local accounts use <span className="font-medium text-foreground">password</span> as the password.
          Try user(0-11)@stayhaven.test.
        </div>
      </div>
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        <SignInIcon data-icon="inline-start" />
        {isSubmitting ? "Signing in" : "Sign in"}
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </form>
  )
}

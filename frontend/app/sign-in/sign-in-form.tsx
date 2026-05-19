"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, SignInIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/features/auth/api"
import { useCurrentRole } from "@/features/auth/use-current-role"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SignInForm() {
  const router = useRouter()
  const { setAuthToken } = useCurrentRole()
  const [email, setEmail] = useState("user0@stayhaven.test")
  const [password, setPassword] = useState("password")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await login({ email, password })
      setAuthToken(response.token, response.user)
      router.push("/dashboard")
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
          <Select onValueChange={setEmail} value={email}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="user0@stayhaven.test" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Users</SelectLabel>
                {Array.from({ length: 12 }).map((_, index) => (
                  <SelectItem key={index} value={`user${index}@stayhaven.test`}>
                    user{index}@stayhaven.test
                  </SelectItem>
                ))}
              </SelectGroup>

              <SelectGroup>
                <SelectLabel>Hosts</SelectLabel>
                {Array.from({ length: 11 }).map((_, index) => (
                  <SelectItem key={index} value={`host${index}@stayhaven.test`}>
                    host{index}@stayhaven.test
                  </SelectItem>
                ))}
              </SelectGroup>

              <SelectGroup>
                <SelectLabel>Admins</SelectLabel>
                <SelectItem value="admin@stayhaven.test">admin@stayhaven.test</SelectItem>
                <SelectItem value="superadmin@stayhaven.test">superadmin@stayhaven.test</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            disabled
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      </div>
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        <SignInIcon data-icon="inline-start" />
        {isSubmitting ? "Signing in" : "Sign in"}
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </form>
  )
}

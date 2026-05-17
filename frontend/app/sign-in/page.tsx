import Link from "next/link"
import { Buildings } from "@phosphor-icons/react/dist/ssr"

import { SignInForm } from "@/app/sign-in/sign-in-form"

export default function SignInPage() {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col justify-between border-r p-6 sm:p-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
            <Buildings weight="fill" />
          </span>
          Stayhaven
        </Link>
        <div className="my-16 max-w-xl">
          <p className="text-sm font-semibold uppercase text-primary">Demo access</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Pick a role and step into the right dashboard.
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            These accounts are seeded by Flyway in the API gateway so frontend routing and backend
            authorization can be tested together.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Local demo identities use header-based auth.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <SignInForm />
      </section>
    </main>
  )
}

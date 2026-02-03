"use client"

import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <SignedOut>
        <SignIn routing="path" path="/login" withSignUp={false} />
      </SignedOut>
      <SignedIn>
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-neutral-600">Ya tienes una sesión iniciada.</p>
          <div className="mt-4 flex items-center justify-center">
            <UserButton afterSignOutUrl="/login" />
          </div>
        </div>
      </SignedIn>
    </div>
  )
}

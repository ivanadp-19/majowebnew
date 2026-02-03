'use client'

import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { TopNav } from '@/components/TopNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-neutral-50">
          <TopNav />
          <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </div>
      </SignedIn>
    </>
  )
}

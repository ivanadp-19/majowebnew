'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

const links = [
  { href: '/admin/meals', label: 'Comidas' },
  { href: '/admin/extract', label: 'PDF' },
  { href: '/admin/chat', label: 'Chat' },
]

export const TopNav = () => {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/meals" className="text-lg font-semibold text-neutral-900">
            Administración
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded border border-neutral-300 px-3 py-1.5">Ingresar</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded bg-neutral-900 px-3 py-1.5 text-white">Crear cuenta</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

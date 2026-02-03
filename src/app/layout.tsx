import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Gluten, Delius, Sour_Gummy } from 'next/font/google'
import './globals.css'

const gluten = Gluten({
  subsets: ['latin'],
  variable: '--font-gluten',
})

const delius = Delius({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-delius',
})

const sourGummy = Sour_Gummy({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sour-gummy',
})

export const metadata: Metadata = {
  title: 'Majo Nutrición | Nutricionista Especializada',
  description: 'Planes de nutrición personalizados para transformar tu vida. Consultas online y presenciales.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/login?mode=sign-up"
      signInForceRedirectUrl="/admin/meals"
      signUpForceRedirectUrl="/admin/meals"
    >
      <html lang="es" className={`${gluten.variable} ${delius.variable} ${sourGummy.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}

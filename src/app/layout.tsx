import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: 'aachaaryAI - AI Test Paper Generation',
  description: 'Generate test papers in minutes with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}

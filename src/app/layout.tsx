import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

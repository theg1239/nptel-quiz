// app/layout.tsx
import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NPTELPrep',
  description: 'Free NPTEL Practice Questions & Study Materials',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

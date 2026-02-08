import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blitz — AI Content for Game Day',
  description: 'Your restaurant goes viral during the Super Bowl. AI generates branded content in real-time so local pizzerias and wing shops can compete with national chains.',
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

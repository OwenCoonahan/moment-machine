import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moment Machine — AI Content at the Speed of Live',
  description: 'Generate thousands of branded content pieces in seconds. Turn live moments into marketing gold.',
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

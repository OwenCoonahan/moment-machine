import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') || ''
  const ttsUrl = searchParams.get('ttsUrl') || ''

  const escapedText = text.replace(/[<>]/g, '')

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${ttsUrl ? `<Play>${ttsUrl}</Play>` : `<Say>${escapedText}</Say>`}
</Response>`

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}

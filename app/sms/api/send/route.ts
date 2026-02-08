import { NextResponse } from 'next/server'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL

const requireEnv = () => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return NextResponse.json(
      { error: 'Missing Twilio environment variables.' },
      { status: 400 }
    )
  }
  return null
}

export async function POST(request: Request) {
  try {
    const envError = requireEnv()
    if (envError) return envError

    const { message, to } = await request.json()
    if (!message || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload. Provide message and to[].' },
        { status: 400 }
      )
    }
    if (!PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: 'Missing PUBLIC_BASE_URL for Twilio call audio.' },
        { status: 400 }
      )
    }

    const results = []
    for (const recipient of to) {
      const ttsUrl = `${PUBLIC_BASE_URL}/sms/api/tts?text=${encodeURIComponent(message)}`
      const twimlUrl = `${PUBLIC_BASE_URL}/sms/api/call?text=${encodeURIComponent(message)}&ttsUrl=${encodeURIComponent(ttsUrl)}`
      const body = new URLSearchParams({
        From: TWILIO_FROM_NUMBER as string,
        To: recipient,
        Url: twimlUrl,
      })

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        }
      )

      const payload = await response.json()
      results.push({
        to: recipient,
        ok: response.ok,
        sid: payload.sid || null,
        status: payload.status || null,
        error: response.ok ? null : payload.message || 'Twilio error',
      })
    }

    return NextResponse.json({
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    })
  } catch (error) {
    console.error('Twilio send error:', error)
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}

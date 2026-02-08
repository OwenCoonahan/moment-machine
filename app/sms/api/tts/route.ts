import { NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID

async function generateAudio(text: string) {
  if (!ELEVENLABS_API_KEY) {
    return { error: 'Missing ELEVENLABS_API_KEY.' as const }
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL_ID,
      }),
    }
  )

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    return { error: payload.detail || payload.message || 'ElevenLabs error' as const }
  }

  const audioBuffer = await response.arrayBuffer()
  return { audioBuffer }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    if (!text) {
      return NextResponse.json({ error: 'Missing text.' }, { status: 400 })
    }

    const result = await generateAudio(text)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { audioBuffer } = result
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('ElevenLabs TTS error:', error)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text')
    if (!text) {
      return NextResponse.json({ error: 'Missing text.' }, { status: 400 })
    }

    const result = await generateAudio(text)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { audioBuffer } = result
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('ElevenLabs TTS error:', error)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}

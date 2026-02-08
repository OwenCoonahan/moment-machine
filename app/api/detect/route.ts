import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

// Initialize Gemini
const genAI = GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(GOOGLE_AI_API_KEY) : null

export async function POST(request: Request) {
  try {
    const { imageBase64, videoUrl, simulateEvent } = await request.json()

    // If simulating, return a random event
    if (simulateEvent) {
      const events = [
        { type: 'TOUCHDOWN', description: 'Chiefs score touchdown - Mahomes to Kelce, 15 yard pass', confidence: 0.97 },
        { type: 'TOUCHDOWN', description: 'Eagles score touchdown - Hurts rushing TD', confidence: 0.96 },
        { type: 'FUMBLE', description: 'Fumble recovered by defense on the 20 yard line', confidence: 0.94 },
        { type: 'INTERCEPTION', description: 'Pass intercepted in the red zone', confidence: 0.92 },
        { type: 'BIG_PLAY', description: '45-yard completion to the 10-yard line', confidence: 0.89 },
        { type: 'FIELD_GOAL', description: 'Field goal is GOOD from 42 yards', confidence: 0.95 },
        { type: 'SACK', description: 'Quarterback sacked for a loss of 8 yards', confidence: 0.91 },
      ]
      
      const event = events[Math.floor(Math.random() * events.length)]
      return NextResponse.json({
        detected: true,
        event: {
          ...event,
          timestamp: new Date().toISOString(),
        },
        source: 'simulation'
      })
    }

    // Real Gemini detection
    if (imageBase64 && genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        },
        `You are analyzing a frame from an American football game (NFL Super Bowl).
        
Detect if any significant event is occurring in this frame:
- TOUCHDOWN: A team just scored or is scoring a touchdown (celebration, ball crossing goal line)
- FUMBLE: The ball has been fumbled (loose ball, scramble)
- INTERCEPTION: A pass was just intercepted (defensive player catching ball)
- BIG_PLAY: A significant play (20+ yards, player running with ball downfield)
- FIELD_GOAL: A field goal attempt (kicker, ball in air toward posts)
- SACK: Quarterback being tackled behind line of scrimmage
- HALFTIME: Halftime show or break (entertainment, not game action)
- CELEBRATION: Team/crowd celebrating (may indicate recent score)
- NONE: Normal gameplay, no significant event

Respond with ONLY valid JSON in this exact format:
{"event": "EVENT_TYPE", "description": "brief 10-word max description", "confidence": 0.85}

If no significant event, use: {"event": "NONE", "description": "Normal gameplay", "confidence": 0.5}`
      ])
      
      try {
        const text = result.response.text().trim()
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          
          if (parsed.event && parsed.event !== 'NONE') {
            return NextResponse.json({
              detected: true,
              event: {
                type: parsed.event,
                description: parsed.description,
                confidence: parsed.confidence,
                timestamp: new Date().toISOString(),
              },
              source: 'gemini'
            })
          }
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError)
      }
    }

    // No event detected
    return NextResponse.json({
      detected: false,
      event: null,
      source: genAI ? 'gemini' : 'none'
    })

  } catch (error) {
    console.error('Detection error:', error)
    return NextResponse.json({ error: 'Detection failed' }, { status: 500 })
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    geminiEnabled: !!genAI,
    timestamp: new Date().toISOString()
  })
}

import { NextResponse } from 'next/server'
import { BOTS, generateComment, type Trade } from '@/lib/bots'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { botId, trade, event } = body
    
    const bot = BOTS.find(b => b.id === botId)
    if (!bot) {
      return NextResponse.json(
        { success: false, error: 'Bot not found' },
        { status: 404 }
      )
    }
    
    const comment = generateComment(bot, trade as Trade, event)
    
    return NextResponse.json({
      success: true,
      botId,
      botName: bot.name,
      comment,
      avatar: bot.avatar,
      color: bot.color,
    })
  } catch (error) {
    console.error('Comment API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate comment' },
      { status: 500 }
    )
  }
}

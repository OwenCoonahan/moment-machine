import { NextResponse } from 'next/server'
import { executeTrade, simulateBotReactions, resolvePendingTrades } from '@/lib/bots'
import type { GameEvent } from '@/lib/events'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { botId, event, market, action, simulate } = body
    
    // Simulate multiple bots reacting to an event
    if (simulate && event) {
      const trades = simulateBotReactions(event as GameEvent)
      
      // Resolve some pending trades for demo
      resolvePendingTrades()
      
      return NextResponse.json({
        success: true,
        trades,
        message: `${trades.length} bots reacted to ${event.type}`,
      })
    }
    
    // Single bot trade
    if (botId && event) {
      const trade = executeTrade(
        botId,
        event as GameEvent,
        market,
        action as 'BUY' | 'SELL' | undefined
      )
      
      if (!trade) {
        return NextResponse.json(
          { success: false, error: 'Trade could not be executed' },
          { status: 400 }
        )
      }
      
      return NextResponse.json({
        success: true,
        trade,
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Trade API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute trade' },
      { status: 500 }
    )
  }
}

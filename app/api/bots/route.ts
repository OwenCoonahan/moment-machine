import { NextResponse } from 'next/server'
import { 
  getBotsWithStats, 
  getLeaderboard, 
  getRecentTrades,
  seedDemoTrades 
} from '@/lib/bots'

// Seed trades on first load
let seeded = false

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'all'
  const limit = parseInt(searchParams.get('limit') || '50')
  
  // Seed demo trades once
  if (!seeded) {
    seedDemoTrades()
    seeded = true
  }
  
  try {
    if (view === 'leaderboard') {
      return NextResponse.json({
        success: true,
        leaderboard: getLeaderboard(),
      })
    }
    
    if (view === 'trades') {
      return NextResponse.json({
        success: true,
        trades: getRecentTrades(limit),
      })
    }
    
    // Default: return all data
    return NextResponse.json({
      success: true,
      bots: getBotsWithStats(),
      leaderboard: getLeaderboard(),
      trades: getRecentTrades(limit),
    })
  } catch (error) {
    console.error('Bots API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bot data' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import {
  detectEventType,
  isSignificantEvent,
  getEventLabel,
  SIGNIFICANT_EVENTS,
  type EventType,
  type GameEvent,
  type GameState,
} from '@/lib/events'

// ESPN API endpoints
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

// Get current NFL games
async function getCurrentGames(): Promise<GameState[]> {
  try {
    const response = await fetch(`${ESPN_BASE}/scoreboard`, {
      next: { revalidate: 10 } // Cache for 10 seconds
    })
    
    if (!response.ok) {
      console.error('ESPN API error:', response.status)
      return []
    }
    
    const data = await response.json()
    
    if (!data.events || data.events.length === 0) {
      return []
    }
    
    return data.events.map((event: any) => {
      const competition = event.competitions?.[0]
      const homeTeam = competition?.competitors?.find((c: any) => c.homeAway === 'home')
      const awayTeam = competition?.competitors?.find((c: any) => c.homeAway === 'away')
      const situation = competition?.situation
      
      // Parse last play into event
      let lastEvent: GameEvent | undefined
      if (situation?.lastPlay) {
        const playText = situation.lastPlay.text || ''
        const eventType = detectEventType(playText)
        lastEvent = {
          id: `${event.id}-${Date.now()}`,
          type: eventType,
          description: playText,
          team: situation.lastPlay.team?.abbreviation,
          teamFull: situation.lastPlay.team?.displayName,
          quarter: event.status?.period || 0,
          clock: event.status?.displayClock || '',
          homeScore: parseInt(homeTeam?.score || '0'),
          awayScore: parseInt(awayTeam?.score || '0'),
          timestamp: new Date().toISOString(),
          confidence: 0.95
        }
      }
      
      return {
        gameId: event.id,
        status: event.status?.type?.state || 'pre',
        quarter: event.status?.period || 0,
        clock: event.status?.displayClock || '',
        homeTeam: {
          name: homeTeam?.team?.displayName || '',
          abbreviation: homeTeam?.team?.abbreviation || '',
          score: parseInt(homeTeam?.score || '0'),
          logo: homeTeam?.team?.logo
        },
        awayTeam: {
          name: awayTeam?.team?.displayName || '',
          abbreviation: awayTeam?.team?.abbreviation || '',
          score: parseInt(awayTeam?.score || '0'),
          logo: awayTeam?.team?.logo
        },
        lastEvent,
        venue: competition?.venue?.fullName
      }
    })
  } catch (error) {
    console.error('ESPN fetch error:', error)
    return []
  }
}

// GET endpoint - fetch current games
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')
  
  const games = await getCurrentGames()
  
  if (gameId) {
    const game = games.find(g => g.gameId === gameId)
    return NextResponse.json({ game: game || null })
  }
  
  // Find active games (in progress)
  const activeGames = games.filter(g => g.status === 'in')
  
  return NextResponse.json({
    games,
    activeGames,
    timestamp: new Date().toISOString()
  })
}

// POST endpoint - detect significant events
export async function POST(request: Request) {
  try {
    const { gameId, lastKnownPlay, lastKnownEventId } = await request.json()
    
    const games = await getCurrentGames()
    const game = gameId 
      ? games.find(g => g.gameId === gameId)
      : games.find(g => g.status === 'in')
    
    if (!game) {
      return NextResponse.json({ 
        detected: false, 
        message: 'No active game found' 
      })
    }
    
    // Check if there's a new significant play
    const lastEvent = game.lastEvent
    const isNewEvent = lastEvent && (
      lastEvent.description !== lastKnownPlay ||
      (lastKnownEventId && lastEvent.id !== lastKnownEventId)
    )
    
    if (isNewEvent && lastEvent && isSignificantEvent(lastEvent.type)) {
      return NextResponse.json({
        detected: true,
        event: {
          ...lastEvent,
          label: getEventLabel(lastEvent.type),
        },
        game: {
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          score: `${game.awayTeam.abbreviation} ${game.awayTeam.score} - ${game.homeTeam.abbreviation} ${game.homeTeam.score}`,
          quarter: game.quarter,
          clock: game.clock,
          venue: game.venue
        }
      })
    }
    
    return NextResponse.json({
      detected: false,
      game: {
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        score: `${game.awayTeam.abbreviation} ${game.awayTeam.score} - ${game.homeTeam.abbreviation} ${game.homeTeam.score}`,
        quarter: game.quarter,
        clock: game.clock,
        lastPlay: lastEvent?.description,
        lastEventId: lastEvent?.id
      }
    })
  } catch (error) {
    console.error('ESPN detection error:', error)
    return NextResponse.json({ detected: false, error: 'Detection failed' }, { status: 500 })
  }
}

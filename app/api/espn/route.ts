import { NextResponse } from 'next/server'

// ESPN API endpoints
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

interface GameEvent {
  type: string
  description: string
  team?: string
  player?: string
  timestamp: string
  confidence: number
}

interface GameStatus {
  gameId: string
  status: 'pre' | 'in' | 'post'
  period: number
  clock: string
  homeTeam: {
    name: string
    abbreviation: string
    score: number
  }
  awayTeam: {
    name: string
    abbreviation: string
    score: number
  }
  lastPlay?: GameEvent
  venue?: string
}

// Get current NFL games
async function getCurrentGames(): Promise<GameStatus[]> {
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
      let lastPlay: GameEvent | undefined
      if (situation?.lastPlay) {
        const playType = parsePlayType(situation.lastPlay.text || '')
        lastPlay = {
          type: playType,
          description: situation.lastPlay.text || '',
          team: situation.lastPlay.team?.abbreviation,
          timestamp: new Date().toISOString(),
          confidence: 0.95
        }
      }
      
      return {
        gameId: event.id,
        status: event.status?.type?.state || 'pre',
        period: event.status?.period || 0,
        clock: event.status?.displayClock || '',
        homeTeam: {
          name: homeTeam?.team?.displayName || '',
          abbreviation: homeTeam?.team?.abbreviation || '',
          score: parseInt(homeTeam?.score || '0')
        },
        awayTeam: {
          name: awayTeam?.team?.displayName || '',
          abbreviation: awayTeam?.team?.abbreviation || '',
          score: parseInt(awayTeam?.score || '0')
        },
        lastPlay,
        venue: competition?.venue?.fullName
      }
    })
  } catch (error) {
    console.error('ESPN fetch error:', error)
    return []
  }
}

// Parse play text to determine event type
function parsePlayType(playText: string): string {
  const text = playText.toLowerCase()
  
  if (text.includes('touchdown') || text.includes(' td ')) {
    return 'TOUCHDOWN'
  }
  if (text.includes('field goal') || text.includes('fg ')) {
    return 'FIELD_GOAL'
  }
  if (text.includes('interception') || text.includes('intercepted')) {
    return 'INTERCEPTION'
  }
  if (text.includes('fumble')) {
    return 'FUMBLE'
  }
  if (text.includes('sack')) {
    return 'SACK'
  }
  if (text.includes('safety')) {
    return 'SAFETY'
  }
  if (text.includes('punt')) {
    return 'PUNT'
  }
  if (text.includes('kickoff')) {
    return 'KICKOFF'
  }
  
  // Check for big plays (20+ yards)
  const yardMatch = text.match(/(\d+)\s*yard/i)
  if (yardMatch && parseInt(yardMatch[1]) >= 20) {
    return 'BIG_PLAY'
  }
  
  return 'PLAY'
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
    const { gameId, lastKnownPlay } = await request.json()
    
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
    if (game.lastPlay && game.lastPlay.description !== lastKnownPlay) {
      const significantTypes = ['TOUCHDOWN', 'FIELD_GOAL', 'INTERCEPTION', 'FUMBLE', 'SAFETY', 'BIG_PLAY']
      
      if (significantTypes.includes(game.lastPlay.type)) {
        return NextResponse.json({
          detected: true,
          event: game.lastPlay,
          game: {
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            score: `${game.awayTeam.abbreviation} ${game.awayTeam.score} - ${game.homeTeam.abbreviation} ${game.homeTeam.score}`,
            period: game.period,
            clock: game.clock
          }
        })
      }
    }
    
    return NextResponse.json({
      detected: false,
      game: {
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        score: `${game.awayTeam.abbreviation} ${game.awayTeam.score} - ${game.homeTeam.abbreviation} ${game.homeTeam.score}`,
        period: game.period,
        clock: game.clock,
        lastPlay: game.lastPlay?.description
      }
    })
  } catch (error) {
    console.error('ESPN detection error:', error)
    return NextResponse.json({ detected: false, error: 'Detection failed' }, { status: 500 })
  }
}

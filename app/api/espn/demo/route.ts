import { NextResponse } from 'next/server'
import {
  getCurrentDemoEvent,
  getNextDemoEvent,
  resetDemo,
  getAllDemoEvents,
  getDemoGameState,
  isSignificantEvent,
  getEventLabel,
  type DemoEvent,
  type GameState,
} from '@/lib/events'

/**
 * DEMO MODE API - Simulated Super Bowl Events
 * 
 * Use this endpoint when:
 * - Testing before the real Super Bowl starts
 * - Demonstrating to hackathon judges
 * - Development and debugging
 * 
 * Events cycle through a realistic Super Bowl game sequence.
 */

// Track last returned event ID to detect new events
let lastEventId: string | null = null

// GET - Get current demo state and event
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Reset demo to beginning
  if (action === 'reset') {
    resetDemo()
    lastEventId = null
    return NextResponse.json({
      success: true,
      message: 'Demo reset to beginning',
    })
  }

  // Get all events for preview
  if (action === 'all') {
    const events = getAllDemoEvents()
    return NextResponse.json({
      events,
      count: events.length,
    })
  }

  // Get next event (advances sequence)
  if (action === 'next') {
    const event = getNextDemoEvent()
    lastEventId = event.id
    
    return NextResponse.json({
      event,
      eventLabel: getEventLabel(event.type),
      isSignificant: isSignificantEvent(event.type),
      game: getDemoGameState(),
      isDemo: true,
    })
  }

  // Default: Get current demo state
  const gameState = getDemoGameState()
  const currentEvent = getCurrentDemoEvent()

  return NextResponse.json({
    game: gameState,
    event: currentEvent,
    eventLabel: getEventLabel(currentEvent.type),
    isSignificant: isSignificantEvent(currentEvent.type),
    timestamp: new Date().toISOString(),
    isDemo: true,
    instructions: {
      reset: 'GET /api/espn/demo?action=reset',
      next: 'GET /api/espn/demo?action=next',
      all: 'GET /api/espn/demo?action=all',
      detect: 'POST /api/espn/demo (polls for new events)',
    },
  })
}

// POST - Poll for new significant events (mimics real ESPN polling)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { lastKnownEventId, autoAdvance = false } = body

    // Optionally auto-advance to next event
    let currentEvent: DemoEvent
    if (autoAdvance) {
      currentEvent = getNextDemoEvent()
    } else {
      currentEvent = getCurrentDemoEvent()
    }

    const gameState = getDemoGameState()

    // Check if this is a new event
    const isNewEvent = lastKnownEventId !== currentEvent.id
    const isSignificant = isSignificantEvent(currentEvent.type)

    // Only trigger content generation for new significant events
    if (isNewEvent && isSignificant) {
      return NextResponse.json({
        detected: true,
        event: {
          id: currentEvent.id,
          type: currentEvent.type,
          label: getEventLabel(currentEvent.type),
          description: currentEvent.description,
          team: currentEvent.team,
          teamFull: currentEvent.teamFull,
          player: currentEvent.player,
          quarter: currentEvent.quarter,
          clock: currentEvent.clock,
          timestamp: currentEvent.timestamp,
        },
        game: {
          homeTeam: gameState.homeTeam,
          awayTeam: gameState.awayTeam,
          score: `${gameState.awayTeam.abbreviation} ${gameState.awayTeam.score} - ${gameState.homeTeam.abbreviation} ${gameState.homeTeam.score}`,
          quarter: gameState.quarter,
          clock: gameState.clock,
          venue: gameState.venue,
        },
        isDemo: true,
        message: `New event detected: ${currentEvent.description}`,
      })
    }

    // No new significant event
    return NextResponse.json({
      detected: false,
      currentEventId: currentEvent.id,
      game: {
        homeTeam: gameState.homeTeam,
        awayTeam: gameState.awayTeam,
        score: `${gameState.awayTeam.abbreviation} ${gameState.awayTeam.score} - ${gameState.homeTeam.abbreviation} ${gameState.homeTeam.score}`,
        quarter: gameState.quarter,
        clock: gameState.clock,
        lastPlay: currentEvent.description,
      },
      isDemo: true,
      message: isNewEvent 
        ? `Event occurred but not significant: ${currentEvent.type}`
        : 'No new events',
    })

  } catch (error) {
    console.error('Demo poll error:', error)
    return NextResponse.json(
      { detected: false, error: 'Poll failed', isDemo: true },
      { status: 500 }
    )
  }
}

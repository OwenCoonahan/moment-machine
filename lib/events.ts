/**
 * Event Types and Detection Logic for Blitz
 */

// Event types that trigger content generation
export type EventType =
  | 'TOUCHDOWN'
  | 'FIELD_GOAL'
  | 'INTERCEPTION'
  | 'FUMBLE'
  | 'SAFETY'
  | 'SACK'
  | 'BIG_PLAY'
  | 'PUNT'
  | 'KICKOFF'
  | 'TWO_POINT_CONVERSION'
  | 'HALFTIME'
  | 'GAME_START'
  | 'GAME_END'
  | 'PLAY'

// Priority levels for different event types
export const EVENT_PRIORITY: Record<EventType, number> = {
  TOUCHDOWN: 10,
  SAFETY: 9,
  INTERCEPTION: 8,
  FUMBLE: 8,
  FIELD_GOAL: 7,
  TWO_POINT_CONVERSION: 7,
  BIG_PLAY: 6,
  SACK: 5,
  HALFTIME: 4,
  GAME_START: 4,
  GAME_END: 4,
  PUNT: 2,
  KICKOFF: 2,
  PLAY: 1,
}

// Events worth generating content for
export const SIGNIFICANT_EVENTS: EventType[] = [
  'TOUCHDOWN',
  'FIELD_GOAL',
  'INTERCEPTION',
  'FUMBLE',
  'SAFETY',
  'BIG_PLAY',
  'TWO_POINT_CONVERSION',
  'HALFTIME',
  'GAME_START',
  'GAME_END',
]

export interface GameEvent {
  id: string
  type: EventType
  description: string
  team?: string
  teamFull?: string
  player?: string
  timestamp: string
  quarter: number
  clock: string
  homeScore: number
  awayScore: number
  confidence: number
}

export interface GameState {
  gameId: string
  status: 'pre' | 'in' | 'post'
  quarter: number
  clock: string
  homeTeam: {
    name: string
    abbreviation: string
    score: number
    logo?: string
  }
  awayTeam: {
    name: string
    abbreviation: string
    score: number
    logo?: string
  }
  venue?: string
  lastEvent?: GameEvent
}

/**
 * Parse play text to determine event type
 */
export function detectEventType(playText: string): EventType {
  const text = playText.toLowerCase()

  // Check for specific play types
  if (text.includes('touchdown') || text.includes(' td ') || text.includes('td!')) {
    return 'TOUCHDOWN'
  }
  if (text.includes('field goal') || text.includes('fg good') || text.includes('fg is good')) {
    return 'FIELD_GOAL'
  }
  if (text.includes('interception') || text.includes('intercepted') || text.includes(' int ')) {
    return 'INTERCEPTION'
  }
  if (text.includes('fumble') || text.includes('fumbled')) {
    return 'FUMBLE'
  }
  if (text.includes('safety')) {
    return 'SAFETY'
  }
  if (text.includes('sack') || text.includes('sacked')) {
    return 'SACK'
  }
  if (text.includes('two-point') || text.includes('two point') || text.includes('2-point')) {
    return 'TWO_POINT_CONVERSION'
  }
  if (text.includes('halftime') || text.includes('half time')) {
    return 'HALFTIME'
  }
  if (text.includes('punt')) {
    return 'PUNT'
  }
  if (text.includes('kickoff') || text.includes('kick off')) {
    return 'KICKOFF'
  }

  // Check for big plays (20+ yards)
  const yardMatch = text.match(/(\d+)\s*yard/i)
  if (yardMatch && parseInt(yardMatch[1]) >= 20) {
    return 'BIG_PLAY'
  }

  return 'PLAY'
}

/**
 * Check if an event is significant enough to generate content
 */
export function isSignificantEvent(eventType: EventType): boolean {
  return SIGNIFICANT_EVENTS.includes(eventType)
}

/**
 * Get human-readable event label
 */
export function getEventLabel(eventType: EventType): string {
  const labels: Record<EventType, string> = {
    TOUCHDOWN: '🏈 TOUCHDOWN',
    FIELD_GOAL: '🎯 FIELD GOAL',
    INTERCEPTION: '🔄 INTERCEPTION',
    FUMBLE: '💥 FUMBLE',
    SAFETY: '⚠️ SAFETY',
    SACK: '💪 SACK',
    BIG_PLAY: '🔥 BIG PLAY',
    PUNT: '👟 PUNT',
    KICKOFF: '🦵 KICKOFF',
    TWO_POINT_CONVERSION: '✌️ 2-PT CONVERSION',
    HALFTIME: '⏰ HALFTIME',
    GAME_START: '🏟️ GAME START',
    GAME_END: '🏆 GAME END',
    PLAY: '📋 PLAY',
  }
  return labels[eventType] || eventType
}

/**
 * Get content generation prompt modifier based on event type
 */
export function getEventMood(eventType: EventType): string {
  const moods: Record<EventType, string> = {
    TOUCHDOWN: 'excited, celebratory, high-energy',
    FIELD_GOAL: 'satisfied, precise, clutch',
    INTERCEPTION: 'dramatic, shocking, turning point',
    FUMBLE: 'chaotic, intense, game-changing',
    SAFETY: 'rare, exciting, unexpected',
    SACK: 'powerful, dominant, defensive',
    BIG_PLAY: 'explosive, thrilling, momentum-shifting',
    PUNT: 'strategic, field position',
    KICKOFF: 'anticipation, fresh start',
    TWO_POINT_CONVERSION: 'gutsy, bold, risky',
    HALFTIME: 'reflective, anticipatory',
    GAME_START: 'excited, fresh, ready',
    GAME_END: 'conclusive, emotional, final',
    PLAY: 'neutral, informative',
  }
  return moods[eventType] || 'neutral'
}

// ==========================================
// DEMO MODE - Simulated Super Bowl Events
// ==========================================

export interface DemoEvent extends GameEvent {
  isDemo: true
}

// Super Bowl LVII style demo events (Chiefs vs Eagles)
const DEMO_EVENTS: Omit<DemoEvent, 'id' | 'timestamp'>[] = [
  {
    type: 'GAME_START',
    description: 'Super Bowl LIX is underway! Chiefs vs Eagles at the Superdome.',
    team: 'NFL',
    quarter: 1,
    clock: '15:00',
    homeScore: 0,
    awayScore: 0,
    confidence: 1.0,
    isDemo: true,
  },
  {
    type: 'FIELD_GOAL',
    description: 'FIELD GOAL - Eagles - Jake Elliott, good from 47 yards! Eagles strike first.',
    team: 'PHI',
    teamFull: 'Philadelphia Eagles',
    player: 'Jake Elliott',
    quarter: 1,
    clock: '10:32',
    homeScore: 3,
    awayScore: 0,
    confidence: 0.98,
    isDemo: true,
  },
  {
    type: 'BIG_PLAY',
    description: 'BIG PLAY - 45 yard completion! Mahomes finds Kelce wide open at the 10 yard line!',
    team: 'KC',
    teamFull: 'Kansas City Chiefs',
    player: 'Travis Kelce',
    quarter: 1,
    clock: '6:14',
    homeScore: 3,
    awayScore: 0,
    confidence: 0.95,
    isDemo: true,
  },
  {
    type: 'TOUCHDOWN',
    description: 'TOUCHDOWN - Chiefs! Mahomes to Kelce, 15 yard pass! What a throw under pressure!',
    team: 'KC',
    teamFull: 'Kansas City Chiefs',
    player: 'Travis Kelce',
    quarter: 1,
    clock: '5:51',
    homeScore: 3,
    awayScore: 7,
    confidence: 0.99,
    isDemo: true,
  },
  {
    type: 'INTERCEPTION',
    description: 'INTERCEPTION! Hurts pass intercepted by Nick Bolton at the 35! Chiefs ball!',
    team: 'KC',
    teamFull: 'Kansas City Chiefs',
    player: 'Nick Bolton',
    quarter: 2,
    clock: '12:44',
    homeScore: 3,
    awayScore: 7,
    confidence: 0.97,
    isDemo: true,
  },
  {
    type: 'FUMBLE',
    description: 'FUMBLE! Isiah Pacheco loses the ball! Recovered by Eagles at the 30!',
    team: 'PHI',
    teamFull: 'Philadelphia Eagles',
    player: 'Eagles Defense',
    quarter: 2,
    clock: '8:22',
    homeScore: 3,
    awayScore: 7,
    confidence: 0.96,
    isDemo: true,
  },
  {
    type: 'TOUCHDOWN',
    description: 'TOUCHDOWN - Eagles! Jalen Hurts with the QB sneak from the 1! Eagles tie it up!',
    team: 'PHI',
    teamFull: 'Philadelphia Eagles',
    player: 'Jalen Hurts',
    quarter: 2,
    clock: '6:15',
    homeScore: 10,
    awayScore: 7,
    confidence: 0.99,
    isDemo: true,
  },
  {
    type: 'HALFTIME',
    description: 'HALFTIME - Eagles lead 10-7. Halftime show starting now!',
    quarter: 2,
    clock: '0:00',
    homeScore: 10,
    awayScore: 7,
    confidence: 1.0,
    isDemo: true,
  },
  {
    type: 'TOUCHDOWN',
    description: 'TOUCHDOWN - Chiefs! Rashee Rice with the 22 yard catch-and-run! Chiefs retake the lead!',
    team: 'KC',
    teamFull: 'Kansas City Chiefs',
    player: 'Rashee Rice',
    quarter: 3,
    clock: '9:33',
    homeScore: 10,
    awayScore: 14,
    confidence: 0.99,
    isDemo: true,
  },
  {
    type: 'SACK',
    description: 'SACK! Chris Jones brings down Hurts for a loss of 8 yards! Huge play!',
    team: 'KC',
    teamFull: 'Kansas City Chiefs',
    player: 'Chris Jones',
    quarter: 3,
    clock: '4:11',
    homeScore: 10,
    awayScore: 14,
    confidence: 0.94,
    isDemo: true,
  },
  {
    type: 'BIG_PLAY',
    description: 'BIG PLAY - A.J. Brown beats his man for a 38 yard gain! Eagles in Chiefs territory!',
    team: 'PHI',
    teamFull: 'Philadelphia Eagles',
    player: 'A.J. Brown',
    quarter: 4,
    clock: '11:22',
    homeScore: 10,
    awayScore: 14,
    confidence: 0.95,
    isDemo: true,
  },
  {
    type: 'FIELD_GOAL',
    description: 'FIELD GOAL - Eagles - Elliott from 32 yards, good! Eagles within one point!',
    team: 'PHI',
    teamFull: 'Philadelphia Eagles',
    player: 'Jake Elliott',
    quarter: 4,
    clock: '8:55',
    homeScore: 13,
    awayScore: 14,
    confidence: 0.98,
    isDemo: true,
  },
  {
    type: 'TOUCHDOWN',
    description: 'TOUCHDOWN - Chiefs! Mahomes scrambles, finds Xavier Worthy in the corner of the end zone! Incredible throw!',
    team: 'KC',
    teamFull: 'Kansas City Chiefs',
    player: 'Xavier Worthy',
    quarter: 4,
    clock: '2:17',
    homeScore: 13,
    awayScore: 21,
    confidence: 0.99,
    isDemo: true,
  },
  {
    type: 'GAME_END',
    description: 'FINAL - Kansas City Chiefs win Super Bowl LIX! Chiefs 21, Eagles 13. Three-peat complete!',
    quarter: 4,
    clock: '0:00',
    homeScore: 13,
    awayScore: 21,
    confidence: 1.0,
    isDemo: true,
  },
]

// Track demo state
let demoEventIndex = 0
let demoStartTime: number | null = null

/**
 * Get the current demo event based on elapsed time
 * Events advance every 15 seconds for demo purposes
 */
export function getCurrentDemoEvent(): DemoEvent {
  if (demoStartTime === null) {
    demoStartTime = Date.now()
  }

  const elapsed = Date.now() - demoStartTime
  const intervalMs = 15000 // 15 seconds per event for demo
  const currentIndex = Math.min(
    Math.floor(elapsed / intervalMs),
    DEMO_EVENTS.length - 1
  )

  const event = DEMO_EVENTS[currentIndex]
  return {
    ...event,
    id: `demo-${currentIndex}`,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Get the next demo event (advances the sequence)
 */
export function getNextDemoEvent(): DemoEvent {
  demoEventIndex = (demoEventIndex + 1) % DEMO_EVENTS.length
  const event = DEMO_EVENTS[demoEventIndex]
  return {
    ...event,
    id: `demo-${demoEventIndex}-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Reset demo to beginning
 */
export function resetDemo(): void {
  demoEventIndex = 0
  demoStartTime = null
}

/**
 * Get all demo events (for preview)
 */
export function getAllDemoEvents(): DemoEvent[] {
  return DEMO_EVENTS.map((event, index) => ({
    ...event,
    id: `demo-${index}`,
    timestamp: new Date().toISOString(),
  }))
}

/**
 * Get demo game state
 */
export function getDemoGameState(): GameState {
  const currentEvent = getCurrentDemoEvent()
  
  return {
    gameId: 'demo-superbowl-lix',
    status: currentEvent.type === 'GAME_END' ? 'post' : 'in',
    quarter: currentEvent.quarter,
    clock: currentEvent.clock,
    homeTeam: {
      name: 'Philadelphia Eagles',
      abbreviation: 'PHI',
      score: currentEvent.homeScore,
    },
    awayTeam: {
      name: 'Kansas City Chiefs',
      abbreviation: 'KC',
      score: currentEvent.awayScore,
    },
    venue: 'Caesars Superdome, New Orleans',
    lastEvent: currentEvent,
  }
}

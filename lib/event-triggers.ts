/**
 * Event Triggers - Custom event input for Blitz
 * Allows paste-in events or ESPN API integration
 */

export type CustomEventType = 'TOUCHDOWN' | 'FIELD_GOAL' | 'INTERCEPTION' | 'FUMBLE' | 'HALFTIME' | 'SAFETY' | 'BIG_PLAY' | 'OTHER'

export interface CustomGameEvent {
  id: string
  timestamp: string // e.g. "Q1 12:34" or "4:32"
  type: CustomEventType
  description: string
  team?: string
  raw?: string // Original text line
}

const STORAGE_KEY = 'moment-machine-custom-events'
const ESPN_ENABLED_KEY = 'moment-machine-espn-enabled'

/**
 * Parse event text into structured events
 * Supports formats:
 * - "Q1 12:30 - TOUCHDOWN - Chiefs - Mahomes to Kelce, 15 yards"
 * - "Q2 8:45 - FIELD_GOAL - Eagles - Elliott, 42 yards"
 * - "4:32 - INTERCEPTION - Chiefs - Bolton intercepts Hurts"
 * - "HALFTIME"
 */
export function parseEventText(text: string): CustomGameEvent[] {
  const lines = text.split('\n').filter(line => line.trim())
  const events: CustomGameEvent[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const event = parseSingleEvent(trimmed)
    if (event) {
      events.push(event)
    }
  }

  return events
}

function parseSingleEvent(line: string): CustomGameEvent | null {
  // Pattern: "Q1 12:30 - TOUCHDOWN - Chiefs - Description"
  // Or: "12:30 - TOUCHDOWN - Chiefs - Description"
  // Or: "HALFTIME"
  
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  
  // Check for simple keywords first
  const upperLine = line.toUpperCase()
  if (upperLine === 'HALFTIME' || upperLine.includes('HALFTIME')) {
    return {
      id,
      timestamp: 'Q2 0:00',
      type: 'HALFTIME',
      description: 'Halftime',
      raw: line,
    }
  }

  // Try to parse structured format
  // Match: "Q1 12:30 - TOUCHDOWN - Chiefs - Mahomes to Kelce"
  const fullPattern = /^(Q[1-4]\s*\d{1,2}:\d{2}|\d{1,2}:\d{2})\s*[-–]\s*(\w+)\s*[-–]\s*(\w+)\s*[-–]\s*(.+)$/i
  const matchFull = line.match(fullPattern)
  
  if (matchFull) {
    const [, timestamp, typeStr, team, description] = matchFull
    return {
      id,
      timestamp: normalizeTimestamp(timestamp),
      type: normalizeEventType(typeStr),
      team: team.trim(),
      description: description.trim(),
      raw: line,
    }
  }

  // Match: "Q1 12:30 - TOUCHDOWN - Mahomes to Kelce" (no team)
  const noTeamPattern = /^(Q[1-4]\s*\d{1,2}:\d{2}|\d{1,2}:\d{2})\s*[-–]\s*(\w+)\s*[-–]\s*(.+)$/i
  const matchNoTeam = line.match(noTeamPattern)
  
  if (matchNoTeam) {
    const [, timestamp, typeStr, description] = matchNoTeam
    return {
      id,
      timestamp: normalizeTimestamp(timestamp),
      type: normalizeEventType(typeStr),
      description: description.trim(),
      raw: line,
    }
  }

  // Match: "TOUCHDOWN - Chiefs - Description"
  const noTimePattern = /^(\w+)\s*[-–]\s*(\w+)\s*[-–]\s*(.+)$/i
  const matchNoTime = line.match(noTimePattern)
  
  if (matchNoTime) {
    const [, typeStr, team, description] = matchNoTime
    const eventType = normalizeEventType(typeStr)
    if (eventType !== 'OTHER') {
      return {
        id,
        timestamp: '',
        type: eventType,
        team: team.trim(),
        description: description.trim(),
        raw: line,
      }
    }
  }

  // Fallback: detect event type from description
  const detectedType = detectEventTypeFromText(line)
  if (detectedType !== 'OTHER') {
    return {
      id,
      timestamp: '',
      type: detectedType,
      description: line,
      raw: line,
    }
  }

  // If nothing matched, create OTHER event
  return {
    id,
    timestamp: '',
    type: 'OTHER',
    description: line,
    raw: line,
  }
}

function normalizeTimestamp(ts: string): string {
  // Ensure format is "Q1 12:34"
  const cleaned = ts.trim().toUpperCase()
  if (cleaned.startsWith('Q')) {
    return cleaned
  }
  return cleaned // Just the time
}

function normalizeEventType(typeStr: string): CustomEventType {
  const upper = typeStr.toUpperCase().trim()
  const validTypes: CustomEventType[] = ['TOUCHDOWN', 'FIELD_GOAL', 'INTERCEPTION', 'FUMBLE', 'HALFTIME', 'SAFETY', 'BIG_PLAY']
  
  // Handle common variations
  if (upper === 'TD') return 'TOUCHDOWN'
  if (upper === 'FG') return 'FIELD_GOAL'
  if (upper === 'INT') return 'INTERCEPTION'
  if (upper === 'FUM') return 'FUMBLE'
  if (upper.includes('FIELD') && upper.includes('GOAL')) return 'FIELD_GOAL'
  
  if (validTypes.includes(upper as CustomEventType)) {
    return upper as CustomEventType
  }
  
  return 'OTHER'
}

function detectEventTypeFromText(text: string): CustomEventType {
  const lower = text.toLowerCase()
  
  if (lower.includes('touchdown') || lower.includes(' td ')) return 'TOUCHDOWN'
  if (lower.includes('field goal') || lower.includes('fg ')) return 'FIELD_GOAL'
  if (lower.includes('interception') || lower.includes('intercepted') || lower.includes(' int ')) return 'INTERCEPTION'
  if (lower.includes('fumble')) return 'FUMBLE'
  if (lower.includes('halftime') || lower.includes('half time')) return 'HALFTIME'
  if (lower.includes('safety')) return 'SAFETY'
  
  // Big play detection (20+ yards)
  const yardMatch = text.match(/(\d+)\s*yard/i)
  if (yardMatch && parseInt(yardMatch[1]) >= 20) return 'BIG_PLAY'
  
  return 'OTHER'
}

/**
 * Get emoji for event type
 */
export function getEventEmoji(type: CustomEventType): string {
  const emojis: Record<CustomEventType, string> = {
    TOUCHDOWN: '🏈',
    FIELD_GOAL: '🎯',
    INTERCEPTION: '🔄',
    FUMBLE: '💥',
    HALFTIME: '⏰',
    SAFETY: '⚠️',
    BIG_PLAY: '🔥',
    OTHER: '📋',
  }
  return emojis[type]
}

// ==========================================
// LocalStorage Persistence
// ==========================================

/**
 * Get custom events from localStorage
 */
export function getCustomEvents(): CustomGameEvent[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Save custom events to localStorage
 */
export function saveCustomEvents(events: CustomGameEvent[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch (e) {
    console.error('Failed to save custom events:', e)
  }
}

/**
 * Clear custom events
 */
export function clearCustomEvents(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Check if ESPN mode is enabled
 */
export function isEspnEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ESPN_ENABLED_KEY) === 'true'
}

/**
 * Set ESPN mode
 */
export function setEspnEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ESPN_ENABLED_KEY, enabled ? 'true' : 'false')
}

/**
 * Convert CustomGameEvent to the format used by dashboard
 */
export function toGameEvent(event: CustomGameEvent): {
  type: string
  description: string
  timestamp: Date
  team?: string
} {
  return {
    type: event.type,
    description: event.description,
    timestamp: new Date(),
    team: event.team,
  }
}

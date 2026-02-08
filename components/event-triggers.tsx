'use client'

import { useState, useEffect } from 'react'
import { Zap, FileText, Radio, Trash2, Play, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import {
  CustomGameEvent,
  parseEventText,
  getCustomEvents,
  saveCustomEvents,
  clearCustomEvents,
  isEspnEnabled,
  setEspnEnabled,
  getEventEmoji,
  toGameEvent,
} from '@/lib/event-triggers'
import { GAME_EVENTS, DEMO_GAMES } from '@/lib/campaigns'

interface EventTriggersProps {
  onEventSelect?: (event: { type: string; description: string; timestamp: Date; team?: string }) => void
  currentEventId?: string
  compact?: boolean
}

export function EventTriggers({ onEventSelect, currentEventId, compact }: EventTriggersProps) {
  const [pasteText, setPasteText] = useState('')
  const [parsedEvents, setParsedEvents] = useState<CustomGameEvent[]>([])
  const [savedEvents, setSavedEvents] = useState<CustomGameEvent[]>([])
  const [espnEnabled, setEspnEnabledState] = useState(false)
  const [espnStatus, setEspnStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [parseError, setParseError] = useState('')

  // Load saved events and ESPN state on mount
  useEffect(() => {
    setSavedEvents(getCustomEvents())
    setEspnEnabledState(isEspnEnabled())
  }, [])

  const handleParse = () => {
    setParseError('')
    const events = parseEventText(pasteText)
    if (events.length === 0) {
      setParseError('No valid events found. Try format: "Q1 12:30 - TOUCHDOWN - Chiefs - Description"')
    }
    setParsedEvents(events)
  }

  const handleSave = () => {
    saveCustomEvents(parsedEvents)
    setSavedEvents(parsedEvents)
    setPasteText('')
    setParsedEvents([])
  }

  const handleClear = () => {
    clearCustomEvents()
    setSavedEvents([])
  }

  const handleEspnToggle = (enabled: boolean) => {
    setEspnEnabledState(enabled)
    setEspnEnabled(enabled)
    
    if (enabled) {
      setEspnStatus('connecting')
      // Simulate connection
      setTimeout(() => setEspnStatus('connected'), 1500)
    } else {
      setEspnStatus('idle')
    }
  }

  const handleEventClick = (event: CustomGameEvent) => {
    if (onEventSelect) {
      onEventSelect(toGameEvent(event))
    }
  }

  const sampleText = `Q1 12:30 - TOUCHDOWN - Chiefs - Mahomes to Kelce, 15 yards
Q1 8:45 - FIELD_GOAL - Eagles - Elliott, 42 yards
Q2 14:22 - INTERCEPTION - Chiefs - Bolton picks off Hurts
HALFTIME
Q3 10:15 - TOUCHDOWN - Eagles - Hurts rushing TD
Q4 2:30 - FUMBLE - Eagles - Pacheco forces turnover`

  if (compact) {
    return (
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Events ({savedEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {savedEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">No custom events loaded</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {savedEvents.slice(0, 5).map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors flex items-center gap-2 ${
                    currentEventId === event.id ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  <span>{getEventEmoji(event.type)}</span>
                  <span className="truncate flex-1">{event.description}</span>
                </button>
              ))}
              {savedEvents.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{savedEvents.length - 5} more
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Event Triggers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paste" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Paste Events
            </TabsTrigger>
            <TabsTrigger value="espn" className="text-xs gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              ESPN API
            </TabsTrigger>
          </TabsList>

          {/* Paste Events Tab */}
          <TabsContent value="paste" className="space-y-3">
            {/* Preset Game Selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Load preset game</Label>
              <select
                onChange={(e) => {
                  const gameId = e.target.value
                  if (gameId && GAME_EVENTS[gameId]) {
                    const events = GAME_EVENTS[gameId].map((evt, i) => ({
                      id: `${gameId}-${i}`,
                      timestamp: evt.timestamp,
                      type: evt.type as any,
                      description: evt.description,
                      team: evt.team,
                    }))
                    saveCustomEvents(events)
                    setSavedEvents(events)
                    setPasteText('')
                    setParsedEvents([])
                  }
                }}
                className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue=""
              >
                <option value="">Select a game...</option>
                {DEMO_GAMES.filter(g => GAME_EVENTS[g.id]).map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">— or paste custom events —</div>
            
            <div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={sampleText}
                className="w-full text-xs font-mono border border-input rounded-md px-3 py-2 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-background"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleParse} disabled={!pasteText.trim()}>
                Parse Events
              </Button>
              {parsedEvents.length > 0 && (
                <Button size="sm" variant="default" onClick={handleSave}>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Save ({parsedEvents.length})
                </Button>
              )}
            </div>

            {parseError && (
              <p className="text-xs text-red-500">{parseError}</p>
            )}

            {/* Parsed Events Preview */}
            {parsedEvents.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                {parsedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-muted"
                  >
                    <span>{getEventEmoji(event.type)}</span>
                    <Badge variant="outline" className="text-[10px] px-1">
                      {event.type}
                    </Badge>
                    {event.timestamp && (
                      <span className="text-muted-foreground font-mono">{event.timestamp}</span>
                    )}
                    {event.team && (
                      <span className="font-medium">{event.team}</span>
                    )}
                    <span className="truncate flex-1">{event.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Saved Events - Clickable Trigger Buttons */}
            {savedEvents.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Events Loaded ({savedEvents.length})
                  </span>
                  <Button size="sm" variant="ghost" onClick={handleClear} className="h-6 px-2 text-xs text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Click an event to trigger content generation:</p>
                <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                  {savedEvents.map((event, idx) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-md border transition-all hover:bg-primary/5 hover:border-primary/30 ${
                        currentEventId === event.id 
                          ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20' 
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <span className="text-base">{getEventEmoji(event.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.type}</span>
                          {event.team && <Badge variant="outline" className="text-[10px] px-1">{event.team}</Badge>}
                          {event.timestamp && <span className="text-muted-foreground font-mono">{event.timestamp}</span>}
                        </div>
                        <p className="text-muted-foreground truncate">{event.description}</p>
                      </div>
                      <Zap className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ESPN API Tab */}
          <TabsContent value="espn" className="space-y-4">
            {/* Game Selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Select Game</Label>
              <select
                className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue=""
              >
                <option value="">Select a live game...</option>
                <option value="sb60-seahawks-patriots">🏈 Super Bowl LX - Seahawks vs Patriots</option>
                <option value="super-bowl-lix">🏈 Super Bowl LIX - Chiefs vs Eagles</option>
                <option value="afc-championship">🏈 AFC Championship</option>
                <option value="nfc-championship">🏈 NFC Championship</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="espn-toggle" className="text-sm">Use Live ESPN Data</Label>
                <p className="text-xs text-muted-foreground">Auto-trigger on game events</p>
              </div>
              <Switch
                id="espn-toggle"
                checked={espnEnabled}
                onCheckedChange={handleEspnToggle}
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
              <div className={`w-2 h-2 rounded-full ${
                espnStatus === 'connected' ? 'bg-green-500' :
                espnStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                espnStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
              <span className="text-xs">
                {espnStatus === 'connected' && 'Connected - Listening for events'}
                {espnStatus === 'connecting' && 'Connecting to ESPN...'}
                {espnStatus === 'error' && 'Connection error'}
                {espnStatus === 'idle' && 'Not connected'}
              </span>
              {espnStatus === 'connecting' && (
                <Loader2 className="w-3 h-3 animate-spin ml-auto" />
              )}
            </div>

            {espnEnabled && espnStatus === 'connected' && (
              <div className="p-3 rounded-md border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <p className="text-xs text-green-700 dark:text-green-300">
                  ✓ Watching for touchdowns, interceptions, field goals...
                  <br />Content will auto-generate when events occur.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Event Playback Component for Dashboard
interface EventPlaybackProps {
  events: CustomGameEvent[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onEventSelect: (event: CustomGameEvent) => void
  isPlaying: boolean
  onPlayToggle: () => void
}

export function EventPlayback({
  events,
  currentIndex,
  onIndexChange,
  onEventSelect,
  isPlaying,
  onPlayToggle,
}: EventPlaybackProps) {
  if (events.length === 0) return null

  const currentEvent = events[currentIndex]

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Event Playback</CardTitle>
          <Badge variant="outline" className="text-xs">
            {currentIndex + 1} / {events.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {/* Current Event Display */}
        <div className="p-3 rounded-md bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getEventEmoji(currentEvent.type)}</span>
            <span className="font-medium text-sm">{currentEvent.type}</span>
            {currentEvent.team && (
              <Badge variant="secondary" className="text-xs">{currentEvent.team}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{currentEvent.description}</p>
          {currentEvent.timestamp && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">{currentEvent.timestamp}</p>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={isPlaying ? 'secondary' : 'default'}
            onClick={onPlayToggle}
            className="w-20"
          >
            <Play className={`w-4 h-4 mr-1 ${isPlaying ? 'animate-pulse' : ''}`} />
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onIndexChange(Math.min(events.length - 1, currentIndex + 1))}
            disabled={currentIndex === events.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Event List */}
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {events.map((event, idx) => (
            <button
              key={event.id}
              onClick={() => {
                onIndexChange(idx)
                onEventSelect(event)
              }}
              className={`w-full text-left flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                idx === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <span>{getEventEmoji(event.type)}</span>
              <span className="truncate flex-1">{event.description}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

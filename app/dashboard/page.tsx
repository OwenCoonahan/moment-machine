'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, ArrowLeft, Loader2, Upload, Palette, Globe,
  Image as ImageIcon, Video, Send, Clock, Settings,
  Sparkles, Bomb, ChevronRight, ExternalLink, Users, Plus, TrendingUp
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

// Campaign & Avatar imports
import { 
  Campaign, getCampaigns, getActiveCampaign, setActiveCampaign as setActiveStoredCampaign,
  getActiveCampaignId, incrementCampaignContentCount, GAME_EVENTS
} from '@/lib/campaigns'
import { Avatar, getAvatars, incrementAvatarContentCount, getAvatarPlaceholder } from '@/lib/avatars'
import { CampaignList, CampaignCard, AddCampaignCard } from '@/components/campaign-card'
import { AvatarCard, AddAvatarCard } from '@/components/avatar-card'
import { CampaignModal } from '@/components/campaign-modal'
import { AvatarModal } from '@/components/avatar-modal'

// Bot/Markets imports
import { BotProfile, BOTS, MARKETS, getBotsWithStats, getLeaderboard, simulateBotReactions, Trade, getRecentTrades, seedDemoTrades } from '@/lib/bots'
import { BotCard } from '@/components/bot-card'
import { TradeFeed } from '@/components/trade-feed'

// Posting modal
import { PostModal } from '@/components/post-modal'

// Event Triggers
import { EventTriggers, EventPlayback } from '@/components/event-triggers'
import { 
  CustomGameEvent, 
  getCustomEvents, 
  toGameEvent, 
  getEventEmoji 
} from '@/lib/event-triggers'

interface ContentItem {
  id: string
  type: 'image' | 'video' | 'text'
  status: 'generating' | 'ready' | 'scheduled' | 'posted'
  url?: string
  caption?: string
  platform?: string
  model?: string
  avatarId?: string
}

interface Brand {
  name: string
  domain: string
  colors: string[]
  industry: string
  logo?: string
  loaded: boolean
}

interface GameEvent {
  type: string
  description: string
  timestamp: Date
  team?: string
}

interface GameStatus {
  homeTeam: { name: string; abbreviation: string; score: number }
  awayTeam: { name: string; abbreviation: string; score: number }
  period: number
  clock: string
}

const MODELS = [
  { id: 'flux-schnell', name: 'Flux Schnell', type: 'image', speed: 'Fast', estSeconds: 3 },
  { id: 'flux-pro', name: 'Flux Pro', type: 'image', speed: 'Quality', estSeconds: 8 },
  { id: 'grok-image', name: 'Grok Image', type: 'image', speed: 'Fast', estSeconds: 5 },
  { id: 'kling-video', name: 'Kling Video', type: 'video', speed: '~45s', estSeconds: 45 },
]

const ASPECT_RATIOS = [
  { id: 'square_hd', name: 'Square', ratio: '1:1' },
  { id: 'landscape_16_9', name: 'Wide', ratio: '16:9' },
  { id: 'portrait_9_16', name: 'Story', ratio: '9:16' },
]

function extractBrandFromUrl(url: string): Brand {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const domain = urlObj.hostname.replace('www.', '')
    const brandName = domain.split('.')[0]
    
    const knownBrands: Record<string, Partial<Brand>> = {
      // Major restaurant chains
      'chipotle': { name: 'Chipotle', colors: ['#441500', '#A81612', '#F5F0EB'], industry: 'Restaurant' },
      'dominos': { name: "Domino's", colors: ['#006491', '#E31837', '#FFFFFF'], industry: 'Restaurant' },
      'wingstop': { name: 'Wingstop', colors: ['#024731', '#FFD100', '#FFFFFF'], industry: 'Restaurant' },
      'buffalowildwings': { name: 'Buffalo Wild Wings', colors: ['#FFB612', '#000000', '#FFFFFF'], industry: 'Restaurant' },
      'bww': { name: 'Buffalo Wild Wings', colors: ['#FFB612', '#000000', '#FFFFFF'], industry: 'Restaurant' },
      'papajohns': { name: "Papa John's", colors: ['#006341', '#ED1C24', '#FFFFFF'], industry: 'Restaurant' },
      'pizzahut': { name: 'Pizza Hut', colors: ['#EE3A43', '#00A65E', '#FFFFFF'], industry: 'Restaurant' },
      'wendys': { name: "Wendy's", colors: ['#E2203B', '#199FDA', '#FFFFFF'], industry: 'Restaurant' },
      'tacobell': { name: 'Taco Bell', colors: ['#702082', '#FF5A00', '#FFFFFF'], industry: 'Restaurant' },
      'mcdonalds': { name: "McDonald's", colors: ['#FFC72C', '#DA291C', '#FFFFFF'], industry: 'Restaurant' },
      'burgerking': { name: 'Burger King', colors: ['#D62300', '#F5EBDC', '#0033A0'], industry: 'Restaurant' },
      'popeyes': { name: 'Popeyes', colors: ['#F15A29', '#E35205', '#FFFFFF'], industry: 'Restaurant' },
      'chilis': { name: "Chili's", colors: ['#00704A', '#E31837', '#FFFFFF'], industry: 'Restaurant' },
      'applebees': { name: "Applebee's", colors: ['#C8102E', '#000000', '#FFFFFF'], industry: 'Restaurant' },
      'hooters': { name: 'Hooters', colors: ['#F36C21', '#583224', '#FFFFFF'], industry: 'Restaurant' },
      'bdubs': { name: 'Buffalo Wild Wings', colors: ['#FFB612', '#000000', '#FFFFFF'], industry: 'Restaurant' },
      'jerseysmikes': { name: "Jersey Mike's", colors: ['#003B5C', '#CE1126', '#FFFFFF'], industry: 'Restaurant' },
      'fiveguys': { name: 'Five Guys', colors: ['#C8102E', '#FFFFFF', '#000000'], industry: 'Restaurant' },
      'shakeshack': { name: 'Shake Shack', colors: ['#1F3D0C', '#FFFFFF', '#000000'], industry: 'Restaurant' },
      // Legacy brands
      'nike': { name: 'Nike', colors: ['#111111', '#FFFFFF', '#F5F5F5'], industry: 'Sportswear' },
      'cocacola': { name: 'Coca-Cola', colors: ['#F40009', '#FFFFFF', '#000000'], industry: 'Beverage' },
    }
    
    const known = knownBrands[brandName.toLowerCase()]
    return {
      name: known?.name || brandName.charAt(0).toUpperCase() + brandName.slice(1),
      domain,
      colors: known?.colors || ['#18181b', '#f4f4f5', '#ffffff'],
      industry: known?.industry || 'Business',
      loaded: true
    }
  } catch {
    return { name: '', domain: '', colors: [], industry: '', loaded: false }
  }
}

function DashboardContent() {
  const searchParams = useSearchParams()
  
  // State
  const [businessUrl, setBusinessUrl] = useState('')
  const [brand, setBrand] = useState<Brand>({ name: '', domain: '', colors: [], industry: '', loaded: false })
  const [selectedModel, setSelectedModel] = useState('flux-schnell')
  const [aspectRatio, setAspectRatio] = useState('square_hd')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0) // seconds elapsed
  const [generationEstimate, setGenerationEstimate] = useState(0) // estimated total seconds
  const [content, setContent] = useState<ContentItem[]>([])
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [latency, setLatency] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null)
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  
  // Campaign & Avatar state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [campaignAvatars, setCampaignAvatars] = useState<Avatar[]>([])
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)
  
  // Sidebar view state
  const [sidebarView, setSidebarView] = useState<'campaigns' | 'settings'>('campaigns')
  
  // Posting modal state
  const [showPostModal, setShowPostModal] = useState(false)
  const [contentToPost, setContentToPost] = useState<ContentItem | null>(null)
  
  // Custom events state
  const [customEvents, setCustomEvents] = useState<CustomGameEvent[]>([])
  const [customEventIndex, setCustomEventIndex] = useState(0)
  const [isEventPlaying, setIsEventPlaying] = useState(false)
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)

  // Load campaigns and avatars
  useEffect(() => {
    setCampaigns(getCampaigns())
    setAvatars(getAvatars())
    
    const stored = getActiveCampaign()
    if (stored) {
      setActiveCampaign(stored)
      setBrand({
        name: stored.brandInfo.name,
        domain: stored.brandInfo.domain || '',
        colors: stored.brandInfo.colors,
        industry: stored.brandInfo.industry,
        loaded: true
      })
    }
    
    // Load custom events
    setCustomEvents(getCustomEvents())
  }, [])
  
  // Auto-advance event playback
  useEffect(() => {
    if (!isEventPlaying || customEvents.length === 0) return
    
    const timer = setInterval(() => {
      setCustomEventIndex(prev => {
        const next = prev + 1
        if (next >= customEvents.length) {
          setIsEventPlaying(false)
          return prev
        }
        // Trigger the event
        const event = customEvents[next]
        setCurrentEvent({
          type: event.type,
          description: event.description,
          team: event.team,
          timestamp: new Date()
        })
        setCurrentEventId(event.id)
        return next
      })
    }, 5000) // 5 seconds per event in playback mode
    
    return () => clearInterval(timer)
  }, [isEventPlaying, customEvents])
  
  // Update campaign avatars when active campaign changes
  useEffect(() => {
    if (activeCampaign) {
      const campaignAvatarList = avatars.filter(a => 
        activeCampaign.avatarIds.includes(a.id)
      )
      setCampaignAvatars(campaignAvatarList)
    } else {
      setCampaignAvatars([])
    }
  }, [activeCampaign, avatars])

  // Load brand from URL param
  useEffect(() => {
    const url = searchParams.get('url')
    if (url) {
      setBusinessUrl(url)
      const extractedBrand = extractBrandFromUrl(url)
      setBrand(extractedBrand)
      
      // Auto-show campaign modal if we have a brand but no active campaign
      if (extractedBrand.loaded && !getActiveCampaignId()) {
        setShowCampaignModal(true)
      }
    }
  }, [searchParams])

  // Poll ESPN when auto-generate is on
  useEffect(() => {
    if (!autoGenerate || !activeCampaign) return
    
    const pollGame = async () => {
      try {
        const endpoint = activeCampaign.gameId === 'demo' ? '/api/espn/demo' : '/api/espn'
        const res = await fetch(endpoint)
        const data = await res.json()
        
        if (data.activeGames?.length > 0) {
          const game = data.activeGames[0]
          setGameStatus({
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            period: game.period,
            clock: game.clock
          })
          
          if (game.lastPlay && ['TOUCHDOWN', 'INTERCEPTION', 'FUMBLE', 'BIG_PLAY'].includes(game.lastPlay.type)) {
            setCurrentEvent({
              type: game.lastPlay.type,
              description: game.lastPlay.description,
              team: game.lastPlay.team,
              timestamp: new Date()
            })
          }
        }
      } catch (e) {
        console.error('ESPN poll error:', e)
      }
    }
    
    pollGame()
    const interval = setInterval(pollGame, 10000)
    return () => clearInterval(interval)
  }, [autoGenerate, activeCampaign])

  // Generation progress timer
  useEffect(() => {
    if (!isGenerating) {
      setGenerationProgress(0)
      return
    }
    
    const timer = setInterval(() => {
      setGenerationProgress(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isGenerating])

  const handleAddBrand = () => {
    if (!businessUrl) return
    const extracted = extractBrandFromUrl(businessUrl)
    setBrand(extracted)
    
    // Open campaign modal with brand pre-filled
    if (extracted.loaded) {
      setShowCampaignModal(true)
    }
  }
  
  const handleSelectCampaign = (campaign: Campaign) => {
    setActiveCampaign(campaign)
    setActiveStoredCampaign(campaign.id)
    setBrand({
      name: campaign.brandInfo.name,
      domain: campaign.brandInfo.domain || '',
      colors: campaign.brandInfo.colors,
      industry: campaign.brandInfo.industry,
      loaded: true
    })
    
    // Load predefined game events if available
    const gameId = campaign.gameId
    if (gameId && GAME_EVENTS[gameId]) {
      const events = GAME_EVENTS[gameId].map((e, i) => ({
        id: `${gameId}-${i}`,
        timestamp: e.timestamp,
        type: e.type as any,
        description: e.description,
        team: e.team,
      }))
      setCustomEvents(events)
      setCustomEventIndex(0)
      if (events.length > 0) {
        setCurrentEvent({
          type: events[0].type,
          description: events[0].description,
          team: events[0].team,
          timestamp: new Date()
        })
      }
    }
  }
  
  const handleCampaignCreated = (campaign: Campaign) => {
    setCampaigns(getCampaigns())
    setAvatars(getAvatars())
    handleSelectCampaign(campaign)
  }
  
  const handleCampaignDeleted = (id: string) => {
    setCampaigns(getCampaigns())
    if (activeCampaign?.id === id) {
      setActiveCampaign(null)
      setBrand({ name: '', domain: '', colors: [], industry: '', loaded: false })
    }
  }
  
  const handleAvatarCreated = (avatar: Avatar) => {
    setAvatars(getAvatars())
  }
  
  const handleAvatarDeleted = (id: string) => {
    setAvatars(getAvatars())
    if (selectedAvatar?.id === id) {
      setSelectedAvatar(null)
    }
  }
  
  const handleGenerateForAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar)
    generateStudio(avatar)
  }
  
  const handlePostContent = (item: ContentItem) => {
    setContentToPost(item)
    setShowPostModal(true)
  }
  
  const handleCustomEventSelect = (event: { type: string; description: string; timestamp: Date; team?: string }) => {
    setCurrentEvent({
      type: event.type,
      description: event.description,
      team: event.team,
      timestamp: event.timestamp
    })
    // Find the event ID if it's a custom event
    const customEvent = customEvents.find(e => e.description === event.description)
    if (customEvent) {
      setCurrentEventId(customEvent.id)
      setCustomEventIndex(customEvents.indexOf(customEvent))
    }
  }
  
  const handleCustomEventPlaybackSelect = (event: CustomGameEvent) => {
    setCurrentEvent({
      type: event.type,
      description: event.description,
      team: event.team,
      timestamp: new Date()
    })
    setCurrentEventId(event.id)
  }
  
  const refreshCustomEvents = () => {
    setCustomEvents(getCustomEvents())
  }

  // Studio mode - high quality generation
  const generateStudio = async (avatar?: Avatar) => {
    if (!brand.loaded) return
    
    // Set estimated time based on model
    const modelConfig = MODELS.find(m => m.id === selectedModel)
    setGenerationEstimate(modelConfig?.estSeconds || 10)
    setGenerationProgress(0)
    setIsGenerating(true)
    const startTime = Date.now()
    
    const event = currentEvent || {
      type: 'TOUCHDOWN',
      description: 'Demo touchdown event',
      timestamp: new Date()
    }
    
    // Build prompt with avatar personality if selected
    let basePrompt = prompt || `Professional marketing content for ${brand.name}, a ${brand.industry.toLowerCase()} brand. Event: ${event.type}`
    
    if (avatar) {
      basePrompt = `${basePrompt}. Character: ${avatar.name} - ${avatar.personality}. Voice: ${avatar.voiceStyle}.`
      if (avatar.brandPlacements?.length) {
        basePrompt += ` Include: ${avatar.brandPlacements.join(', ')}.`
      }
    }
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: basePrompt,
          model: selectedModel,
          aspectRatio,
          numImages: 4,
          brand: { name: brand.name, industry: brand.industry, colors: brand.colors },
          event
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.content) {
        const newItems: ContentItem[] = data.content.map((item: { url: string }, i: number) => ({
          id: `studio-${Date.now()}-${i}`,
          type: selectedModel.includes('video') ? 'video' : 'image',
          status: 'ready',
          url: item.url,
          model: selectedModel,
          caption: `${event.type}! ${brand.name} 🏈${avatar ? ` - ${avatar.name}` : ''}`,
          platform: ['Instagram', 'Twitter', 'TikTok', 'Facebook'][i % 4],
          avatarId: avatar?.id
        }))
        
        setContent(prev => [...newItems, ...prev])
        
        // Update counts
        if (activeCampaign) {
          incrementCampaignContentCount(activeCampaign.id, newItems.length)
        }
        if (avatar) {
          incrementAvatarContentCount(avatar.id)
          setAvatars(getAvatars()) // Refresh
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
    }
    
    setLatency(Math.round((Date.now() - startTime) / 1000))
    setIsGenerating(false)
  }

  // Nuke mode - mass generation
  const triggerNuke = async () => {
    if (!brand.loaded) return
    
    setIsGenerating(true)
    const startTime = Date.now()
    
    const event = currentEvent || {
      type: 'TOUCHDOWN', 
      description: 'Demo event',
      timestamp: new Date()
    }
    
    // Generate batch with API
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Quick marketing content for ${brand.name}: ${event.type} moment`,
          model: 'flux-schnell',
          aspectRatio: 'square_hd',
          numImages: 4,
          brand: { name: brand.name, industry: brand.industry },
          event
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.content) {
        const realItems: ContentItem[] = data.content.map((item: { url: string }, i: number) => ({
          id: `nuke-real-${Date.now()}-${i}`,
          type: 'image',
          status: 'ready',
          url: item.url,
          model: 'flux-schnell',
          caption: `${event.type}! ${brand.name} 🏈`,
          platform: ['Instagram', 'Twitter', 'TikTok', 'Facebook'][i % 4]
        }))
        
        setContent(prev => [...realItems, ...prev])
        
        if (activeCampaign) {
          incrementCampaignContentCount(activeCampaign.id, realItems.length)
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
    }
    
    // Simulate additional items for demo
    const additionalCount = 96
    for (let i = 0; i < additionalCount; i += 24) {
      await new Promise(r => setTimeout(r, 50))
      
      const batch: ContentItem[] = Array(Math.min(24, additionalCount - i)).fill(null).map((_, j) => ({
        id: `nuke-sim-${Date.now()}-${i + j}`,
        type: Math.random() > 0.3 ? 'image' : 'video',
        status: 'ready',
        caption: `${event.type}! ${brand.name} 🏈`,
        platform: ['Instagram', 'Twitter', 'TikTok', 'Facebook'][Math.floor(Math.random() * 4)],
        model: 'flux-schnell'
      }))
      
      setContent(prev => [...batch, ...prev])
    }
    
    if (activeCampaign) {
      incrementCampaignContentCount(activeCampaign.id, additionalCount)
    }
    
    setLatency(Math.round((Date.now() - startTime) / 1000))
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="font-medium text-sm">Moment Machine</span>
          </div>
          {activeCampaign && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{activeCampaign.name}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {gameStatus && (
            <div className="text-xs text-muted-foreground font-mono">
              {gameStatus.awayTeam.abbreviation} {gameStatus.awayTeam.score} - {gameStatus.homeTeam.abbreviation} {gameStatus.homeTeam.score} • Q{gameStatus.period} {gameStatus.clock}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch 
              id="auto-generate" 
              checked={autoGenerate} 
              onCheckedChange={setAutoGenerate}
              disabled={!activeCampaign}
            />
            <Label htmlFor="auto-generate" className="text-sm cursor-pointer">
              {autoGenerate ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto
                </span>
              ) : 'Manual'}
            </Label>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 border-r min-h-[calc(100vh-3.5rem)] p-4 space-y-4 overflow-y-auto">
          {/* Campaigns Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                Campaigns
              </div>
            </div>
            
            <CampaignList
              campaigns={campaigns}
              activeCampaignId={activeCampaign?.id || null}
              onSelect={handleSelectCampaign}
              onDelete={handleCampaignDeleted}
              onAddNew={() => setShowCampaignModal(true)}
            />
          </div>
          
          <Separator />
          
          {/* Avatars Section (only show if campaign selected) */}
          {activeCampaign && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    Avatars
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                {campaignAvatars.length === 0 ? (
                  <Card 
                    className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <CardContent className="flex flex-col items-center justify-center py-6 text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="h-5 w-5 mb-1" />
                      <span className="text-xs">Add Avatar</span>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {campaignAvatars.map(avatar => (
                      <AvatarCard
                        key={avatar.id}
                        avatar={avatar}
                        compact
                        onGenerate={handleGenerateForAvatar}
                        onDelete={handleAvatarDeleted}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
            </>
          )}

          {/* Model Selection - Only show if campaign active */}
          {activeCampaign && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Model
                </div>
                <div className="space-y-1">
                  {MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedModel === model.id
                          ? 'bg-foreground text-background'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span>{model.name}</span>
                      <span className={`text-xs ${selectedModel === model.id ? 'text-background/70' : 'text-muted-foreground'}`}>
                        {model.type} • {model.speed}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Aspect Ratio
                </div>
                <div className="flex gap-2">
                  {ASPECT_RATIOS.map(ar => (
                    <button
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id)}
                      className={`flex-1 py-2 text-xs rounded-md border transition-colors ${
                        aspectRatio === ar.id
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      {ar.ratio}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Prompt */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Custom Prompt
                </div>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe the content you want, or leave blank for auto-generated prompts..."
                  className="w-full text-sm border border-input rounded-md px-3 py-2 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                />
              </div>
            </>
          )}

          {/* Event indicator */}
          {currentEvent && (
            <>
              <Separator />
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    {currentEvent.type}
                  </div>
                  <p className="text-xs text-amber-600">{currentEvent.description}</p>
                </CardContent>
              </Card>
            </>
          )}

          <Separator />

          {/* Event Triggers Section */}
          {activeCampaign && (
            <>
              <EventTriggers
                onEventSelect={handleCustomEventSelect}
                currentEventId={currentEventId || undefined}
              />
              
              {/* Event Playback - show when custom events are loaded */}
              {customEvents.length > 0 && (
                <EventPlayback
                  events={customEvents}
                  currentIndex={customEventIndex}
                  onIndexChange={setCustomEventIndex}
                  onEventSelect={handleCustomEventPlaybackSelect}
                  isPlaying={isEventPlaying}
                  onPlayToggle={() => setIsEventPlaying(!isEventPlaying)}
                />
              )}
              
              <Separator />
              
              {/* Quick Demo Events - Always available */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  Quick Events
                </div>
                <div className="space-y-1">
                  {[
                    { type: 'TOUCHDOWN', label: '🏈 Touchdown', team: 'KC' },
                    { type: 'INTERCEPTION', label: '🔄 Interception', team: 'PHI' },
                    { type: 'FUMBLE', label: '💥 Fumble', team: 'KC' },
                    { type: 'FIELD_GOAL', label: '🥅 Field Goal', team: 'PHI' },
                    { type: 'HALFTIME', label: '⏸️ Halftime', team: '' },
                  ].map(event => (
                    <button
                      key={event.type}
                      onClick={() => {
                        setCurrentEvent({
                          type: event.type,
                          description: `${event.label} - ${event.team || 'Super Bowl LX'}`,
                          team: event.team,
                          timestamp: new Date()
                        })
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                    >
                      {event.label}
                    </button>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => generateStudio(selectedAvatar || undefined)}
                  disabled={!currentEvent || isGenerating}
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Generate from Event
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Settings link */}
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
              <Settings className="w-4 h-4" />
              Settings
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {!activeCampaign ? (
            // No campaign selected state
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Campaign Selected</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create a campaign to start generating content for your brand.
              </p>
              <Button onClick={() => setShowCampaignModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="studio" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="studio" className="gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Studio
                  </TabsTrigger>
                  <TabsTrigger value="nuke" className="gap-1.5">
                    <Bomb className="w-3.5 h-3.5" />
                    Nuke
                  </TabsTrigger>
                  <TabsTrigger value="avatars" className="gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Avatars
                  </TabsTrigger>
                  <TabsTrigger value="markets" className="gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Markets
                  </TabsTrigger>
                </TabsList>

                {/* Stats */}
                <div className="flex gap-4">
                  {[
                    { label: 'Generated', value: content.length },
                    { label: 'Latency', value: `${latency}s` },
                    { label: 'Queued', value: content.filter(c => c.status === 'scheduled').length },
                  ].map(stat => (
                    <div key={stat.label} className="text-right">
                      <div className="text-2xl font-semibold font-mono">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Studio Tab */}
              <TabsContent value="studio" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">High-Quality Generation</h2>
                    <p className="text-sm text-muted-foreground">Create polished, brand-aligned content</p>
                  </div>
                  <Button 
                    onClick={() => generateStudio(selectedAvatar || undefined)}
                    disabled={!brand.loaded || isGenerating}
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {generationProgress}s / ~{generationEstimate}s
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>

                {/* Content Grid - Studio */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {content.filter(item => item.url).length === 0 ? (
                    <div className="col-span-full border border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm">No content yet</p>
                      <p className="text-xs">Click Generate to create content</p>
                    </div>
                  ) : (
                    content.filter(item => item.url).slice(0, 12).map(item => (
                      <Card key={item.id} className="overflow-hidden group">
                        <div className="aspect-square bg-muted relative">
                          {item.url ? (
                            <img 
                              src={item.url} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.type === 'video' ? (
                                <Video className="w-8 h-8 text-muted-foreground/30" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-8"
                              onClick={() => handlePostContent(item)}
                            >
                              <Send className="w-3.5 h-3.5 mr-1" />
                              Post
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              Schedule
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                            <span className="text-xs text-muted-foreground capitalize">{item.model?.replace('-', ' ')}</span>
                          </div>
                          <p className="text-sm truncate">{item.caption}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Nuke Tab */}
              <TabsContent value="nuke" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Mass Generation</h2>
                    <p className="text-sm text-muted-foreground">Generate hundreds of content pieces instantly</p>
                  </div>
                  <Button 
                    onClick={triggerNuke}
                    disabled={!brand.loaded || isGenerating}
                    variant="destructive"
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Bomb className="w-4 h-4" />
                        Launch Nuke
                      </>
                    )}
                  </Button>
                </div>

                {/* Nuke Grid */}
                <Card>
                  <CardContent className="p-4">
                    {content.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                        <Bomb className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm">Ready to launch</p>
                        <p className="text-xs">Generate 100+ pieces in seconds</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-1 max-h-80 overflow-y-auto">
                          {content.slice(0, 160).map((item) => (
                            <div
                              key={item.id}
                              className="aspect-square rounded bg-muted overflow-hidden"
                            >
                              {item.url ? (
                                <img 
                                  src={item.url} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {item.type === 'video' ? (
                                    <Video className="w-2.5 h-2.5 text-blue-400" />
                                  ) : (
                                    <ImageIcon className="w-2.5 h-2.5 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {content.length > 160 && (
                            <div className="aspect-square rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                              +{content.length - 160}
                            </div>
                          )}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {content.length} pieces generated
                          </div>
                          <Button className="gap-2">
                            <Send className="w-4 h-4" />
                            Deploy All
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Avatars Tab */}
              <TabsContent value="avatars" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">AI Avatars</h2>
                    <p className="text-sm text-muted-foreground">Manage your AI characters for content generation</p>
                  </div>
                  <Button onClick={() => setShowAvatarModal(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Avatar
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AddAvatarCard onClick={() => setShowAvatarModal(true)} />
                  
                  {campaignAvatars.map(avatar => (
                    <AvatarCard
                      key={avatar.id}
                      avatar={avatar}
                      onGenerate={handleGenerateForAvatar}
                      onDelete={handleAvatarDeleted}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Markets Tab */}
              <TabsContent value="markets" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Prediction Markets</h2>
                    <p className="text-sm text-muted-foreground">PizzaShack bots trading on Super Bowl markets</p>
                  </div>
                  <Button 
                    onClick={async () => {
                      const events = ['TOUCHDOWN', 'INTERCEPTION', 'FUMBLE', 'BIG_PLAY']
                      const randomEvent = events[Math.floor(Math.random() * events.length)]
                      try {
                        await fetch('/api/bots/trade', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'simulate', eventType: randomEvent, team: Math.random() > 0.5 ? 'KC' : 'PHI' })
                        })
                      } catch (e) { console.error('Simulate error:', e) }
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Simulate Event
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Super Bowl Markets */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Super Bowl LIX Markets
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {MARKETS.map(market => (
                          <div key={market.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{market.name}</p>
                              <p className="text-xs text-muted-foreground">Vol: ${(market.volume / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold font-mono">{(market.currentPrice * 100).toFixed(0)}¢</p>
                              <p className="text-xs text-muted-foreground">{(market.currentPrice * 100).toFixed(0)}% odds</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    {/* Trade Feed */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Live Trade Feed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TradeFeed trades={getRecentTrades(10)} showComments />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: PizzaShack Stats */}
                  <div className="space-y-4">
                    {/* Activity Stats */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          🍕 PizzaShack Bot Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold font-mono">64</p>
                            <p className="text-xs text-muted-foreground">Total Trades</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold font-mono">142</p>
                            <p className="text-xs text-muted-foreground">Comments</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold font-mono">12.4K</p>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold font-mono text-emerald-600">+$9.6K</p>
                            <p className="text-xs text-muted-foreground">Total P&L</p>
                          </div>
                        </div>
                        
                        {/* Simple Activity Chart */}
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-2">Activity (last 8 events)</p>
                          <div className="flex items-end gap-1 h-16">
                            {[3, 5, 2, 8, 4, 6, 9, 7].map((val, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                                style={{ height: `${val * 10}%` }}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Q1</span>
                            <span>Q2</span>
                            <span>Q3</span>
                            <span>Q4</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Leaderboard */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Bot Leaderboard</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {getLeaderboard().slice(0, 3).map((bot, i) => (
                          <div key={bot.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                            <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                            <span className="text-lg">{bot.avatar}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{bot.name}</p>
                              <p className="text-xs text-muted-foreground">{bot.winRate.toFixed(0)}% win</p>
                            </div>
                            <span className={`text-sm font-mono ${bot.totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {bot.totalPnL >= 0 ? '+' : ''}${bot.totalPnL.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
      
      {/* Modals */}
      <CampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCreated={handleCampaignCreated}
        initialBrand={brand.loaded ? {
          name: brand.name,
          domain: brand.domain,
          colors: brand.colors,
          industry: brand.industry
        } : undefined}
      />
      
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onCreated={handleAvatarCreated}
        brandName={brand.name}
      />
      
      <PostModal
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false)
          setContentToPost(null)
        }}
        content={contentToPost}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

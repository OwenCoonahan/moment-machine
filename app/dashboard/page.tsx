'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Zap, ArrowLeft, Loader2, Upload, Palette, Globe,
  Image as ImageIcon, Video, Send, Clock, Settings,
  Sparkles, Bomb, ChevronRight, ExternalLink
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface ContentItem {
  id: string
  type: 'image' | 'video' | 'text'
  status: 'generating' | 'ready' | 'scheduled' | 'posted'
  url?: string
  caption?: string
  platform?: string
  model?: string
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
  { id: 'flux-schnell', name: 'Flux Schnell', type: 'image', speed: 'Fast' },
  { id: 'flux-pro', name: 'Flux Pro', type: 'image', speed: 'Quality' },
  { id: 'grok-image', name: 'Grok Image', type: 'image', speed: 'Fast' },
  { id: 'kling-video', name: 'Kling Video', type: 'video', speed: 'Slow' },
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
      'chipotle': { name: 'Chipotle', colors: ['#441500', '#A81612', '#F5F0EB'], industry: 'Restaurant' },
      'dominos': { name: "Domino's", colors: ['#006491', '#E31837', '#FFFFFF'], industry: 'Restaurant' },
      'wingstop': { name: 'Wingstop', colors: ['#024731', '#FFD100', '#FFFFFF'], industry: 'Restaurant' },
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
  const [content, setContent] = useState<ContentItem[]>([])
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [latency, setLatency] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null)
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)

  // Load brand from URL param
  useEffect(() => {
    const url = searchParams.get('url')
    if (url) {
      setBusinessUrl(url)
      setBrand(extractBrandFromUrl(url))
    }
  }, [searchParams])

  // Poll ESPN when auto-generate is on
  useEffect(() => {
    if (!autoGenerate) return
    
    const pollGame = async () => {
      try {
        const res = await fetch('/api/espn')
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
  }, [autoGenerate])

  const handleAddBrand = () => {
    if (!businessUrl) return
    setBrand(extractBrandFromUrl(businessUrl))
  }

  // Studio mode - high quality generation
  const generateStudio = async () => {
    if (!brand.loaded) return
    
    setIsGenerating(true)
    const startTime = Date.now()
    
    const event = currentEvent || {
      type: 'TOUCHDOWN',
      description: 'Demo touchdown event',
      timestamp: new Date()
    }
    
    const basePrompt = prompt || `Professional marketing content for ${brand.name}, a ${brand.industry.toLowerCase()} brand. Style: modern, clean, premium. Event: ${event.type}`
    
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
          caption: `${event.type}! ${brand.name} 🏈`,
          platform: ['Instagram', 'Twitter', 'TikTok', 'Facebook'][i % 4]
        }))
        
        setContent(prev => [...newItems, ...prev])
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
        <aside className="w-80 border-r min-h-[calc(100vh-3.5rem)] p-4 space-y-6">
          {/* Brand Setup */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              Brand
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={businessUrl}
                  onChange={e => setBusinessUrl(e.target.value)}
                  placeholder="yourbusiness.com"
                  className="h-9 text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleAddBrand()}
                />
                <Button 
                  size="sm" 
                  onClick={handleAddBrand}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
              
              {brand.loaded && (
                <Card className="bg-muted/30">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">{brand.industry}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="flex gap-1">
                        {brand.colors.map((c, i) => (
                          <div 
                            key={i} 
                            className="w-5 h-5 rounded border border-border" 
                            style={{ backgroundColor: c }} 
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Model Selection */}
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

          {/* Settings link */}
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <Settings className="w-4 h-4" />
            Settings
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
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
                  onClick={generateStudio}
                  disabled={!brand.loaded || isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
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
          </Tabs>
        </main>
      </div>
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

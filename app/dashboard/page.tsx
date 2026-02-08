'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Zap, Play, Pause, Plus, X,
  Image as ImageIcon, Video, Type, 
  Check, Clock, AlertCircle, Loader2,
  Send, ArrowLeft, Sparkles, Bomb, Calendar,
  Settings, RefreshCw, ChevronDown
} from 'lucide-react'
import Link from 'next/link'

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
  { id: 'flux-schnell', name: 'Flux Schnell', type: 'image', speed: 'Fastest' },
  { id: 'flux-pro', name: 'Flux Pro', type: 'image', speed: 'Fast' },
  { id: 'grok-image', name: 'Grok Image', type: 'image', speed: 'Fast' },
  { id: 'kling-video', name: 'Kling Video', type: 'video', speed: 'Slow' },
]

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square', desc: '1:1' },
  { id: '4:3', name: 'Landscape', desc: '4:3' },
  { id: '9:16', name: 'Story', desc: '9:16' },
  { id: '16:9', name: 'Wide', desc: '16:9' },
]

function extractBrandFromUrl(url: string): Brand {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const domain = urlObj.hostname.replace('www.', '')
    const brandName = domain.split('.')[0]
    
    const knownBrands: Record<string, Partial<Brand>> = {
      'chipotle': { name: 'Chipotle', colors: ['#441500', '#A81612'], industry: 'Restaurant' },
      'dominos': { name: "Domino's", colors: ['#006491', '#E31837'], industry: 'Restaurant' },
      'wingstop': { name: 'Wingstop', colors: ['#024731', '#FFD100'], industry: 'Restaurant' },
    }
    
    const known = knownBrands[brandName.toLowerCase()]
    return {
      name: known?.name || brandName.charAt(0).toUpperCase() + brandName.slice(1),
      domain,
      colors: known?.colors || ['#18181b', '#ffffff'],
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
  const [activeTab, setActiveTab] = useState<'quality' | 'nuke'>('quality')
  const [businessUrl, setBusinessUrl] = useState('')
  const [brand, setBrand] = useState<Brand>({ name: '', domain: '', colors: [], industry: '', loaded: false })
  const [selectedModels, setSelectedModels] = useState<string[]>(['flux-schnell'])
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState<ContentItem[]>([])
  const [scheduledContent, setScheduledContent] = useState<ContentItem[]>([])
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null)
  const [isArmed, setIsArmed] = useState(false)
  const [latency, setLatency] = useState(0)

  // Load brand from URL param
  useEffect(() => {
    const url = searchParams.get('url')
    if (url) {
      setBusinessUrl(url)
      setBrand(extractBrandFromUrl(url))
    }
  }, [searchParams])

  // Poll ESPN for live game data when armed
  useEffect(() => {
    if (!isArmed) return
    
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
    const interval = setInterval(pollGame, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [isArmed])

  const handleAddBrand = () => {
    if (!businessUrl) return
    setBrand(extractBrandFromUrl(businessUrl))
  }

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId]
    )
  }

  // Generate content using real API
  const generateContent = async () => {
    if (!brand.loaded || selectedModels.length === 0) return
    
    setIsGenerating(true)
    const startTime = Date.now()
    setContent([])
    
    const event = currentEvent || {
      type: 'TOUCHDOWN',
      description: 'Demo touchdown event',
      timestamp: new Date()
    }
    
    const basePrompt = prompt || `Exciting ${brand.industry.toLowerCase()} marketing content celebrating a ${event.type}`
    
    try {
      // Generate with each selected model
      for (const modelId of selectedModels) {
        const model = MODELS.find(m => m.id === modelId)
        
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: basePrompt,
            model: modelId,
            aspectRatio,
            numImages: activeTab === 'quality' ? 1 : 4,
            brand: { name: brand.name, industry: brand.industry },
            event
          })
        })
        
        const data = await res.json()
        
        if (data.success && data.content) {
          const newItems: ContentItem[] = data.content.map((item: any, i: number) => ({
            id: `${modelId}-${Date.now()}-${i}`,
            type: model?.type || 'image',
            status: 'ready',
            url: item.url,
            model: modelId,
            caption: `${event.type}! ${brand.name} 🏈`,
            platform: ['instagram', 'twitter', 'tiktok'][i % 3]
          }))
          
          setContent(prev => [...prev, ...newItems])
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
    }
    
    setLatency(Math.round((Date.now() - startTime) / 1000))
    setIsGenerating(false)
  }

  // Nuke mode - fast mass generation
  const triggerNuke = async () => {
    if (!brand.loaded) return
    
    setIsGenerating(true)
    const startTime = Date.now()
    setContent([])
    
    const event = currentEvent || {
      type: 'TOUCHDOWN', 
      description: 'Demo event',
      timestamp: new Date()
    }
    
    // Generate 100 items fast (simulated for demo speed)
    const total = 500
    const batchSize = 50
    
    for (let i = 0; i < total; i += batchSize) {
      await new Promise(r => setTimeout(r, 30))
      
      const batch: ContentItem[] = Array(Math.min(batchSize, total - i)).fill(null).map((_, j) => ({
        id: `nuke-${i + j}`,
        type: Math.random() > 0.3 ? 'image' : 'video',
        status: 'ready',
        caption: `${event.type}! ${brand.name} 🏈`,
        platform: ['instagram', 'twitter', 'tiktok', 'facebook'][Math.floor(Math.random() * 4)],
        model: 'flux-schnell'
      }))
      
      setContent(prev => [...prev, ...batch])
    }
    
    setLatency(Math.round((Date.now() - startTime) / 1000))
    setIsGenerating(false)
  }

  const scheduleItem = (item: ContentItem) => {
    setScheduledContent(prev => [...prev, { ...item, status: 'scheduled' }])
    setContent(prev => prev.filter(c => c.id !== item.id))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-14 border-b border-zinc-200 flex items-center px-4 sticky top-0 bg-white z-50">
        <Link href="/" className="mr-3 text-zinc-400 hover:text-zinc-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-medium text-sm">Moment Machine</span>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          {gameStatus && (
            <div className="text-xs text-zinc-500 font-mono">
              {gameStatus.awayTeam.abbreviation} {gameStatus.awayTeam.score} - {gameStatus.homeTeam.abbreviation} {gameStatus.homeTeam.score} • Q{gameStatus.period} {gameStatus.clock}
            </div>
          )}
          <button
            onClick={() => setIsArmed(!isArmed)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              isArmed ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isArmed ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
            {isArmed ? 'Live' : 'Standby'}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex">
            {[
              { id: 'quality', label: 'Studio', icon: Sparkles },
              { id: 'nuke', label: 'Nuke', icon: Bomb },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'quality' | 'nuke')}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-zinc-900 text-zinc-900 font-medium'
                    : 'border-transparent text-zinc-500'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Panel - Configuration */}
          <div className="col-span-4 space-y-4">
            
            {/* Brand */}
            <div className="border border-zinc-200 rounded-lg p-4">
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Brand</div>
              <div className="flex gap-2">
                <input
                  value={businessUrl}
                  onChange={e => setBusinessUrl(e.target.value)}
                  placeholder="yourbusiness.com"
                  className="flex-1 text-sm border border-zinc-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <button
                  onClick={handleAddBrand}
                  className="px-3 py-2 bg-zinc-900 text-white text-sm rounded hover:bg-zinc-800"
                >
                  Add
                </button>
              </div>
              {brand.loaded && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <div className="flex gap-0.5">
                    {brand.colors.map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="font-medium">{brand.name}</span>
                  <span className="text-zinc-400">• {brand.industry}</span>
                </div>
              )}
            </div>

            {activeTab === 'quality' && (
              <>
                {/* Models */}
                <div className="border border-zinc-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Models</div>
                  <div className="space-y-1.5">
                    {MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => toggleModel(model.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
                          selectedModels.includes(model.id)
                            ? 'bg-zinc-100'
                            : 'hover:bg-zinc-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedModels.includes(model.id) ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'
                        }`}>
                          {selectedModels.includes(model.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="flex-1">{model.name}</span>
                        <span className="text-xs text-zinc-400">{model.type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div className="border border-zinc-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Prompt</div>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe the content you want..."
                    className="w-full text-sm border border-zinc-200 rounded px-3 py-2 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="border border-zinc-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Aspect Ratio</div>
                  <div className="flex gap-2">
                    {ASPECT_RATIOS.map(ar => (
                      <button
                        key={ar.id}
                        onClick={() => setAspectRatio(ar.id)}
                        className={`flex-1 py-2 text-xs rounded border transition-colors ${
                          aspectRatio === ar.id
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {ar.desc}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Event */}
            {currentEvent && (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                  <AlertCircle className="w-4 h-4" />
                  {currentEvent.type}
                </div>
                <p className="text-sm text-amber-600">{currentEvent.description}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={activeTab === 'quality' ? generateContent : triggerNuke}
              disabled={!brand.loaded || isGenerating}
              className="w-full py-3 bg-zinc-900 text-white rounded-lg font-medium text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {activeTab === 'quality' ? 'Generate' : 'Launch Nuke'}
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Output */}
          <div className="col-span-8">
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Generated', value: content.length },
                { label: 'Latency', value: `${latency}s` },
                { label: 'Scheduled', value: scheduledContent.length },
                { label: 'Models', value: selectedModels.length },
              ].map(stat => (
                <div key={stat.label} className="border border-zinc-200 rounded-lg p-3">
                  <div className="text-xs text-zinc-400">{stat.label}</div>
                  <div className="text-lg font-semibold font-mono">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Content Area */}
            <div className="border border-zinc-200 rounded-lg min-h-[400px]">
              {content.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-zinc-400">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No generations yet</p>
                </div>
              ) : activeTab === 'quality' ? (
                <div className="p-4 grid grid-cols-2 gap-4">
                  {content.map(item => (
                    <div key={item.id} className="border border-zinc-200 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-zinc-100 flex items-center justify-center">
                        {item.url ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          item.type === 'video' 
                            ? <Video className="w-8 h-8 text-zinc-300" />
                            : <ImageIcon className="w-8 h-8 text-zinc-300" />
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                          <span className="capitalize">{item.model}</span>
                          <span>•</span>
                          <span className="capitalize">{item.platform}</span>
                        </div>
                        <p className="text-sm text-zinc-700 truncate">{item.caption}</p>
                        <button
                          onClick={() => scheduleItem(item)}
                          className="mt-2 w-full py-1.5 text-xs bg-zinc-900 text-white rounded hover:bg-zinc-800"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-8 gap-1.5 max-h-[350px] overflow-y-auto">
                    {content.slice(0, 200).map((item, i) => (
                      <div
                        key={item.id}
                        className="aspect-square bg-zinc-100 rounded flex items-center justify-center"
                        style={{ animationDelay: `${(i % 50) * 10}ms` }}
                      >
                        {item.type === 'video' 
                          ? <Video className="w-3 h-3 text-blue-400" />
                          : <ImageIcon className="w-3 h-3 text-zinc-400" />
                        }
                      </div>
                    ))}
                    {content.length > 200 && (
                      <div className="aspect-square bg-zinc-200 rounded flex items-center justify-center text-xs font-medium text-zinc-500">
                        +{content.length - 200}
                      </div>
                    )}
                  </div>
                  {content.length > 0 && (
                    <button className="mt-4 w-full py-2.5 bg-zinc-900 text-white rounded-lg font-medium text-sm hover:bg-zinc-800 flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Deploy All {content.length}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

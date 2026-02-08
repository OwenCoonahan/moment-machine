'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Zap, Play, Pause, Plus,
  Image as ImageIcon, Video, Type, BarChart3, 
  Check, Clock, AlertCircle, Loader2,
  Send, ArrowLeft, Sparkles, Bomb, Calendar,
  Twitter, Instagram
} from 'lucide-react'
import Link from 'next/link'

interface ContentItem {
  id: string
  type: 'image' | 'video' | 'text'
  status: 'generating' | 'ready' | 'scheduled' | 'posted'
  url?: string
  caption?: string
  platform?: string
  quality: 'high' | 'mass'
  scheduledFor?: Date
}

interface Brand {
  name: string
  domain: string
  colors: string[]
  voice: string
  industry: string
  loaded: boolean
}

interface GameEvent {
  type: string
  description: string
  timestamp: Date
  confidence: number
}

// Brand extraction
function extractBrandFromUrl(url: string): Brand {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const domain = urlObj.hostname.replace('www.', '')
    const brandName = domain.split('.')[0]
    
    const knownBrands: Record<string, Partial<Brand>> = {
      'chipotle': { name: 'Chipotle', colors: ['#441500', '#A81612', '#FFFFFF'], voice: 'Bold, fresh, food-forward', industry: 'Restaurant' },
      'mcdonalds': { name: "McDonald's", colors: ['#FFC72C', '#DA291C', '#27251F'], voice: 'Fun, family-friendly', industry: 'Restaurant' },
      'dominos': { name: "Domino's", colors: ['#006491', '#E31837', '#FFFFFF'], voice: 'Fast, reliable, fun', industry: 'Restaurant' },
      'buffalowildwings': { name: 'Buffalo Wild Wings', colors: ['#FFB612', '#000000'], voice: 'Sports, bold, social', industry: 'Sports Bar' },
      'wingstop': { name: 'Wingstop', colors: ['#024731', '#FFD100'], voice: 'Flavor, bold, craveable', industry: 'Restaurant' },
    }
    
    const known = knownBrands[brandName.toLowerCase()]
    if (known) {
      return { name: known.name || brandName, domain, colors: known.colors || [], voice: known.voice || '', industry: known.industry || 'Business', loaded: true }
    }
    
    return {
      name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
      domain,
      colors: ['#18181b', '#ffffff', '#71717a'],
      voice: 'Professional, engaging',
      industry: 'Business',
      loaded: true
    }
  } catch {
    return { name: '', domain: '', colors: [], voice: '', industry: '', loaded: false }
  }
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url') || ''
  
  const [activeTab, setActiveTab] = useState<'quality' | 'nuke'>('quality')
  const [businessUrl, setBusinessUrl] = useState(urlParam)
  const [brand, setBrand] = useState<Brand>({ name: '', domain: '', colors: [], voice: '', industry: '', loaded: false })
  const [isArmed, setIsArmed] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState<ContentItem[]>([])
  const [scheduledContent, setScheduledContent] = useState<ContentItem[]>([])
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [latency, setLatency] = useState(0)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null)

  // Load saved brand
  useEffect(() => {
    if (urlParam) {
      const extracted = extractBrandFromUrl(urlParam)
      setBrand(extracted)
      setBusinessUrl(urlParam)
    } else {
      const saved = localStorage.getItem('momentMachineBrand')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setBrand(parsed)
          setBusinessUrl(parsed.domain ? `https://${parsed.domain}` : '')
        } catch {}
      }
    }
  }, [urlParam])

  const handleAddBrand = () => {
    if (!businessUrl) return
    const extracted = extractBrandFromUrl(businessUrl)
    setBrand(extracted)
    localStorage.setItem('momentMachineBrand', JSON.stringify(extracted))
  }

  const detectEvent = useCallback((): GameEvent => {
    const events = [
      { type: 'TOUCHDOWN', description: 'Chiefs score — Mahomes to Kelce, 15 yards', confidence: 0.97 },
      { type: 'TOUCHDOWN', description: 'Eagles score — Hurts rushing TD', confidence: 0.96 },
      { type: 'FUMBLE', description: 'Fumble recovered at the 20 yard line', confidence: 0.94 },
      { type: 'INTERCEPTION', description: 'Intercepted in the red zone!', confidence: 0.92 },
      { type: 'FIELD GOAL', description: 'Field goal is good from 47 yards', confidence: 0.95 },
    ]
    const baseEvent = events[Math.floor(Math.random() * events.length)]
    const event: GameEvent = { ...baseEvent, timestamp: new Date() }
    setCurrentEvent(event)
    return event
  }, [])

  // HIGH QUALITY content generation (fewer, better pieces)
  const generateHighQuality = useCallback(async (event: GameEvent) => {
    setIsGenerating(true)
    const startTime = new Date()
    setGenerationStartTime(startTime)
    setContent([])
    setTotalGenerated(0)
    
    // Generate 5-10 high quality pieces
    const totalToGenerate = Math.floor(Math.random() * 5) + 5
    
    for (let i = 0; i < totalToGenerate; i++) {
      await new Promise(resolve => setTimeout(resolve, 300)) // Slower, more deliberate
      
      const types: ('video' | 'image' | 'text')[] = ['video', 'image', 'image', 'text']
      const platforms = ['instagram', 'twitter', 'tiktok', 'story']
      
      const newItem: ContentItem = {
        id: `hq-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: 'ready',
        caption: generateHighQualityCaption(event, brand),
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        quality: 'high'
      }
      
      setContent(prev => [...prev, newItem])
      setTotalGenerated(i + 1)
    }
    
    setIsGenerating(false)
    setLatency(Math.round((Date.now() - startTime.getTime()) / 1000))
  }, [brand])

  // CONTENT NUKE - mass generation
  const generateNuke = useCallback(async (event: GameEvent) => {
    setIsGenerating(true)
    const startTime = new Date()
    setGenerationStartTime(startTime)
    setContent([])
    setTotalGenerated(0)
    
    const totalToGenerate = Math.floor(Math.random() * 300) + 500
    let generated = 0
    const batchSize = 50
    
    while (generated < totalToGenerate) {
      await new Promise(resolve => setTimeout(resolve, 20))
      
      const newItems: ContentItem[] = []
      for (let i = 0; i < batchSize && generated < totalToGenerate; i++) {
        generated++
        const typeRoll = Math.random()
        const type: 'image' | 'video' | 'text' = typeRoll < 0.4 ? 'video' : typeRoll < 0.8 ? 'image' : 'text'
        
        newItems.push({
          id: `nuke-${generated}`,
          type,
          status: 'ready',
          caption: `${event.type}! ${brand.name} 🏈`,
          platform: ['instagram', 'twitter', 'tiktok', 'facebook'][Math.floor(Math.random() * 4)],
          quality: 'mass'
        })
      }
      
      setContent(prev => [...prev, ...newItems])
      setTotalGenerated(generated)
    }
    
    setIsGenerating(false)
    setLatency(Math.round((Date.now() - startTime.getTime()) / 1000))
  }, [brand])

  const triggerGeneration = () => {
    if (!brand.loaded) return
    const event = detectEvent()
    if (activeTab === 'quality') {
      generateHighQuality(event)
    } else {
      generateNuke(event)
    }
  }

  const scheduleContent = (item: ContentItem) => {
    setScheduledContent(prev => [...prev, { ...item, status: 'scheduled', scheduledFor: new Date() }])
    setContent(prev => prev.filter(c => c.id !== item.id))
  }

  useEffect(() => {
    if (!isGenerating || !generationStartTime) return
    const interval = setInterval(() => {
      setLatency(Math.round((Date.now() - generationStartTime.getTime()) / 1000))
    }, 100)
    return () => clearInterval(interval)
  }, [isGenerating, generationStartTime])

  const videoCount = content.filter(c => c.type === 'video').length
  const imageCount = content.filter(c => c.type === 'image').length

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-zinc-900">Moment Machine</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isArmed ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isArmed ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></div>
              {isArmed ? 'Armed' : 'Standby'}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'quality' 
                  ? 'border-zinc-900 text-zinc-900' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              High-Quality
            </button>
            <button
              onClick={() => setActiveTab('nuke')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'nuke' 
                  ? 'border-zinc-900 text-zinc-900' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Bomb className="w-4 h-4" />
              Content Nuke
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Setup */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            
            {/* Brand Setup */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-medium text-zinc-900 mb-4">Brand Setup</h3>
              
              <div className="space-y-3">
                <input
                  type="url"
                  value={businessUrl}
                  onChange={(e) => setBusinessUrl(e.target.value)}
                  placeholder="yourbusiness.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
                
                <button
                  onClick={handleAddBrand}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Brand
                </button>
                
                {brand.loaded && (
                  <div className="bg-zinc-50 rounded-lg p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Brand</span>
                      <span className="font-medium text-zinc-900">{brand.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Industry</span>
                      <span className="text-sm text-zinc-700">{brand.industry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Colors</span>
                      <div className="flex gap-1">
                        {brand.colors.slice(0, 3).map((color, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-zinc-200" style={{ backgroundColor: color }}></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm pt-2">
                      <Check className="w-3.5 h-3.5" />
                      Ready
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Trigger */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-medium text-zinc-900 mb-4">Event Trigger</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setIsArmed(!isArmed)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    isArmed 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {isArmed ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isArmed ? 'Disarm' : 'Arm System'}
                </button>
                
                <button
                  onClick={triggerGeneration}
                  disabled={!brand.loaded || isGenerating}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Trigger Demo
                    </>
                  )}
                </button>
                
                {currentEvent && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-1">
                      <AlertCircle className="w-4 h-4" />
                      {currentEvent.type}
                    </div>
                    <p className="text-sm text-amber-600">{currentEvent.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduled Posts */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-zinc-900">Scheduled</h3>
                <span className="text-xs text-zinc-400">{scheduledContent.length} posts</span>
              </div>
              
              {scheduledContent.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">No scheduled posts</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {scheduledContent.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg text-sm">
                      {item.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                      {item.type === 'image' && <ImageIcon className="w-4 h-4 text-zinc-400" />}
                      {item.type === 'text' && <Twitter className="w-4 h-4 text-zinc-400" />}
                      <span className="flex-1 truncate text-zinc-600">{item.platform}</span>
                      <Calendar className="w-3 h-3 text-zinc-400" />
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                disabled={scheduledContent.length === 0}
                className="w-full mt-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Post All Now
              </button>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Generated', value: totalGenerated, highlight: true },
                { label: 'Latency', value: `${latency}s` },
                { label: 'Videos', value: videoCount },
                { label: 'Images', value: imageCount },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-zinc-200 rounded-xl p-4">
                  <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
                  <div className={`text-xl font-semibold counter ${stat.highlight ? 'text-zinc-900' : 'text-zinc-700'}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab-specific content */}
            {activeTab === 'quality' ? (
              /* HIGH QUALITY TAB */
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-zinc-900">High-Quality Content</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Curated posts ready for review</p>
                  </div>
                  <span className="text-sm text-zinc-400">{content.length} items</span>
                </div>
                
                {content.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Generate high-quality content</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {content.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                        <div className="w-10 h-10 bg-zinc-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                          {item.type === 'image' && <ImageIcon className="w-5 h-5 text-zinc-500" />}
                          {item.type === 'text' && <Type className="w-5 h-5 text-purple-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-zinc-500 uppercase">{item.platform}</span>
                            <span className="text-xs text-zinc-400">• {item.type}</span>
                          </div>
                          <p className="text-sm text-zinc-700 truncate">{item.caption}</p>
                        </div>
                        <button 
                          onClick={() => scheduleContent(item)}
                          className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800 transition-colors"
                        >
                          Schedule
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* CONTENT NUKE TAB */
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-zinc-900">Content Nuke</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Mass-generated content</p>
                  </div>
                  <span className="text-sm text-zinc-400">{content.length} items</span>
                </div>
                
                {content.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <Bomb className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Trigger a content nuke</p>
                  </div>
                ) : (
                  <div className="content-grid" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {content.slice(0, 200).map((item, i) => (
                      <div 
                        key={item.id} 
                        className="content-item animate-pop"
                        style={{ animationDelay: `${(i % 50) * 10}ms` }}
                      >
                        {item.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                        {item.type === 'image' && <ImageIcon className="w-4 h-4 text-zinc-400" />}
                        {item.type === 'text' && <Type className="w-4 h-4 text-purple-500" />}
                      </div>
                    ))}
                    {content.length > 200 && (
                      <div className="content-item bg-zinc-200 text-zinc-600 text-xs font-medium">
                        +{content.length - 200}
                      </div>
                    )}
                  </div>
                )}
                
                {content.length > 0 && (
                  <button className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                    <Send className="w-4 h-4" />
                    Deploy All {content.length} Posts
                  </button>
                )}
              </div>
            )}

            {/* Summary */}
            {totalGenerated > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-center text-sm text-emerald-700">
                  <span className="font-medium">{brand.name}</span> generated{' '}
                  <span className="font-medium">{totalGenerated}</span> {activeTab === 'quality' ? 'high-quality' : ''} content pieces in{' '}
                  <span className="font-medium">{latency}s</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function generateHighQualityCaption(event: GameEvent, brand: Brand): string {
  const templates = [
    `${event.type}! 🏈 ${brand.name} is celebrating with you. Use code GAMEDAY for 15% off your next order!`,
    `What a moment! ${event.description} — ${brand.name} has your game day covered. Link in bio!`,
    `That ${event.type} though! 😱 Celebrate at ${brand.name}. Special game day menu available now.`,
    `${event.type} energy at ${brand.name}! 🔥 Tag someone you're watching with.`,
    `Big play alert: ${event.description} 🏆 Come watch the rest at ${brand.name}!`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

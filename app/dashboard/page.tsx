'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Zap, Play, Pause, Settings, 
  Image as ImageIcon, Video, Type, BarChart3, 
  Check, Clock, AlertCircle, RefreshCw, Loader2,
  Send, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface ContentItem {
  id: string
  type: 'image' | 'video' | 'text'
  status: 'generating' | 'ready' | 'posted'
  url?: string
  caption?: string
  platform?: string
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
      'starbucks': { name: 'Starbucks', colors: ['#00704A', '#1E3932', '#FFFFFF'], voice: 'Warm, inviting, premium', industry: 'Cafe' },
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
  
  const [businessUrl, setBusinessUrl] = useState(urlParam)
  const [brand, setBrand] = useState<Brand>({ name: '', domain: '', colors: [], voice: '', industry: '', loaded: false })
  const [isArmed, setIsArmed] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState<ContentItem[]>([])
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [latency, setLatency] = useState(0)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null)

  // Load saved brand
  useEffect(() => {
    if (urlParam) {
      const extracted = extractBrandFromUrl(urlParam)
      setBrand(extracted)
    } else {
      const saved = localStorage.getItem('momentMachineBrand')
      if (saved) {
        try {
          setBrand(JSON.parse(saved))
        } catch {}
      }
    }
  }, [urlParam])

  const handleExtractBrand = () => {
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

  // Fast content generation
  const generateContent = useCallback(async (event: GameEvent) => {
    setIsGenerating(true)
    const startTime = new Date()
    setGenerationStartTime(startTime)
    setContent([])
    setTotalGenerated(0)
    
    const totalToGenerate = Math.floor(Math.random() * 300) + 500
    let generated = 0
    const batchSize = 40
    
    while (generated < totalToGenerate) {
      await new Promise(resolve => setTimeout(resolve, 25))
      
      const newItems: ContentItem[] = []
      for (let i = 0; i < batchSize && generated < totalToGenerate; i++) {
        generated++
        const typeRoll = Math.random()
        const type: 'image' | 'video' | 'text' = typeRoll < 0.6 ? 'image' : typeRoll < 0.85 ? 'video' : 'text'
        
        newItems.push({
          id: `c-${generated}`,
          type,
          status: 'ready',
          caption: `${event.type}! ${brand.name} celebrates with you! 🏈`,
          platform: ['instagram', 'twitter', 'tiktok', 'facebook'][Math.floor(Math.random() * 4)]
        })
      }
      
      setContent(prev => [...prev, ...newItems])
      setTotalGenerated(generated)
    }
    
    setIsGenerating(false)
    setLatency(Math.round((Date.now() - startTime.getTime()) / 1000))
  }, [brand.name])

  const triggerGeneration = () => {
    if (!brand.loaded) return
    const event = detectEvent()
    generateContent(event)
  }

  useEffect(() => {
    if (!isGenerating || !generationStartTime) return
    const interval = setInterval(() => {
      setLatency(Math.round((Date.now() - generationStartTime.getTime()) / 1000))
    }, 100)
    return () => clearInterval(interval)
  }, [isGenerating, generationStartTime])

  const imageCount = content.filter(c => c.type === 'image').length
  const videoCount = content.filter(c => c.type === 'video').length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 bg-white sticky top-0 z-50">
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
              <div className={`status-dot ${isArmed ? 'armed bg-emerald-500' : 'bg-zinc-400'}`}></div>
              {isArmed ? 'Armed' : 'Standby'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Brand Setup */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Step 1</span>
              </div>
              <h3 className="font-medium text-zinc-900 mb-4">Brand Setup</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={businessUrl}
                    onChange={(e) => setBusinessUrl(e.target.value)}
                    placeholder="yourbusiness.com"
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                  <button
                    onClick={handleExtractBrand}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-2.5 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
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

            {/* Event Detection */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Step 2</span>
              </div>
              <h3 className="font-medium text-zinc-900 mb-4">Event Detection</h3>
              
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
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-1">
                      <AlertCircle className="w-4 h-4" />
                      {currentEvent.type}
                    </div>
                    <p className="text-sm text-amber-600">{currentEvent.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Deploy */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Step 3</span>
              </div>
              <h3 className="font-medium text-zinc-900 mb-4">Deploy</h3>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['IG', 'TW', 'TT', 'FB'].map((p, i) => (
                  <div key={p} className="bg-zinc-50 rounded-lg p-2 text-center">
                    <div className="font-medium text-zinc-900 text-sm counter">
                      {Math.floor(totalGenerated * [0.25, 0.3, 0.25, 0.2][i])}
                    </div>
                    <div className="text-xs text-zinc-400">{p}</div>
                  </div>
                ))}
              </div>
              
              <button 
                disabled={totalGenerated === 0}
                className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Deploy All
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Generated', value: totalGenerated, icon: BarChart3, highlight: true },
                { label: 'Latency', value: `${latency}s`, icon: Clock },
                { label: 'Images', value: imageCount, icon: ImageIcon },
                { label: 'Videos', value: videoCount, icon: Video },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                    <stat.icon className="w-4 h-4" />
                    {stat.label}
                  </div>
                  <div className={`text-2xl font-semibold counter ${stat.highlight ? 'text-zinc-900' : 'text-zinc-700'}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-zinc-900">Generated Content</h3>
                <span className="text-sm text-zinc-400">{content.length} items</span>
              </div>
              
              {content.length === 0 ? (
                <div className="text-center py-16 text-zinc-400">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Enter your URL and trigger an event</p>
                </div>
              ) : (
                <div className="content-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {content.slice(0, 200).map((item, i) => (
                    <div 
                      key={item.id} 
                      className="content-item animate-pop cursor-pointer"
                      style={{ animationDelay: `${(i % 40) * 15}ms` }}
                    >
                      {item.type === 'image' && <ImageIcon className="w-4 h-4 text-zinc-400" />}
                      {item.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                      {item.type === 'text' && <Type className="w-4 h-4 text-purple-500" />}
                    </div>
                  ))}
                  {content.length > 200 && (
                    <div className="content-item bg-zinc-100 text-zinc-500 text-xs font-medium">
                      +{content.length - 200}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            {totalGenerated > 0 && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 animate-fade-in">
                <p className="text-center text-sm text-zinc-600">
                  <span className="font-medium text-zinc-900">{brand.name}</span> generated{' '}
                  <span className="font-medium text-zinc-900">{totalGenerated}</span> content pieces in{' '}
                  <span className="font-medium text-zinc-900">{latency}s</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

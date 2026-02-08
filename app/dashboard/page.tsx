'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Zap, Play, Pause, Settings, Download, Share2, 
  Image as ImageIcon, Video, Type, BarChart3, 
  Check, Clock, AlertCircle, RefreshCw, Loader2,
  Instagram, Twitter, Facebook, Youtube, Send,
  ExternalLink
} from 'lucide-react'

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
  logo?: string
  colors: string[]
  voice: string
  industry: string
  loaded: boolean
}

interface Event {
  type: string
  description: string
  timestamp: Date
  confidence: number
}

// Brand extraction based on URL
function extractBrandFromUrl(url: string): Brand {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const domain = urlObj.hostname.replace('www.', '')
    const brandName = domain.split('.')[0]
    
    // Known brands database
    const knownBrands: Record<string, Partial<Brand>> = {
      'chipotle': { name: 'Chipotle', colors: ['#441500', '#A81612', '#FFFFFF'], voice: 'Bold, fresh, food-forward', industry: 'restaurant' },
      'mcdonalds': { name: "McDonald's", colors: ['#FFC72C', '#DA291C', '#27251F'], voice: 'Fun, family-friendly, classic', industry: 'restaurant' },
      'starbucks': { name: 'Starbucks', colors: ['#00704A', '#1E3932', '#FFFFFF'], voice: 'Warm, inviting, premium', industry: 'cafe' },
      'dominos': { name: "Domino's", colors: ['#006491', '#E31837', '#FFFFFF'], voice: 'Fast, reliable, fun', industry: 'restaurant' },
      'buffalowildwings': { name: 'Buffalo Wild Wings', colors: ['#FFB612', '#000000', '#FFFFFF'], voice: 'Sports, bold, social', industry: 'sports bar' },
      'applebees': { name: "Applebee's", colors: ['#C8102E', '#000000', '#FFFFFF'], voice: 'Neighborhood, friendly, American', industry: 'restaurant' },
      'chilis': { name: "Chili's", colors: ['#00833E', '#C8102E', '#FFFFFF'], voice: 'Bold, flavorful, fun', industry: 'restaurant' },
      'hooters': { name: 'Hooters', colors: ['#FF6600', '#000000', '#FFFFFF'], voice: 'Fun, sports, wings', industry: 'sports bar' },
      'wingstop': { name: 'Wingstop', colors: ['#024731', '#FFD100', '#FFFFFF'], voice: 'Flavor, bold, craveable', industry: 'restaurant' },
      'papajohns': { name: "Papa John's", colors: ['#C8102E', '#00653A', '#FFFFFF'], voice: 'Quality, fresh, better', industry: 'restaurant' },
    }
    
    const known = knownBrands[brandName.toLowerCase()]
    if (known) {
      return {
        name: known.name || brandName,
        domain,
        colors: known.colors || ['#22c55e', '#FFFFFF', '#000000'],
        voice: known.voice || 'Professional and engaging',
        industry: known.industry || 'business',
        loaded: true
      }
    }
    
    // Generic brand
    return {
      name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
      domain,
      colors: ['#22c55e', '#FFFFFF', '#18181b'],
      voice: 'Professional, engaging, modern',
      industry: 'business',
      loaded: true
    }
  } catch {
    return {
      name: 'Your Business',
      domain: '',
      colors: ['#22c55e', '#FFFFFF', '#18181b'],
      voice: 'Professional and engaging',
      industry: 'business',
      loaded: false
    }
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
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [latency, setLatency] = useState(0)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)

  // Load saved brand from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('momentMachineBrand')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setBrand(parsed)
        setBusinessUrl(parsed.domain ? `https://${parsed.domain}` : '')
      } catch {}
    }
  }, [])

  // Extract brand from URL
  const handleExtractBrand = () => {
    if (!businessUrl) return
    const extracted = extractBrandFromUrl(businessUrl)
    setBrand(extracted)
    localStorage.setItem('momentMachineBrand', JSON.stringify(extracted))
  }

  // Simulate event detection
  const detectEvent = useCallback((): Event => {
    const events = [
      { type: 'TOUCHDOWN', description: 'Chiefs score touchdown - Mahomes to Kelce, 15 yards', confidence: 0.97 },
      { type: 'TOUCHDOWN', description: 'Eagles score touchdown - Hurts rushing TD, 3 yards', confidence: 0.96 },
      { type: 'FUMBLE', description: 'Fumble recovered! Defense takes over at the 20', confidence: 0.94 },
      { type: 'INTERCEPTION', description: 'PICKED OFF! Interception in the red zone', confidence: 0.92 },
      { type: 'BIG PLAY', description: '45-yard bomb! First and goal!', confidence: 0.89 },
      { type: 'FIELD GOAL', description: 'Field goal is GOOD from 47 yards!', confidence: 0.95 },
      { type: 'SACK', description: 'SACKED! QB goes down for a loss of 8', confidence: 0.91 },
    ]
    
    const baseEvent = events[Math.floor(Math.random() * events.length)]
    const event: Event = { ...baseEvent, timestamp: new Date() }
    setCurrentEvent(event)
    return event
  }, [])

  // FAST content generation (simulation for demo speed)
  const generateContent = useCallback(async (event: Event) => {
    setIsGenerating(true)
    const startTime = new Date()
    setGenerationStartTime(startTime)
    setContent([])
    setTotalGenerated(0)
    
    const totalToGenerate = Math.floor(Math.random() * 400) + 400 // 400-800 pieces
    let generated = 0
    
    // Generate in FAST batches for visual effect
    const batchSize = 50
    const batches = Math.ceil(totalToGenerate / batchSize)
    const batchDelay = 30 // 30ms between batches = ~1 second for 800 items
    
    for (let batch = 0; batch < batches; batch++) {
      await new Promise(resolve => setTimeout(resolve, batchDelay))
      
      const newItems: ContentItem[] = []
      for (let i = 0; i < batchSize && generated < totalToGenerate; i++) {
        generated++
        const typeRoll = Math.random()
        const type: 'image' | 'video' | 'text' = typeRoll < 0.6 ? 'image' : typeRoll < 0.8 ? 'video' : 'text'
        
        const captions = [
          `${event.type}! 🏈 ${brand.name} celebrates with you! Use code GAMEDAY for 15% off!`,
          `That ${event.type} though! 😱 Come celebrate at ${brand.name}!`,
          `${event.type} ENERGY! 💪 ${brand.name} has your back!`,
          `DID YOU SEE THAT?! 🤯 ${brand.name} is going crazy!`,
          `BIG ${event.type} MOMENT! 🏆 Special deals at ${brand.name}!`,
        ]
        
        newItems.push({
          id: `content-${batch}-${i}`,
          type,
          status: 'ready',
          url: type === 'image' ? `https://picsum.photos/400/400?random=${batch}-${i}` : undefined,
          caption: captions[Math.floor(Math.random() * captions.length)],
          platform: ['instagram', 'twitter', 'tiktok', 'facebook'][Math.floor(Math.random() * 4)]
        })
      }
      
      setContent(prev => [...prev, ...newItems])
      setTotalGenerated(generated)
    }
    
    setIsGenerating(false)
    const endTime = new Date()
    setLatency(Math.round((endTime.getTime() - startTime.getTime()) / 1000))
  }, [brand.name])

  // Trigger generation manually
  const triggerGeneration = () => {
    const event = detectEvent()
    generateContent(event)
  }

  // Update latency counter during generation
  useEffect(() => {
    if (!isGenerating || !generationStartTime) return
    
    const interval = setInterval(() => {
      setLatency(Math.round((Date.now() - generationStartTime.getTime()) / 1000))
    }, 100)
    
    return () => clearInterval(interval)
  }, [isGenerating, generationStartTime])

  const imageCount = content.filter(c => c.type === 'image').length
  const videoCount = content.filter(c => c.type === 'video').length
  const textCount = content.filter(c => c.type === 'text').length

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="border-b border-dark-600 bg-dark-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Moment Machine</h1>
                <p className="text-sm text-zinc-400">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-4 py-2">
                <div className={`w-2 h-2 rounded-full ${isArmed ? 'bg-accent animate-pulse' : 'bg-zinc-500'}`}></div>
                <span className="text-sm font-medium">{isArmed ? 'ARMED' : 'STANDBY'}</span>
              </div>
              <button className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Setup & Controls */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Brand Setup */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-accent text-sm">1</span>
                </div>
                Brand Setup
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Business URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={businessUrl}
                      onChange={(e) => setBusinessUrl(e.target.value)}
                      placeholder="https://yourbusiness.com"
                      className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      onClick={handleExtractBrand}
                      className="bg-accent hover:bg-accent-dim text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {brand.loaded && (
                  <div className="bg-dark-700 rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Brand</span>
                      <span className="font-semibold text-accent">{brand.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Industry</span>
                      <span className="text-sm capitalize">{brand.industry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Colors</span>
                      <div className="flex gap-1">
                        {brand.colors.map((color, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border border-dark-500" style={{ backgroundColor: color }}></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Voice</span>
                      <span className="text-sm text-right max-w-[180px]">{brand.voice}</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent text-sm pt-2 border-t border-dark-600">
                      <Check className="w-4 h-4" />
                      Brand extracted successfully
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Detection */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-accent text-sm">2</span>
                </div>
                Event Detection
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsArmed(!isArmed)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      isArmed 
                        ? 'bg-accent text-white glow-accent' 
                        : 'bg-dark-600 hover:bg-dark-500'
                    }`}
                  >
                    {isArmed ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isArmed ? 'Disarm' : 'Arm System'}
                  </button>
                </div>
                
                <button
                  onClick={triggerGeneration}
                  disabled={!brand.loaded || isGenerating}
                  className="w-full bg-accent hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Trigger Demo Event
                    </>
                  )}
                </button>
                
                {currentEvent && (
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-accent font-semibold mb-2">
                      <AlertCircle className="w-4 h-4" />
                      {currentEvent.type}
                    </div>
                    <p className="text-sm text-zinc-300">{currentEvent.description}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Confidence: {(currentEvent.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Queue */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-accent text-sm">3</span>
                </div>
                Deployment Queue
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Instagram', icon: Instagram, count: Math.floor(totalGenerated * 0.25) },
                  { name: 'Twitter', icon: Twitter, count: Math.floor(totalGenerated * 0.3) },
                  { name: 'TikTok', icon: Video, count: Math.floor(totalGenerated * 0.25) },
                  { name: 'Facebook', icon: Facebook, count: Math.floor(totalGenerated * 0.2) },
                ].map((platform) => (
                  <div key={platform.name} className="bg-dark-700 rounded-xl p-4 text-center">
                    <platform.icon className="w-5 h-5 mx-auto mb-2 text-zinc-400" />
                    <div className="font-semibold counter">{platform.count}</div>
                    <div className="text-xs text-zinc-500">{platform.name}</div>
                  </div>
                ))}
              </div>
              
              <button 
                disabled={totalGenerated === 0}
                className="w-full mt-4 bg-accent hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Deploy All Content
              </button>
            </div>
          </div>

          {/* Right Column - Content Display */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Generated
                </div>
                <div className="text-3xl font-bold counter text-accent">{totalGenerated}</div>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Latency
                </div>
                <div className={`text-3xl font-bold counter ${latency <= 45 ? 'text-accent' : 'text-yellow-500'}`}>{latency}s</div>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Images
                </div>
                <div className="text-3xl font-bold counter">{imageCount}</div>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Videos
                </div>
                <div className="text-3xl font-bold counter">{videoCount}</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Generated Content</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-400">{imageCount} images</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">{videoCount} videos</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">{textCount} text</span>
                </div>
              </div>
              
              {content.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Enter your business URL and trigger an event</p>
                  <p className="text-sm mt-1">Watch content explode in real-time</p>
                </div>
              ) : (
                <div className="content-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {content.slice(0, 150).map((item, i) => (
                    <div 
                      key={item.id} 
                      className={`content-item cursor-pointer hover:border-accent transition-colors ${item.status === 'generating' ? 'generating' : ''}`}
                      style={{ animationDelay: `${(i % 30) * 20}ms` }}
                      onClick={() => setSelectedContent(item)}
                    >
                      {item.status === 'generating' ? (
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                          {item.type === 'image' && <ImageIcon className="w-6 h-6 text-accent mb-1" />}
                          {item.type === 'video' && <Video className="w-6 h-6 text-blue-400 mb-1" />}
                          {item.type === 'text' && <Type className="w-6 h-6 text-purple-400 mb-1" />}
                          <span className="text-xs text-zinc-500">{item.type}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {content.length > 150 && (
                    <div className="content-item bg-accent/20 border-accent/30 text-accent text-sm font-medium">
                      +{content.length - 150}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Analytics */}
            {totalGenerated > 0 && (
              <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 animate-fade-in">
                <h2 className="font-semibold mb-4">Session Analytics</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-dark-700 rounded-xl">
                    <div className="text-3xl font-bold text-accent mb-1 counter">{totalGenerated}</div>
                    <div className="text-sm text-zinc-400">Total Content</div>
                  </div>
                  <div className="text-center p-4 bg-dark-700 rounded-xl">
                    <div className="text-3xl font-bold mb-1 counter">{latency}s</div>
                    <div className="text-sm text-zinc-400">Generation Time</div>
                  </div>
                  <div className="text-center p-4 bg-dark-700 rounded-xl">
                    <div className="text-3xl font-bold text-accent mb-1">$7M</div>
                    <div className="text-sm text-zinc-400">Super Bowl Ad Cost</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-xl">
                  <p className="text-sm text-center">
                    <span className="text-accent font-semibold">{brand.name}</span> just generated{' '}
                    <span className="text-white font-semibold">{totalGenerated}</span> pieces of branded content 
                    in <span className="text-white font-semibold">{latency} seconds</span>.
                    <br />
                    <span className="text-zinc-400">That's what Madison Avenue spends $7M and 6 months to do.</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedContent(null)}>
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Content Preview</h3>
              <button onClick={() => setSelectedContent(null)} className="text-zinc-400 hover:text-white">×</button>
            </div>
            <div className="bg-dark-700 rounded-xl p-4 mb-4 aspect-square flex items-center justify-center">
              {selectedContent.type === 'image' && <ImageIcon className="w-16 h-16 text-accent" />}
              {selectedContent.type === 'video' && <Video className="w-16 h-16 text-blue-400" />}
              {selectedContent.type === 'text' && <Type className="w-16 h-16 text-purple-400" />}
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-zinc-400 mb-1">Caption</div>
                <p className="text-sm">{selectedContent.caption}</p>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-1">Platform</div>
                <span className="text-sm capitalize">{selectedContent.platform}</span>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-1">Hashtags</div>
                <p className="text-sm text-accent">#SuperBowl #GameDay #{brand.name?.replace(/[^a-zA-Z]/g, '')}</p>
              </div>
            </div>
            <button className="w-full mt-4 bg-accent hover:bg-accent-dim text-white px-4 py-3 rounded-lg font-semibold transition-colors">
              Post Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

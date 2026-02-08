'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Zap, Play, Pause, Settings, Download, Share2, 
  Image as ImageIcon, Video, Type, BarChart3, 
  Check, Clock, AlertCircle, RefreshCw, Loader2,
  Instagram, Twitter, Facebook, Youtube, Send
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
  logo?: string
  colors: string[]
  voice: string
  loaded: boolean
}

interface Event {
  type: string
  description: string
  timestamp: Date
  confidence: number
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url') || ''
  
  const [businessUrl, setBusinessUrl] = useState(urlParam)
  const [brand, setBrand] = useState<Brand>({ name: '', colors: [], voice: '', loaded: false })
  const [isArmed, setIsArmed] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState<ContentItem[]>([])
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [latency, setLatency] = useState(0)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null)

  // Simulate brand extraction
  const extractBrand = async () => {
    if (!businessUrl) return
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const domain = new URL(businessUrl.startsWith('http') ? businessUrl : `https://${businessUrl}`).hostname
    const brandName = domain.replace('www.', '').split('.')[0]
    
    setBrand({
      name: brandName.charAt(0).toUpperCase() + brandName.slice(1),
      colors: ['#E4002B', '#FFD700', '#FFFFFF'],
      voice: 'Bold, playful, food-forward',
      loaded: true
    })
  }

  // Simulate event detection
  const detectEvent = useCallback(() => {
    const events = [
      { type: 'TOUCHDOWN', description: 'Chiefs score touchdown - Mahomes to Kelce', confidence: 0.97 },
      { type: 'FUMBLE', description: 'Eagles fumble on their own 20', confidence: 0.94 },
      { type: 'INTERCEPTION', description: 'Mahomes intercepted in the red zone', confidence: 0.92 },
      { type: 'BIG PLAY', description: '45-yard completion to the 10-yard line', confidence: 0.89 },
      { type: 'HALFTIME', description: 'Halftime show beginning', confidence: 0.99 },
    ]
    
    const event = events[Math.floor(Math.random() * events.length)]
    setCurrentEvent({ ...event, timestamp: new Date() })
    return event
  }, [])

  // Generate content based on event
  const generateContent = useCallback(async (event: Event) => {
    setIsGenerating(true)
    setGenerationStartTime(new Date())
    setContent([])
    
    const totalToGenerate = Math.floor(Math.random() * 200) + 600 // 600-800 pieces
    let generated = 0
    
    // Generate in batches for visual effect
    const batchSize = 20
    const batches = Math.ceil(totalToGenerate / batchSize)
    
    for (let batch = 0; batch < batches; batch++) {
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const newItems: ContentItem[] = []
      for (let i = 0; i < batchSize && generated < totalToGenerate; i++) {
        generated++
        const types: ('image' | 'video' | 'text')[] = ['image', 'image', 'image', 'video', 'text']
        const type = types[Math.floor(Math.random() * types.length)]
        
        newItems.push({
          id: `content-${generated}`,
          type,
          status: Math.random() > 0.1 ? 'ready' : 'generating',
          caption: `${event.type}! ${brand.name} celebrates with you! 🏈🔥`,
          platform: ['instagram', 'twitter', 'tiktok', 'facebook'][Math.floor(Math.random() * 4)]
        })
      }
      
      setContent(prev => [...prev, ...newItems])
      setTotalGenerated(generated)
      setLatency(Math.floor((Date.now() - generationStartTime!.getTime()) / 1000))
    }
    
    setIsGenerating(false)
    setLatency(Math.floor((Date.now() - generationStartTime!.getTime()) / 1000))
  }, [brand.name, generationStartTime])

  // Trigger generation manually (for demo)
  const triggerGeneration = () => {
    const event = detectEvent()
    generateContent(event)
  }

  // Update latency counter during generation
  useEffect(() => {
    if (!isGenerating || !generationStartTime) return
    
    const interval = setInterval(() => {
      setLatency(Math.floor((Date.now() - generationStartTime.getTime()) / 1000))
    }, 100)
    
    return () => clearInterval(interval)
  }, [isGenerating, generationStartTime])

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="border-b border-dark-600 bg-dark-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-dark-900" />
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
                      placeholder="https://yoursite.com"
                      className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      onClick={extractBrand}
                      className="bg-dark-600 hover:bg-dark-500 px-4 py-3 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {brand.loaded && (
                  <div className="bg-dark-700 rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Brand</span>
                      <span className="font-medium">{brand.name}</span>
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
                      <span className="text-sm">{brand.voice}</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent text-sm">
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
                        ? 'bg-accent text-dark-900 glow-green' 
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
                  className="w-full bg-accent hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed text-dark-900 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
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
                  { name: 'TikTok', icon: Video, count: Math.floor(totalGenerated * 0.2) },
                  { name: 'Facebook', icon: Facebook, count: Math.floor(totalGenerated * 0.15) },
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
                className="w-full mt-4 bg-accent hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed text-dark-900 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
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
                <div className="text-3xl font-bold counter">{latency}s</div>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Images
                </div>
                <div className="text-3xl font-bold counter">{content.filter(c => c.type === 'image').length}</div>
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Videos
                </div>
                <div className="text-3xl font-bold counter">{content.filter(c => c.type === 'video').length}</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Generated Content</h2>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-dark-600 hover:bg-dark-500 rounded-lg text-sm transition-colors">
                    All
                  </button>
                  <button className="px-3 py-1.5 hover:bg-dark-600 rounded-lg text-sm transition-colors text-zinc-400">
                    Images
                  </button>
                  <button className="px-3 py-1.5 hover:bg-dark-600 rounded-lg text-sm transition-colors text-zinc-400">
                    Videos
                  </button>
                </div>
              </div>
              
              {content.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Trigger an event to generate content</p>
                  <p className="text-sm mt-1">Or arm the system and watch live</p>
                </div>
              ) : (
                <div className="content-grid" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {content.slice(0, 100).map((item, i) => (
                    <div 
                      key={item.id} 
                      className={`content-item cursor-pointer hover:border-accent transition-colors ${item.status === 'generating' ? 'generating' : ''}`}
                      style={{ animationDelay: `${(i % 20) * 30}ms` }}
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
                  {content.length > 100 && (
                    <div className="content-item bg-dark-600 text-zinc-400 text-sm">
                      +{content.length - 100} more
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
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-1 counter">{totalGenerated}</div>
                    <div className="text-sm text-zinc-400">Total Content</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1 counter">${(totalGenerated * 0.05).toFixed(2)}</div>
                    <div className="text-sm text-zinc-400">Est. Generation Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-1">$7M</div>
                    <div className="text-sm text-zinc-400">Super Bowl Ad Cost</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-dark-700 rounded-xl">
                  <p className="text-sm text-zinc-400 text-center">
                    You just generated <span className="text-accent font-semibold">{totalGenerated}</span> pieces of branded content 
                    in <span className="text-white font-semibold">{latency} seconds</span> for less than the cost of a coffee.
                  </p>
                </div>
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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

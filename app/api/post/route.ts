import { NextResponse } from 'next/server'

// Platform integration configurations
interface PlatformConfig {
  name: string
  type: 'oauth' | 'webhook' | 'api'
  connected: boolean
  webhookUrl?: string
}

// Simulated connected platforms (in production, this would be stored in a database)
const connectedPlatforms: Record<string, PlatformConfig> = {}

// Post content to a platform
async function postToPlatform(
  platform: string,
  content: {
    text: string
    imageUrl?: string
    videoUrl?: string
  },
  config: PlatformConfig
): Promise<{ success: boolean; postId?: string; error?: string }> {
  
  // If webhook is configured, send to webhook
  if (config.webhookUrl) {
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content,
          timestamp: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return { success: true, postId: data.id || 'webhook-sent' }
      }
      return { success: false, error: 'Webhook failed' }
    } catch (error) {
      return { success: false, error: 'Webhook error' }
    }
  }
  
  // Simulate posting (for demo)
  console.log(`[DEMO] Posting to ${platform}:`, content.text.slice(0, 50))
  return { success: true, postId: `demo-${Date.now()}` }
}

// POST - Send content to platforms
export async function POST(request: Request) {
  try {
    const { 
      platforms, 
      content,
      schedule 
    } = await request.json()
    
    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {}
    
    for (const platform of platforms) {
      const config = connectedPlatforms[platform] || {
        name: platform,
        type: 'api',
        connected: true // Demo mode
      }
      
      if (schedule) {
        // For scheduled posts, we'd queue them
        results[platform] = { 
          success: true, 
          postId: `scheduled-${Date.now()}` 
        }
      } else {
        results[platform] = await postToPlatform(platform, content, config)
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Post error:', error)
    return NextResponse.json({ success: false, error: 'Post failed' }, { status: 500 })
  }
}

// GET - Get connected platforms
export async function GET() {
  // Available platforms
  const availablePlatforms = [
    { id: 'instagram', name: 'Instagram', icon: 'instagram', supported: true },
    { id: 'twitter', name: 'Twitter/X', icon: 'twitter', supported: true },
    { id: 'tiktok', name: 'TikTok', icon: 'video', supported: true },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', supported: true },
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', supported: true },
    { id: 'buffer', name: 'Buffer', icon: 'send', supported: true, isScheduler: true },
    { id: 'hootsuite', name: 'Hootsuite', icon: 'calendar', supported: true, isScheduler: true },
  ]
  
  return NextResponse.json({
    platforms: availablePlatforms,
    connected: Object.keys(connectedPlatforms),
    webhookEndpoint: '/api/post/webhook'
  })
}

// PUT - Connect a platform (webhook setup)
export async function PUT(request: Request) {
  try {
    const { platform, webhookUrl, config } = await request.json()
    
    connectedPlatforms[platform] = {
      name: platform,
      type: webhookUrl ? 'webhook' : 'api',
      connected: true,
      webhookUrl
    }
    
    return NextResponse.json({
      success: true,
      platform,
      connected: true
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Connection failed' }, { status: 500 })
  }
}

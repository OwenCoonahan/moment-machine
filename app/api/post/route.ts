import { NextResponse } from 'next/server'
import { postToSocial, getConnectedPlatforms, SocialPlatform, PLATFORM_INFO } from '@/lib/posting'

// POST - Send content to social platforms via Ayrshare
export async function POST(request: Request) {
  try {
    const { 
      imageUrl,
      caption,
      platforms,
      schedule 
    } = await request.json()
    
    // Validate required fields
    if (!caption) {
      return NextResponse.json(
        { success: false, error: 'Caption is required' }, 
        { status: 400 }
      )
    }
    
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one platform is required' }, 
        { status: 400 }
      )
    }
    
    // Validate platform names
    const validPlatforms: SocialPlatform[] = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok']
    const invalidPlatforms = platforms.filter((p: string) => !validPlatforms.includes(p as SocialPlatform))
    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid platforms: ${invalidPlatforms.join(', ')}` }, 
        { status: 400 }
      )
    }
    
    // For scheduled posts, we would integrate with Ayrshare's scheduling
    // For now, just immediate posting
    if (schedule) {
      // TODO: Implement Ayrshare scheduling API
      // https://www.ayrshare.com/docs/api#schedule-post
      console.log('Scheduled posting not yet implemented, posting immediately')
    }
    
    // Post to social platforms
    const result = await postToSocial({
      imageUrl,
      caption,
      platforms: platforms as SocialPlatform[],
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Post error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to post content' }, 
      { status: 500 }
    )
  }
}

// GET - Get available/connected platforms
export async function GET() {
  const connectedPlatforms = await getConnectedPlatforms()
  
  // Build platform info with connection status
  const allPlatforms = Object.entries(PLATFORM_INFO).map(([id, info]) => ({
    id,
    name: info.name,
    icon: info.icon,
    color: info.color,
    connected: connectedPlatforms.includes(id as SocialPlatform),
    supported: true,
  }))
  
  const hasApiKey = !!process.env.AYRSHARE_API_KEY
  
  return NextResponse.json({
    platforms: allPlatforms,
    connected: connectedPlatforms,
    demoMode: !hasApiKey,
    message: hasApiKey 
      ? 'Connected to Ayrshare' 
      : 'Demo mode - set AYRSHARE_API_KEY to enable real posting',
  })
}

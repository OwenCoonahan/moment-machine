// Ayrshare Social Media Posting Integration
// https://www.ayrshare.com/docs/api

export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok'

export interface PostOptions {
  imageUrl?: string
  caption: string
  platforms: SocialPlatform[]
}

export interface PlatformResult {
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
}

export interface PostResult {
  success: boolean
  results: Record<SocialPlatform, PlatformResult>
  timestamp: string
}

// Platform-specific formatting
function formatCaption(caption: string, platform: SocialPlatform): string {
  switch (platform) {
    case 'twitter':
      // Twitter: 280 chars, no special formatting needed
      return caption.slice(0, 280)
    case 'instagram':
      // Instagram: 2200 chars, hashtags work well
      return caption.slice(0, 2200)
    case 'facebook':
      // Facebook: 63,206 chars, but keep it short
      return caption.slice(0, 1000)
    case 'linkedin':
      // LinkedIn: 3000 chars, more professional tone
      return caption.slice(0, 3000)
    case 'tiktok':
      // TikTok: 2200 chars for description
      return caption.slice(0, 2200)
    default:
      return caption
  }
}

// Platform display names and icons
export const PLATFORM_INFO: Record<SocialPlatform, { name: string; icon: string; color: string }> = {
  twitter: { name: 'X (Twitter)', icon: '𝕏', color: '#000000' },
  instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
  facebook: { name: 'Facebook', icon: '📘', color: '#1877F2' },
  linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
}

// Ayrshare API call
export async function postToSocial({ imageUrl, caption, platforms }: PostOptions): Promise<PostResult> {
  const apiKey = process.env.AYRSHARE_API_KEY
  
  // If no API key, return demo results
  if (!apiKey) {
    console.log('[DEMO MODE] No AYRSHARE_API_KEY - simulating post to:', platforms)
    const results: Record<SocialPlatform, PlatformResult> = {} as Record<SocialPlatform, PlatformResult>
    
    for (const platform of platforms) {
      results[platform] = {
        success: true,
        postId: `demo-${platform}-${Date.now()}`,
        postUrl: `https://${platform}.com/demo-post`,
      }
    }
    
    return {
      success: true,
      results,
      timestamp: new Date().toISOString(),
    }
  }
  
  try {
    // Ayrshare expects an array of platform names
    const ayrsharePayload: Record<string, unknown> = {
      post: caption,
      platforms,
    }
    
    // Add media if provided
    if (imageUrl) {
      ayrsharePayload.mediaUrls = [imageUrl]
    }
    
    // Platform-specific settings
    if (platforms.includes('instagram')) {
      ayrsharePayload.instagramOptions = {
        // Set to true for stories, false for feed
        isStory: false,
      }
    }
    
    if (platforms.includes('tiktok')) {
      ayrsharePayload.tikTokOptions = {
        privacy: 'PUBLIC_TO_EVERYONE',
        allowComment: true,
        allowDuet: true,
        allowStitch: true,
      }
    }
    
    const response = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(ayrsharePayload),
    })
    
    const data = await response.json()
    
    // Parse Ayrshare response into our format
    const results: Record<SocialPlatform, PlatformResult> = {} as Record<SocialPlatform, PlatformResult>
    
    if (data.status === 'success' || data.id) {
      // Ayrshare returns per-platform results in postIds object
      for (const platform of platforms) {
        const platformResult = data.postIds?.[platform] || data.id
        results[platform] = {
          success: true,
          postId: platformResult?.id || data.id,
          postUrl: platformResult?.postUrl,
        }
      }
      
      return {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }
    } else {
      // Handle errors
      for (const platform of platforms) {
        results[platform] = {
          success: false,
          error: data.message || data.error || 'Unknown error',
        }
      }
      
      return {
        success: false,
        results,
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error('Ayrshare API error:', error)
    
    const results: Record<SocialPlatform, PlatformResult> = {} as Record<SocialPlatform, PlatformResult>
    for (const platform of platforms) {
      results[platform] = {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
    
    return {
      success: false,
      results,
      timestamp: new Date().toISOString(),
    }
  }
}

// Get available platforms from Ayrshare (for connected accounts)
export async function getConnectedPlatforms(): Promise<SocialPlatform[]> {
  const apiKey = process.env.AYRSHARE_API_KEY
  
  if (!apiKey) {
    // Demo mode: return all platforms as "available"
    return ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok']
  }
  
  try {
    const response = await fetch('https://app.ayrshare.com/api/user', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    
    const data = await response.json()
    
    // Ayrshare returns connected platforms in activeSocialAccounts
    if (data.activeSocialAccounts) {
      return data.activeSocialAccounts as SocialPlatform[]
    }
    
    return []
  } catch (error) {
    console.error('Failed to fetch connected platforms:', error)
    return []
  }
}

// Delete a post (if supported)
export async function deletePost(postId: string): Promise<boolean> {
  const apiKey = process.env.AYRSHARE_API_KEY
  
  if (!apiKey) {
    console.log('[DEMO MODE] Would delete post:', postId)
    return true
  }
  
  try {
    const response = await fetch('https://app.ayrshare.com/api/post', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ id: postId }),
    })
    
    return response.ok
  } catch (error) {
    console.error('Failed to delete post:', error)
    return false
  }
}

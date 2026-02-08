// Avatar/Character system for AI-generated content

export interface Avatar {
  id: string
  name: string
  imageUrl: string // Placeholder or generated still
  personality: string
  voiceStyle: string
  brandAssociations: string[] // e.g., ["Chipotle", "Nike"]
  brandPlacements?: string[] // e.g., ["Chipotle bag in background"]
  contentCount: number
  createdAt: number
  heyGenAvatarId?: string // For future HeyGen integration
}

export interface AvatarTemplate {
  name: string
  personality: string
  voiceStyle: string
  imageUrl: string
  brandPlacements?: string[]
}

// Example avatar templates
export const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    name: 'Brittany',
    personality: 'Lifestyle influencer vibe, enthusiastic, relatable, loves game day snacks',
    voiceStyle: 'Upbeat, friendly, millennial energy',
    imageUrl: '/avatars/brittany-placeholder.jpg',
    brandPlacements: ['Product visible in background', 'Branded cup on table']
  },
  {
    name: 'Chad',
    personality: 'Football bro, passionate sports commentator, high energy, loves stats',
    voiceStyle: 'Excited, sports announcer cadence, uses football lingo',
    imageUrl: '/avatars/chad-placeholder.jpg',
    brandPlacements: ['Jersey with brand logo', 'Beer/snack visible']
  },
  {
    name: 'Corporate Carl',
    personality: 'Professional spokesperson, polished, trustworthy, B2B friendly',
    voiceStyle: 'Calm, authoritative, corporate presentation style',
    imageUrl: '/avatars/carl-placeholder.jpg',
    brandPlacements: ['Branded backdrop', 'Logo on screen behind']
  },
  {
    name: 'Luna',
    personality: 'Gen Z creator, witty, trend-aware, uses current slang',
    voiceStyle: 'Fast-paced, playful, meme-fluent',
    imageUrl: '/avatars/luna-placeholder.jpg',
    brandPlacements: ['Product unboxing style', 'Ring light setup']
  },
  {
    name: 'Coach Mike',
    personality: 'Retired coach, wise, analytical, breaks down plays',
    voiceStyle: 'Authoritative but warm, uses coaching metaphors',
    imageUrl: '/avatars/mike-placeholder.jpg',
    brandPlacements: ['Whiteboard with brand', 'Athletic wear with logo']
  }
]

const AVATARS_STORAGE_KEY = 'moment-machine-avatars'

function generateId(): string {
  return `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all avatars
export function getAvatars(): Avatar[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(AVATARS_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error reading avatars:', error)
    return []
  }
}

// Get avatars by campaign
export function getAvatarsByCampaign(campaignId: string): Avatar[] {
  // This is handled by campaign.avatarIds, but we can filter here too
  return getAvatars()
}

// Save a new avatar
export function saveAvatar(avatar: Omit<Avatar, 'id' | 'createdAt' | 'contentCount'>): Avatar {
  const newAvatar: Avatar = {
    ...avatar,
    id: generateId(),
    createdAt: Date.now(),
    contentCount: 0
  }
  
  const existing = getAvatars()
  existing.push(newAvatar)
  
  try {
    localStorage.setItem(AVATARS_STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Error saving avatar:', error)
  }
  
  return newAvatar
}

// Update an avatar
export function updateAvatar(id: string, updates: Partial<Avatar>): Avatar | null {
  const existing = getAvatars()
  const index = existing.findIndex(a => a.id === id)
  
  if (index === -1) return null
  
  existing[index] = { ...existing[index], ...updates }
  
  try {
    localStorage.setItem(AVATARS_STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Error updating avatar:', error)
  }
  
  return existing[index]
}

// Delete an avatar
export function deleteAvatar(id: string): boolean {
  const existing = getAvatars()
  const filtered = existing.filter(a => a.id !== id)
  
  if (filtered.length === existing.length) return false
  
  try {
    localStorage.setItem(AVATARS_STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting avatar:', error)
    return false
  }
}

// Increment content count for an avatar
export function incrementAvatarContentCount(id: string): void {
  const avatar = getAvatars().find(a => a.id === id)
  if (avatar) {
    updateAvatar(id, { contentCount: avatar.contentCount + 1 })
  }
}

// Create avatar from template
export function createAvatarFromTemplate(template: AvatarTemplate, brandAssociations: string[] = []): Avatar {
  return saveAvatar({
    name: template.name,
    imageUrl: template.imageUrl,
    personality: template.personality,
    voiceStyle: template.voiceStyle,
    brandAssociations,
    brandPlacements: template.brandPlacements
  })
}

// Generate placeholder avatar image URL
export function getAvatarPlaceholder(name: string): string {
  // Use a nice gradient placeholder with initials
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3']
  ]
  const colorPair = colors[name.charCodeAt(0) % colors.length]
  
  // Return a data URL or use a placeholder service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorPair[0].slice(1)}&color=fff&size=256&bold=true`
}

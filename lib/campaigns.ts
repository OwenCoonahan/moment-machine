// Campaign management system

export interface Campaign {
  id: string
  name: string
  gameId: string // ESPN game ID or 'demo'
  gameName?: string // Display name like "Super Bowl LX"
  brandInfo: {
    name: string
    domain?: string
    colors: string[]
    industry: string
  }
  avatarIds: string[] // IDs of avatars assigned to this campaign
  contentCount: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface CampaignInput {
  name: string
  gameId: string
  gameName?: string
  brandInfo: Campaign['brandInfo']
  avatarIds?: string[]
}

const CAMPAIGNS_STORAGE_KEY = 'moment-machine-campaigns'
const ACTIVE_CAMPAIGN_KEY = 'moment-machine-active-campaign'

function generateId(): string {
  return `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all campaigns
export function getCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY)
    if (!stored) return []
    const campaigns = JSON.parse(stored)
    // Sort by most recently updated
    return campaigns.sort((a: Campaign, b: Campaign) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('Error reading campaigns:', error)
    return []
  }
}

// Get a single campaign by ID
export function getCampaign(id: string): Campaign | null {
  const campaigns = getCampaigns()
  return campaigns.find(c => c.id === id) || null
}

// Save a new campaign
export function saveCampaign(input: CampaignInput): Campaign {
  const newCampaign: Campaign = {
    id: generateId(),
    name: input.name,
    gameId: input.gameId,
    gameName: input.gameName,
    brandInfo: input.brandInfo,
    avatarIds: input.avatarIds || [],
    contentCount: 0,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  const existing = getCampaigns()
  existing.unshift(newCampaign)
  
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Error saving campaign:', error)
  }
  
  return newCampaign
}

// Update a campaign
export function updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
  const existing = getCampaigns()
  const index = existing.findIndex(c => c.id === id)
  
  if (index === -1) return null
  
  existing[index] = { 
    ...existing[index], 
    ...updates,
    updatedAt: Date.now()
  }
  
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Error updating campaign:', error)
  }
  
  return existing[index]
}

// Delete a campaign
export function deleteCampaign(id: string): boolean {
  const existing = getCampaigns()
  const filtered = existing.filter(c => c.id !== id)
  
  if (filtered.length === existing.length) return false
  
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(filtered))
    
    // If this was the active campaign, clear it
    if (getActiveCampaignId() === id) {
      setActiveCampaign(null)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return false
  }
}

// Add avatar to campaign
export function addAvatarToCampaign(campaignId: string, avatarId: string): boolean {
  const campaign = getCampaign(campaignId)
  if (!campaign) return false
  
  if (campaign.avatarIds.includes(avatarId)) return true // Already added
  
  const updated = updateCampaign(campaignId, {
    avatarIds: [...campaign.avatarIds, avatarId]
  })
  
  return updated !== null
}

// Remove avatar from campaign
export function removeAvatarFromCampaign(campaignId: string, avatarId: string): boolean {
  const campaign = getCampaign(campaignId)
  if (!campaign) return false
  
  const updated = updateCampaign(campaignId, {
    avatarIds: campaign.avatarIds.filter(id => id !== avatarId)
  })
  
  return updated !== null
}

// Increment content count
export function incrementCampaignContentCount(id: string, amount: number = 1): void {
  const campaign = getCampaign(id)
  if (campaign) {
    updateCampaign(id, { contentCount: campaign.contentCount + amount })
  }
}

// Active campaign management
export function getActiveCampaignId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_CAMPAIGN_KEY)
}

export function getActiveCampaign(): Campaign | null {
  const id = getActiveCampaignId()
  if (!id) return null
  return getCampaign(id)
}

export function setActiveCampaign(id: string | null): void {
  if (typeof window === 'undefined') return
  
  if (id) {
    localStorage.setItem(ACTIVE_CAMPAIGN_KEY, id)
  } else {
    localStorage.removeItem(ACTIVE_CAMPAIGN_KEY)
  }
}

// Demo campaigns for quick start
export const DEMO_GAMES = [
  { id: 'demo', name: 'Super Bowl LX (Demo)', description: 'Simulated game events for testing' },
  { id: '401547602', name: 'Super Bowl LX (Live)', description: 'Real-time ESPN data' },
]

// Create a demo campaign
export function createDemoCampaign(brandName: string, brandColors: string[] = ['#18181b', '#f4f4f5']): Campaign {
  return saveCampaign({
    name: `${brandName} - Super Bowl`,
    gameId: 'demo',
    gameName: 'Super Bowl LX (Demo)',
    brandInfo: {
      name: brandName,
      colors: brandColors,
      industry: 'Business'
    }
  })
}

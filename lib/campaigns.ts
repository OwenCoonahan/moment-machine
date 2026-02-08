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
  { id: 'sb60-seahawks-patriots', name: 'Super Bowl LX - Seahawks vs Patriots', description: 'Seattle vs New England - Live game' },
  { id: 'sb58-replay', name: 'Super Bowl LVIII Replay', description: 'Chiefs vs 49ers - Full game events' },
  { id: 'demo', name: 'Super Bowl LIX (Demo)', description: 'Chiefs vs Eagles - Simulated events' },
  { id: '401547602', name: 'Live ESPN Game', description: 'Real-time ESPN data' },
]

// Super Bowl LVIII Real Events (Chiefs 25 - 49ers 22, OT)
export const GAME_EVENTS: Record<string, Array<{
  timestamp: string
  type: string
  team: string
  description: string
}>> = {
  'sb60-seahawks-patriots': [
    { timestamp: 'Q1 12:00', type: 'KICKOFF', team: '', description: 'Super Bowl LX kicks off - Seahawks vs Patriots' },
    { timestamp: 'Q1 9:22', type: 'FIELD_GOAL', team: 'Patriots', description: 'Folk 42-yard field goal - NE leads 3-0' },
    { timestamp: 'Q1 4:15', type: 'TOUCHDOWN', team: 'Seahawks', description: 'Walker III 28-yard rushing TD - SEA leads 7-3' },
    { timestamp: 'Q2 11:33', type: 'INTERCEPTION', team: 'Seahawks', description: 'Maye pass intercepted by Woolen' },
    { timestamp: 'Q2 8:45', type: 'TOUCHDOWN', team: 'Seahawks', description: 'Geno to Metcalf 35-yard TD - SEA leads 14-3' },
    { timestamp: 'Q2 3:21', type: 'FUMBLE', team: 'Patriots', description: 'Walker fumbles, recovered by Patriots' },
    { timestamp: 'Q2 0:08', type: 'FIELD_GOAL', team: 'Patriots', description: 'Folk 51-yard field goal - SEA leads 14-6 at half' },
    { timestamp: 'HALFTIME', type: 'HALFTIME', team: '', description: 'Kendrick Lamar halftime show performance' },
    { timestamp: 'Q3 10:44', type: 'TOUCHDOWN', team: 'Patriots', description: 'Maye to Henry 12-yard TD - SEA leads 14-13' },
    { timestamp: 'Q3 6:02', type: 'BIG_PLAY', team: 'Seahawks', description: 'Geno to Lockett 52-yard catch - inside the 10' },
    { timestamp: 'Q3 5:33', type: 'TOUCHDOWN', team: 'Seahawks', description: 'Walker III 3-yard TD run - SEA leads 21-13' },
    { timestamp: 'Q4 12:15', type: 'FIELD_GOAL', team: 'Patriots', description: 'Folk 38-yard field goal - SEA leads 21-16' },
    { timestamp: 'Q4 7:22', type: 'INTERCEPTION', team: 'Patriots', description: 'Geno picked off by Gonzalez' },
    { timestamp: 'Q4 5:11', type: 'TOUCHDOWN', team: 'Patriots', description: 'Maye to Boutte 18-yard TD - NE leads 23-21' },
    { timestamp: 'Q4 2:30', type: 'BIG_PLAY', team: 'Seahawks', description: 'Metcalf 44-yard catch - Seahawks at the 25' },
    { timestamp: 'Q4 0:22', type: 'TOUCHDOWN', team: 'Seahawks', description: 'Geno to JSN 8-yard TD - SEAHAWKS WIN 28-23!' },
  ],
  'sb58-replay': [
    { timestamp: 'Q1 11:54', type: 'FIELD_GOAL', team: '49ers', description: 'Jake Moody 55-yard field goal - SF leads 3-0' },
    { timestamp: 'Q1 5:14', type: 'TOUCHDOWN', team: 'Chiefs', description: 'Mahomes to Kelce 22-yard TD pass - KC leads 7-3' },
    { timestamp: 'Q2 9:02', type: 'FIELD_GOAL', team: '49ers', description: 'Jake Moody 53-yard field goal - Tied 7-6' },
    { timestamp: 'Q2 0:06', type: 'FIELD_GOAL', team: '49ers', description: 'Jake Moody 27-yard field goal - SF leads 10-7 at half' },
    { timestamp: 'HALFTIME', type: 'HALFTIME', team: '', description: 'Usher halftime show performance' },
    { timestamp: 'Q3 11:43', type: 'TOUCHDOWN', team: '49ers', description: 'CMC 21-yard rushing TD - SF leads 16-7' },
    { timestamp: 'Q3 8:42', type: 'FIELD_GOAL', team: '49ers', description: 'Jake Moody 52-yard field goal - SF leads 19-7' },
    { timestamp: 'Q4 13:23', type: 'FIELD_GOAL', team: 'Chiefs', description: 'Harrison Butker 28-yard field goal - SF leads 19-10' },
    { timestamp: 'Q4 6:16', type: 'INTERCEPTION', team: 'Chiefs', description: 'Dre Greenlaw intercepts Mahomes - turnover' },
    { timestamp: 'Q4 2:51', type: 'TOUCHDOWN', team: 'Chiefs', description: 'Mahomes to Hardman 11-yard TD - SF leads 19-16' },
    { timestamp: 'Q4 1:53', type: 'FIELD_GOAL', team: '49ers', description: 'Jake Moody 24-yard field goal - SF leads 22-16' },
    { timestamp: 'Q4 0:03', type: 'TOUCHDOWN', team: 'Chiefs', description: 'Mahomes to Hardman 5-yard TD - Tied 22-22, OVERTIME!' },
    { timestamp: 'OT 11:40', type: 'INTERCEPTION', team: '49ers', description: 'Chiefs intercept Purdy - turnover in OT' },
    { timestamp: 'OT 3:14', type: 'TOUCHDOWN', team: 'Chiefs', description: 'Mahomes to Hardman 3-yard TD - CHIEFS WIN 25-22!' },
  ],
  'demo': [
    { timestamp: 'Q1 12:00', type: 'KICKOFF', team: '', description: 'Game begins - Super Bowl LX' },
    { timestamp: 'Q1 8:34', type: 'TOUCHDOWN', team: 'Chiefs', description: 'Mahomes to Kelce 15-yard TD pass' },
    { timestamp: 'Q1 3:21', type: 'FIELD_GOAL', team: 'Eagles', description: 'Elliott 47-yard field goal' },
    { timestamp: 'Q2 10:15', type: 'INTERCEPTION', team: 'Eagles', description: 'Hurts pass intercepted by Bolton' },
    { timestamp: 'Q2 5:44', type: 'TOUCHDOWN', team: 'Chiefs', description: 'Pacheco 8-yard rushing TD' },
    { timestamp: 'HALFTIME', type: 'HALFTIME', team: '', description: 'Kendrick Lamar halftime show' },
    { timestamp: 'Q3 9:22', type: 'FUMBLE', team: 'Chiefs', description: 'Ball recovered by Eagles at the 30' },
    { timestamp: 'Q3 4:11', type: 'TOUCHDOWN', team: 'Eagles', description: 'Hurts to AJ Brown 35-yard TD' },
    { timestamp: 'Q4 8:00', type: 'FIELD_GOAL', team: 'Chiefs', description: 'Butker 41-yard field goal' },
    { timestamp: 'Q4 2:05', type: 'BIG_PLAY', team: 'Eagles', description: '45-yard completion to DeVonta Smith' },
    { timestamp: 'Q4 0:34', type: 'TOUCHDOWN', team: 'Eagles', description: 'Hurts 2-yard QB sneak - GAME WINNER!' },
  ]
}

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

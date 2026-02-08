// Settings management - brand settings and social integrations

export interface BrandSettings {
  websiteUrl: string
  brandName: string
  industry: string
  colors: [string, string, string]
  logoUrl?: string
}

export interface SocialIntegrations {
  twitter: {
    apiKey: string
    apiSecret: string
    accessToken: string
    accessSecret: string
  }
  instagram: {
    accessToken: string
  }
  tiktok: {
    apiKey: string
  }
  ayrshare: {
    apiKey: string
  }
}

export interface Settings {
  brand: BrandSettings
  integrations: SocialIntegrations
  updatedAt: number
}

const SETTINGS_KEY = 'moment-machine-settings'

const DEFAULT_SETTINGS: Settings = {
  brand: {
    websiteUrl: '',
    brandName: '',
    industry: '',
    colors: ['#18181b', '#f4f4f5', '#ffffff'],
    logoUrl: ''
  },
  integrations: {
    twitter: {
      apiKey: '',
      apiSecret: '',
      accessToken: '',
      accessSecret: ''
    },
    instagram: {
      accessToken: ''
    },
    tiktok: {
      apiKey: ''
    },
    ayrshare: {
      apiKey: ''
    }
  },
  updatedAt: Date.now()
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch (error) {
    console.error('Error reading settings:', error)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return
  
  try {
    const updated = { ...settings, updatedAt: Date.now() }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

export function saveBrandSettings(brand: BrandSettings): void {
  const current = getSettings()
  saveSettings({ ...current, brand })
}

export function saveSocialIntegrations(integrations: SocialIntegrations): void {
  const current = getSettings()
  saveSettings({ ...current, integrations })
}

export function isIntegrationConnected(platform: 'twitter' | 'instagram' | 'tiktok' | 'ayrshare'): boolean {
  const settings = getSettings()
  const integration = settings.integrations[platform]
  
  if (platform === 'twitter') {
    const t = integration as typeof settings.integrations.twitter
    return !!(t.apiKey && t.apiSecret && t.accessToken && t.accessSecret)
  }
  
  if (platform === 'instagram') {
    return !!(integration as typeof settings.integrations.instagram).accessToken
  }
  
  if (platform === 'tiktok') {
    return !!(integration as typeof settings.integrations.tiktok).apiKey
  }
  
  if (platform === 'ayrshare') {
    return !!(integration as typeof settings.integrations.ayrshare).apiKey
  }
  
  return false
}

// Extract brand info from URL (copied from dashboard logic)
export function extractBrandFromUrl(url: string): Partial<BrandSettings> | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const domain = urlObj.hostname.replace('www.', '')
    const brandName = domain.split('.')[0]
    
    const knownBrands: Record<string, { name: string; colors: [string, string, string]; industry: string }> = {
      'chipotle': { name: 'Chipotle', colors: ['#441500', '#A81612', '#F5F0EB'], industry: 'Restaurant' },
      'dominos': { name: "Domino's", colors: ['#006491', '#E31837', '#FFFFFF'], industry: 'Restaurant' },
      'wingstop': { name: 'Wingstop', colors: ['#024731', '#FFD100', '#FFFFFF'], industry: 'Restaurant' },
      'buffalowildwings': { name: 'Buffalo Wild Wings', colors: ['#FFB612', '#000000', '#FFFFFF'], industry: 'Restaurant' },
      'bww': { name: 'Buffalo Wild Wings', colors: ['#FFB612', '#000000', '#FFFFFF'], industry: 'Restaurant' },
      'papajohns': { name: "Papa John's", colors: ['#006341', '#ED1C24', '#FFFFFF'], industry: 'Restaurant' },
      'pizzahut': { name: 'Pizza Hut', colors: ['#EE3A43', '#00A65E', '#FFFFFF'], industry: 'Restaurant' },
      'wendys': { name: "Wendy's", colors: ['#E2203B', '#199FDA', '#FFFFFF'], industry: 'Restaurant' },
      'tacobell': { name: 'Taco Bell', colors: ['#702082', '#FF5A00', '#FFFFFF'], industry: 'Restaurant' },
      'mcdonalds': { name: "McDonald's", colors: ['#FFC72C', '#DA291C', '#FFFFFF'], industry: 'Restaurant' },
      'burgerking': { name: 'Burger King', colors: ['#D62300', '#F5EBDC', '#0033A0'], industry: 'Restaurant' },
      'nike': { name: 'Nike', colors: ['#111111', '#FFFFFF', '#F5F5F5'], industry: 'Sportswear' },
      'cocacola': { name: 'Coca-Cola', colors: ['#F40009', '#FFFFFF', '#000000'], industry: 'Beverage' },
    }
    
    const known = knownBrands[brandName.toLowerCase()]
    return {
      websiteUrl: url,
      brandName: known?.name || brandName.charAt(0).toUpperCase() + brandName.slice(1),
      colors: known?.colors || ['#18181b', '#f4f4f5', '#ffffff'],
      industry: known?.industry || 'Business'
    }
  } catch {
    return null
  }
}

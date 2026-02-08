import { NextResponse } from 'next/server'

interface BrandInfo {
  name: string
  colors: string[]
  logo?: string
  favicon?: string
  description?: string
}

// Extract colors from CSS/HTML
function extractColorsFromHtml(html: string): string[] {
  const colors: Set<string> = new Set()
  
  // Find hex colors
  const hexPattern = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g
  const hexMatches = html.match(hexPattern) || []
  hexMatches.forEach(c => {
    // Normalize 3-digit hex to 6-digit
    if (c.length === 4) {
      const r = c[1], g = c[2], b = c[3]
      colors.add(`#${r}${r}${g}${g}${b}${b}`.toUpperCase())
    } else {
      colors.add(c.toUpperCase())
    }
  })
  
  // Find rgb/rgba colors
  const rgbPattern = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g
  let match
  while ((match = rgbPattern.exec(html)) !== null) {
    const hex = '#' + [match[1], match[2], match[3]]
      .map(x => parseInt(x).toString(16).padStart(2, '0'))
      .join('')
    colors.add(hex.toUpperCase())
  }
  
  // Filter out common non-brand colors (black, white, grays)
  const filtered = Array.from(colors).filter(c => {
    const lower = c.toLowerCase()
    // Keep if not pure black/white/gray
    return ![
      '#000000', '#ffffff', '#fff', '#000',
      '#f5f5f5', '#eeeeee', '#e5e5e5', '#cccccc',
      '#999999', '#666666', '#333333', '#111111',
    ].includes(lower)
  })
  
  // Return top 3 most likely brand colors (prioritize vibrant ones)
  return filtered.slice(0, 3)
}

// Extract brand name from various sources
function extractBrandName(html: string, url: string): string {
  // Try og:site_name
  const ogSiteName = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i)
  if (ogSiteName) return ogSiteName[1]
  
  // Try title tag
  const title = html.match(/<title[^>]*>([^<]+)</i)
  if (title) {
    // Clean up title - remove common suffixes
    let name = title[1]
      .split(/[|\-–—]/)[0]
      .trim()
    return name
  }
  
  // Fallback to domain
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '').split('.')[0]
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return 'Brand'
  }
}

// Extract logo URL
function extractLogo(html: string, baseUrl: string): string | undefined {
  // Try og:image first
  const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
  if (ogImage) {
    return resolveUrl(ogImage[1], baseUrl)
  }
  
  // Try apple-touch-icon
  const appleTouchIcon = html.match(/<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/i)
  if (appleTouchIcon) {
    return resolveUrl(appleTouchIcon[1], baseUrl)
  }
  
  // Try favicon
  const favicon = html.match(/<link[^>]*rel="(?:shortcut )?icon"[^>]*href="([^"]+)"/i)
  if (favicon) {
    return resolveUrl(favicon[1], baseUrl)
  }
  
  return undefined
}

function resolveUrl(url: string, base: string): string {
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return 'https:' + url
  if (url.startsWith('/')) {
    const baseUrl = new URL(base)
    return `${baseUrl.protocol}//${baseUrl.host}${url}`
  }
  return base + '/' + url
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }
    
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    
    // Fetch the page
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandExtractor/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch: ${response.status}`,
        fallback: true,
        name: extractBrandName('', normalizedUrl),
        colors: ['#E31837', '#006B3F', '#FFFFFF'], // Default restaurant colors
      })
    }
    
    const html = await response.text()
    
    // Extract brand info
    const name = extractBrandName(html, normalizedUrl)
    let colors = extractColorsFromHtml(html)
    const logo = extractLogo(html, normalizedUrl)
    
    // If no colors found, use defaults
    if (colors.length === 0) {
      colors = ['#E31837', '#006B3F', '#FFFFFF']
    }
    
    // Pad to 3 colors if needed
    while (colors.length < 3) {
      colors.push('#FFFFFF')
    }
    
    const brandInfo: BrandInfo = {
      name,
      colors: colors.slice(0, 3),
      logo,
    }
    
    return NextResponse.json(brandInfo)
    
  } catch (error) {
    console.error('Brand extraction error:', error)
    return NextResponse.json({ 
      error: 'Extraction failed',
      fallback: true,
      name: 'Brand',
      colors: ['#E31837', '#006B3F', '#FFFFFF'],
    })
  }
}

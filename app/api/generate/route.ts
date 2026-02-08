import { NextResponse } from 'next/server'

const FAL_KEY = process.env.FAL_KEY

// Real Fal.ai Flux image generation
async function generateImageWithFlux(prompt: string): Promise<string | null> {
  if (!FAL_KEY) {
    console.log('No FAL_KEY, using placeholder')
    return null
  }

  try {
    const response = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square_hd',
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      console.error('Fal.ai error:', response.status)
      return null
    }

    const data = await response.json()
    
    // Handle queue response
    if (data.request_id) {
      // Poll for result
      const resultUrl = `https://queue.fal.run/fal-ai/flux-pro/v1.1/requests/${data.request_id}`
      
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000))
        const resultResponse = await fetch(resultUrl, {
          headers: { 'Authorization': `Key ${FAL_KEY}` }
        })
        const result = await resultResponse.json()
        
        if (result.status === 'COMPLETED' && result.images?.[0]?.url) {
          return result.images[0].url
        }
        if (result.status === 'FAILED') {
          console.error('Fal.ai generation failed')
          return null
        }
      }
    }
    
    // Direct response
    if (data.images?.[0]?.url) {
      return data.images[0].url
    }

    return null
  } catch (error) {
    console.error('Fal.ai error:', error)
    return null
  }
}

// Fast synchronous Fal.ai call
async function generateImageFast(prompt: string): Promise<string | null> {
  if (!FAL_KEY) return null

  try {
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square_hd',
        num_images: 1,
      }),
    })

    const data = await response.json()
    return data.images?.[0]?.url || null
  } catch (error) {
    console.error('Flux schnell error:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { event, brand, count = 10 } = await request.json()
    
    const content = []
    const brandName = brand?.name || 'Your Business'
    
    // Generate content in parallel batches
    const prompts = generatePrompts(event, brandName, count)
    
    // Use faster model for mass generation
    const generateBatch = async (batchPrompts: string[]) => {
      return Promise.all(
        batchPrompts.map(async (prompt, i) => {
          const type = i % 5 === 0 ? 'video' : 'image'
          let url = null
          
          if (type === 'image' && FAL_KEY) {
            url = await generateImageFast(prompt)
          }
          
          return {
            id: `content-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            status: 'ready',
            url: url || `https://picsum.photos/400/400?random=${Date.now()}-${i}`,
            prompt,
            caption: generateCaption(event, brandName),
            hashtags: generateHashtags(event, brandName),
            platform: ['instagram', 'twitter', 'tiktok', 'facebook'][i % 4]
          }
        })
      )
    }
    
    // Process in batches of 5 for speed
    const batchSize = 5
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize)
      const results = await generateBatch(batch)
      content.push(...results)
    }

    return NextResponse.json({ 
      content, 
      generated: content.length,
      usingRealGeneration: !!FAL_KEY
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

function generatePrompts(event: string, brandName: string, count: number): string[] {
  const templates = [
    `Marketing social media post for ${brandName}: Celebrating a ${event} moment. Bold colors, exciting, football theme, modern design, professional.`,
    `Instagram story graphic for ${brandName}: ${event}! Special promotion, vibrant, eye-catching, with space for text overlay.`,
    `TikTok thumbnail for ${brandName}: Reacting to ${event}, energetic, youthful, trending aesthetic.`,
    `Twitter post image for ${brandName}: ${event} just happened! Minimalist, bold text, shareable design.`,
    `Facebook ad for ${brandName}: ${event} celebration special offer, professional, trustworthy, clear call to action.`,
    `Meme format for ${brandName}: Funny reaction to ${event}, relatable, viral potential, brand colors.`,
    `Sports bar promotional graphic: ${event}! Come celebrate at ${brandName}, beer and wings, game day vibes.`,
    `Restaurant special: ${event} deal at ${brandName}, food photography style, appetizing, promotional.`,
  ]
  
  const prompts = []
  for (let i = 0; i < count; i++) {
    prompts.push(templates[i % templates.length])
  }
  return prompts
}

function generateCaption(event: string, brandName: string): string {
  const templates = [
    `${event}! 🏈 ${brandName} celebrates with you! Use code GAMEDAY for 15% off! 🔥`,
    `That ${event} though! 😱 Time for ${brandName}! #SuperBowl`,
    `${event} energy! 💪 Come celebrate at ${brandName}! 🎉`,
    `BIG ${event} MOMENT! 🏆 ${brandName} has your back! Limited time offer inside! ⬇️`,
    `DID YOU SEE THAT ${event}?! 🤯 ${brandName} is going crazy right now!`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

function generateHashtags(event: string, brandName: string): string[] {
  return [
    '#SuperBowl',
    '#SuperBowlLX',
    '#GameDay',
    `#${brandName.replace(/[^a-zA-Z0-9]/g, '')}`,
    `#${event.replace(/[^a-zA-Z0-9]/g, '')}`,
    '#Football',
    '#BigGame',
    '#ChiefsVsEagles',
  ]
}

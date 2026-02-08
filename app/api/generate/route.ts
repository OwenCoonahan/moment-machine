import { NextResponse } from 'next/server'
import { buildPrompt, getRandomCaption, getPlatformFormat, type EventType, type ContentFormat, type BrandContext, type EventContext } from '@/lib/prompts'

const FAL_KEY = process.env.FAL_KEY

interface GenerateRequest {
  prompt?: string
  model?: string
  aspectRatio?: string
  numImages?: number
  platform?: string
  format?: ContentFormat
  brand?: {
    name: string
    industry?: string
    colors?: string[]
    tagline?: string
    products?: string[]
  }
  event?: {
    type: EventType
    description: string
    team?: string
    player?: string
    score?: string
  }
}

// Available models (not exported directly - use GET endpoint)
const MODELS = {
  // Image models - Fast
  'flux-schnell': { id: 'fal-ai/flux/schnell', name: 'Flux Schnell', type: 'image', speed: 'fastest', quality: 'good' },
  // Image models - High Quality
  'flux-pro': { id: 'fal-ai/flux-pro/v1.1', name: 'Flux Pro', type: 'image', speed: 'fast', quality: 'excellent' },
  'ideogram': { id: 'fal-ai/ideogram/v2', name: 'Ideogram v2', type: 'image', speed: 'medium', quality: 'excellent' },
  
  // Video models
  'kling-video': { id: 'fal-ai/kling-video/v1.5/pro', name: 'Kling Video', type: 'video', speed: 'slow' },
  'minimax-video': { id: 'fal-ai/minimax-video', name: 'MiniMax Video', type: 'video', speed: 'medium' },
}

// Map aspect ratio to Fal.ai size parameter
const sizeMap: Record<string, string> = {
  '1:1': 'square_hd',
  '4:3': 'landscape_4_3',
  '3:4': 'portrait_4_3',
  '16:9': 'landscape_16_9',
  '9:16': 'portrait_16_9',
}

// Generate image with Fal.ai
async function generateWithFal(
  model: string, 
  prompt: string, 
  aspectRatio: string = '1:1',
  numImages: number = 1
): Promise<{ url: string; model: string; prompt: string }[]> {
  if (!FAL_KEY) {
    console.error('No FAL_KEY configured - returning placeholder images')
    return Array(numImages).fill(null).map(() => ({ 
      url: `https://picsum.photos/1024/1024?random=${Date.now()}-${Math.random()}`, 
      model,
      prompt 
    }))
  }

  const modelConfig = MODELS[model as keyof typeof MODELS] || MODELS['flux-schnell']
  const imageSize = sizeMap[aspectRatio] || 'square_hd'
  
  console.log(`🎨 Generating ${numImages} image(s) with ${modelConfig.name}`)
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`)
  console.log(`📐 Size: ${imageSize}`)

  try {
    const response = await fetch(`https://fal.run/${modelConfig.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: imageSize,
        num_images: Math.min(numImages, 4), // Fal.ai max is 4 per request
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Fal.ai error ${response.status}:`, errorText)
      throw new Error(`Fal.ai API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Generated ${data.images?.length || 0} images`)
    
    if (data.images && data.images.length > 0) {
      return data.images.map((img: { url: string }) => ({ 
        url: img.url, 
        model: modelConfig.name,
        prompt 
      }))
    }

    throw new Error('No images returned from Fal.ai')
  } catch (error) {
    console.error('❌ Fal.ai generation error:', error)
    throw error
  }
}

// Generate multiple images in parallel for nuke mode
async function generateBatch(
  model: string,
  prompts: string[],
  aspectRatio: string = '1:1'
): Promise<{ url: string; model: string; prompt: string }[]> {
  const results: { url: string; model: string; prompt: string }[] = []
  const batchSize = 5 // Parallel requests
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(prompt => generateWithFal(model, prompt, aspectRatio, 1))
    )
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        results.push(...result.value)
      }
    }
  }
  
  return results
}

// Generate video with Fal.ai (queued)
async function generateVideoWithFal(
  prompt: string,
  model: string = 'minimax-video'
): Promise<{ requestId: string; model: string } | null> {
  if (!FAL_KEY) {
    console.error('No FAL_KEY for video generation')
    return null
  }

  const modelConfig = MODELS[model as keyof typeof MODELS] || MODELS['minimax-video']

  try {
    console.log(`🎬 Queuing video generation with ${modelConfig.name}`)
    
    const response = await fetch(`https://queue.fal.run/${modelConfig.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration: '5',
        aspect_ratio: '16:9',
      }),
    })

    if (!response.ok) {
      console.error('Fal.ai video queue error:', response.status)
      return null
    }

    const data = await response.json()
    console.log(`✅ Video queued with request_id: ${data.request_id}`)
    return { requestId: data.request_id, model: modelConfig.name }
  } catch (error) {
    console.error('Fal.ai video error:', error)
    return null
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    const body: GenerateRequest = await request.json()
    const { 
      prompt: customPrompt, 
      model = 'flux-schnell', 
      aspectRatio,
      numImages = 1, 
      platform = 'instagram-post',
      format = 'marketing',
      brand, 
      event 
    } = body

    // Build the prompt using our templates
    const eventContext: EventContext = event || {
      type: 'generic',
      description: 'Game day excitement'
    }
    
    const brandContext: BrandContext | undefined = brand ? {
      name: brand.name,
      industry: brand.industry,
      colors: brand.colors,
      tagline: brand.tagline,
      products: brand.products
    } : undefined

    // Get platform-specific formatting
    const platformFormat = getPlatformFormat(platform)
    const finalAspectRatio = aspectRatio || platformFormat.aspectRatio

    // Build enhanced prompt
    const enhancedPrompt = buildPrompt(eventContext, format, brandContext, customPrompt)
    
    console.log(`\n${'='.repeat(50)}`)
    console.log(`🚀 Generation Request`)
    console.log(`${'='.repeat(50)}`)
    console.log(`Model: ${model}`)
    console.log(`Platform: ${platform}`)
    console.log(`Format: ${format}`)
    console.log(`Aspect Ratio: ${finalAspectRatio}`)
    console.log(`Num Images: ${numImages}`)
    console.log(`Brand: ${brand?.name || 'none'}`)
    console.log(`Event: ${event?.type || 'generic'}`)

    const modelConfig = MODELS[model as keyof typeof MODELS]
    
    if (modelConfig?.type === 'video') {
      const video = await generateVideoWithFal(enhancedPrompt, model)
      const duration = Date.now() - startTime
      
      return NextResponse.json({
        success: true,
        type: 'video',
        content: video ? [{
          requestId: video.requestId,
          model: video.model,
          status: 'processing',
          prompt: enhancedPrompt
        }] : [],
        model,
        duration,
        caption: brand ? getRandomCaption(eventContext.type, brand.name) : undefined
      })
    } else {
      const images = await generateWithFal(
        model, 
        enhancedPrompt, 
        finalAspectRatio, 
        numImages
      )
      
      const duration = Date.now() - startTime
      console.log(`⏱️ Generated ${images.length} images in ${duration}ms`)
      
      return NextResponse.json({
        success: true,
        type: 'image',
        content: images.map(img => ({
          url: img.url,
          model: img.model,
          prompt: img.prompt,
          aspectRatio: finalAspectRatio,
          platform
        })),
        model,
        duration,
        caption: brand ? getRandomCaption(eventContext.type, brand.name) : undefined
      })
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Generation failed after ${duration}ms:`, error)
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Generation failed',
      duration
    }, { status: 500 })
  }
}

// GET endpoint to list available models and check API status
export async function GET() {
  return NextResponse.json({
    models: Object.entries(MODELS).map(([key, value]) => ({
      ...value,
      modelId: key,
    })),
    hasApiKey: !!FAL_KEY,
    apiKeyPrefix: FAL_KEY ? FAL_KEY.substring(0, 8) + '...' : null
  })
}

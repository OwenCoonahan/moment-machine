import { NextResponse } from 'next/server'

const FAL_KEY = process.env.FAL_KEY

interface GenerateRequest {
  prompt: string
  model: string
  aspectRatio?: string
  numImages?: number
  brand?: {
    name: string
    industry?: string
  }
  event?: {
    type: string
    description: string
  }
}

// Available models
export const MODELS = {
  // Image models
  'flux-pro': { id: 'fal-ai/flux-pro/v1.1', name: 'Flux Pro', type: 'image', speed: 'fast' },
  'flux-schnell': { id: 'fal-ai/flux/schnell', name: 'Flux Schnell', type: 'image', speed: 'fastest' },
  'grok-image': { id: 'xai/grok-imagine-image', name: 'Grok Image', type: 'image', speed: 'fast' },
  'ideogram': { id: 'fal-ai/ideogram/v2', name: 'Ideogram v2', type: 'image', speed: 'medium' },
  
  // Video models
  'kling-video': { id: 'fal-ai/kling-video/v1.5/pro', name: 'Kling Video', type: 'video', speed: 'slow' },
  'minimax-video': { id: 'fal-ai/minimax-video', name: 'MiniMax Video', type: 'video', speed: 'medium' },
}

// Generate image with Fal.ai
async function generateWithFal(
  model: string, 
  prompt: string, 
  aspectRatio: string = '1:1',
  numImages: number = 1
): Promise<{ url: string; model: string }[]> {
  if (!FAL_KEY) {
    console.log('No FAL_KEY - returning placeholder')
    return Array(numImages).fill({ url: `https://picsum.photos/512/512?random=${Date.now()}`, model })
  }

  const modelConfig = MODELS[model as keyof typeof MODELS] || MODELS['flux-schnell']
  
  // Map aspect ratio to size
  const sizeMap: Record<string, string> = {
    '1:1': 'square_hd',
    '4:3': 'landscape_4_3',
    '3:4': 'portrait_4_3',
    '16:9': 'landscape_16_9',
    '9:16': 'portrait_16_9',
  }

  try {
    // Use synchronous endpoint for speed
    const response = await fetch(`https://fal.run/${modelConfig.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: sizeMap[aspectRatio] || 'square_hd',
        num_images: numImages,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Fal.ai error:', response.status, error)
      return Array(numImages).fill({ url: `https://picsum.photos/512/512?random=${Date.now()}`, model })
    }

    const data = await response.json()
    
    if (data.images && data.images.length > 0) {
      return data.images.map((img: { url: string }) => ({ url: img.url, model }))
    }

    return Array(numImages).fill({ url: `https://picsum.photos/512/512?random=${Date.now()}`, model })
  } catch (error) {
    console.error('Fal.ai generation error:', error)
    return Array(numImages).fill({ url: `https://picsum.photos/512/512?random=${Date.now()}`, model })
  }
}

// Generate video with Fal.ai
async function generateVideoWithFal(
  prompt: string,
  model: string = 'minimax-video'
): Promise<{ url: string; model: string } | null> {
  if (!FAL_KEY) {
    return null
  }

  const modelConfig = MODELS[model as keyof typeof MODELS] || MODELS['minimax-video']

  try {
    // Queue the video generation (videos take longer)
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
      console.error('Fal.ai video error:', response.status)
      return null
    }

    const data = await response.json()
    return { url: data.request_id || 'pending', model }
  } catch (error) {
    console.error('Fal.ai video error:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json()
    const { prompt, model, aspectRatio = '1:1', numImages = 1, brand, event } = body

    // Build enhanced prompt with brand context
    let enhancedPrompt = prompt
    if (brand && event) {
      enhancedPrompt = `Marketing content for ${brand.name} (${brand.industry || 'business'}): ${event.type} moment - ${event.description}. ${prompt}`
    }

    const modelConfig = MODELS[model as keyof typeof MODELS]
    
    if (modelConfig?.type === 'video') {
      const video = await generateVideoWithFal(enhancedPrompt, model)
      return NextResponse.json({
        success: true,
        type: 'video',
        content: video ? [video] : [],
        model,
      })
    } else {
      const images = await generateWithFal(model || 'flux-schnell', enhancedPrompt, aspectRatio, numImages)
      return NextResponse.json({
        success: true,
        type: 'image',
        content: images,
        model,
      })
    }
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 })
  }
}

// GET endpoint to list available models
export async function GET() {
  return NextResponse.json({
    models: Object.entries(MODELS).map(([key, value]) => ({
      id: key,
      ...value
    })),
    hasApiKey: !!FAL_KEY
  })
}

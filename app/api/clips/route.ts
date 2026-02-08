import { NextRequest, NextResponse } from 'next/server'
import { supabase, listBuckets } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket') || 'videos'
    const folder = searchParams.get('folder') || ''
    
    // First try to list buckets to see what's available
    const buckets = await listBuckets()
    
    // Known folders to scan in videos bucket
    const knownFolders = ['originals', 'reels', 'test']
    
    let allClips: any[] = []
    let allFolders: string[] = []
    
    if (folder) {
      // List specific folder
      const result = await supabase.storage.from(bucket).list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })
      
      if (result.data) {
        const clips = result.data
          .filter(file => file.name && !file.name.startsWith('.') && file.metadata?.size)
          .map(file => {
            const path = `${folder}/${file.name}`
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
            const isVideo = file.name.match(/\.(mp4|mov|webm|avi)$/i)
            const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            
            return {
              id: file.id,
              name: file.name,
              folder,
              url: urlData.publicUrl,
              type: isVideo ? 'video' : isImage ? 'image' : 'file',
              size: file.metadata?.size || 0,
              createdAt: file.created_at,
              metadata: file.metadata
            }
          })
        allClips = clips
      }
    } else {
      // Scan all known folders
      for (const folderName of knownFolders) {
        const result = await supabase.storage.from(bucket).list(folderName, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })
        
        if (result.data) {
          const clips = result.data
            .filter(file => file.name && !file.name.startsWith('.') && file.metadata?.size)
            .map(file => {
              const path = `${folderName}/${file.name}`
              const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
              const isVideo = file.name.match(/\.(mp4|mov|webm|avi)$/i)
              const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              
              return {
                id: file.id,
                name: file.name,
                folder: folderName,
                url: urlData.publicUrl,
                type: isVideo ? 'video' : isImage ? 'image' : 'file',
                size: file.metadata?.size || 0,
                createdAt: file.created_at,
                metadata: file.metadata
              }
            })
          allClips.push(...clips)
        }
      }
      allFolders = knownFolders
    }
    
    return NextResponse.json({
      success: true,
      bucket,
      folder,
      clips: allClips,
      folders: allFolders,
      buckets: buckets.length > 0 ? buckets.map(b => b.name) : ['videos'],
      totalFiles: allClips.length
    })
  } catch (err: any) {
    console.error('Clips API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}

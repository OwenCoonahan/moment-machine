import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface ClipItem {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  size: number
  createdAt: Date
  metadata?: Record<string, any>
}

// List all files in a storage bucket
export async function listStorageFiles(bucket: string = 'content'): Promise<ClipItem[]> {
  const { data, error } = await supabase.storage.from(bucket).list('', {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' }
  })
  
  if (error) {
    console.error('Error listing storage files:', error)
    return []
  }
  
  if (!data) return []
  
  // Get public URLs for each file
  const items: ClipItem[] = data
    .filter(file => !file.id.includes('/')) // Skip folders
    .map(file => {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name)
      const isVideo = file.name.match(/\.(mp4|mov|webm|avi)$/i)
      
      return {
        id: file.id,
        name: file.name,
        url: urlData.publicUrl,
        type: isVideo ? 'video' as const : 'image' as const,
        size: file.metadata?.size || 0,
        createdAt: new Date(file.created_at),
        metadata: file.metadata
      }
    })
  
  return items
}

// List files in a subfolder
export async function listStorageFolder(bucket: string, folder: string): Promise<ClipItem[]> {
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' }
  })
  
  if (error) {
    console.error('Error listing folder:', error)
    return []
  }
  
  if (!data) return []
  
  const items: ClipItem[] = data
    .filter(file => file.name && !file.name.endsWith('/'))
    .map(file => {
      const path = folder ? `${folder}/${file.name}` : file.name
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      const isVideo = file.name.match(/\.(mp4|mov|webm|avi)$/i)
      
      return {
        id: file.id,
        name: file.name,
        url: urlData.publicUrl,
        type: isVideo ? 'video' as const : 'image' as const,
        size: file.metadata?.size || 0,
        createdAt: new Date(file.created_at),
        metadata: file.metadata
      }
    })
  
  return items
}

// List all buckets
export async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error('Error listing buckets:', error)
    return []
  }
  
  return data || []
}

'use client'

import { useState, useEffect } from 'react'
import { X, Send, Check, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Platform {
  id: string
  name: string
  icon: string
  color: string
  connected: boolean
  supported: boolean
}

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  content: {
    id: string
    url?: string
    caption?: string
    platform?: string
  } | null
}

export function PostModal({ isOpen, onClose, content }: PostModalProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [postResults, setPostResults] = useState<Record<string, { success: boolean; postUrl?: string; error?: string }> | null>(null)
  const [demoMode, setDemoMode] = useState(true)

  // Load available platforms
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      fetch('/api/post')
        .then(res => res.json())
        .then(data => {
          setPlatforms(data.platforms || [])
          setDemoMode(data.demoMode || false)
          setIsLoading(false)
        })
        .catch(() => {
          // Default platforms for demo
          setPlatforms([
            { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000000', connected: true, supported: true },
            { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E4405F', connected: true, supported: true },
            { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2', connected: true, supported: true },
            { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', connected: true, supported: true },
            { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', connected: true, supported: true },
          ])
          setIsLoading(false)
        })
      
      // Reset state
      setSelectedPlatforms([])
      setPostResults(null)
    }
  }, [isOpen])

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const selectAll = () => {
    setSelectedPlatforms(platforms.filter(p => p.connected).map(p => p.id))
  }

  const handlePost = async () => {
    if (!content || selectedPlatforms.length === 0) return
    
    setIsPosting(true)
    setPostResults(null)

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: content.url,
          caption: content.caption || 'Check this out! 🏈',
          platforms: selectedPlatforms,
        }),
      })

      const data = await response.json()
      setPostResults(data.results || {})
    } catch (error) {
      console.error('Post error:', error)
      // Show error for all platforms
      const errorResults: Record<string, { success: boolean; error: string }> = {}
      selectedPlatforms.forEach(p => {
        errorResults[p] = { success: false, error: 'Network error' }
      })
      setPostResults(errorResults)
    }

    setIsPosting(false)
  }

  if (!isOpen || !content) return null

  const successCount = postResults 
    ? Object.values(postResults).filter(r => r.success).length 
    : 0
  const hasPosted = postResults !== null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold">Post to Social Media</h2>
            <p className="text-sm text-muted-foreground">
              {demoMode ? 'Demo Mode - No actual posting' : 'Select platforms to post'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-4 bg-muted/30">
          <div className="flex gap-3">
            {content.url ? (
              <img
                src={content.url}
                alt="Content preview"
                className="w-20 h-20 rounded-md object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center border">
                <span className="text-2xl">📷</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm line-clamp-3">{content.caption || 'No caption'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Platform Selection */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Select Platforms</span>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={selectAll}>
              Select All
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {platforms.map(platform => {
                const result = postResults?.[platform.id]
                const isSelected = selectedPlatforms.includes(platform.id)

                return (
                  <button
                    key={platform.id}
                    onClick={() => !hasPosted && togglePlatform(platform.id)}
                    disabled={!platform.connected || hasPosted}
                    className={`w-full flex items-center gap-3 p-3 rounded-md border transition-colors ${
                      isSelected && !hasPosted
                        ? 'border-foreground bg-muted/50'
                        : hasPosted && result
                          ? result.success
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-red-200 bg-red-50'
                          : 'border-border hover:border-foreground/30'
                    } ${!platform.connected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-xl w-8">{platform.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{platform.name}</p>
                      {!platform.connected && (
                        <p className="text-xs text-muted-foreground">Not connected</p>
                      )}
                      {result && !result.success && (
                        <p className="text-xs text-red-600">{result.error}</p>
                      )}
                    </div>
                    
                    {/* Status indicator */}
                    {hasPosted && result ? (
                      result.success ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Check className="w-4 h-4" />
                          {result.postUrl && (
                            <a 
                              href={result.postUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )
                    ) : isSelected ? (
                      <div className="w-5 h-5 rounded-md bg-foreground flex items-center justify-center">
                        <Check className="w-3 h-3 text-background" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border border-border" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          {hasPosted ? (
            <>
              <div className="text-sm text-muted-foreground">
                {successCount} of {Object.keys(postResults || {}).length} posted successfully
              </div>
              <Button onClick={onClose}>
                Done
              </Button>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePost}
                  disabled={selectedPlatforms.length === 0 || isPosting}
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      Post Now
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

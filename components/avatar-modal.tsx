'use client'

import { useState } from 'react'
import { X, Sparkles, Plus } from 'lucide-react'
import { saveAvatar, AVATAR_TEMPLATES, getAvatarPlaceholder, Avatar } from '@/lib/avatars'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

interface AvatarModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (avatar: Avatar) => void
  brandName?: string
}

export function AvatarModal({ isOpen, onClose, onCreated, brandName }: AvatarModalProps) {
  const [mode, setMode] = useState<'template' | 'custom'>('template')
  
  // Custom avatar form
  const [name, setName] = useState('')
  const [personality, setPersonality] = useState('')
  const [voiceStyle, setVoiceStyle] = useState('')
  const [brandPlacements, setBrandPlacements] = useState('')
  
  const handleCreateFromTemplate = (templateIndex: number) => {
    const template = AVATAR_TEMPLATES[templateIndex]
    const avatar = saveAvatar({
      name: template.name,
      imageUrl: getAvatarPlaceholder(template.name),
      personality: template.personality,
      voiceStyle: template.voiceStyle,
      brandAssociations: brandName ? [brandName] : [],
      brandPlacements: template.brandPlacements
    })
    
    onCreated(avatar)
    onClose()
  }
  
  const handleCreateCustom = () => {
    if (!name || !personality) return
    
    const avatar = saveAvatar({
      name,
      imageUrl: getAvatarPlaceholder(name),
      personality,
      voiceStyle: voiceStyle || 'Natural, conversational',
      brandAssociations: brandName ? [brandName] : [],
      brandPlacements: brandPlacements ? brandPlacements.split(',').map(s => s.trim()) : []
    })
    
    onCreated(avatar)
    onClose()
    
    // Reset form
    setName('')
    setPersonality('')
    setVoiceStyle('')
    setBrandPlacements('')
    setMode('template')
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold">Add Avatar</h2>
            <p className="text-sm text-muted-foreground">
              Create an AI character for your content
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex p-4 gap-2">
          <button
            onClick={() => setMode('template')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'template'
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/70'
            }`}
          >
            From Template
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'custom'
                ? 'bg-foreground text-background'
                : 'bg-muted hover:bg-muted/70'
            }`}
          >
            Custom
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mode === 'template' ? (
            <div className="space-y-2">
              {AVATAR_TEMPLATES.map((template, i) => (
                <Card 
                  key={i}
                  className="hover:border-foreground/30 transition-colors cursor-pointer group"
                  onClick={() => handleCreateFromTemplate(i)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full bg-cover bg-center border border-border shrink-0"
                      style={{ backgroundImage: `url(${getAvatarPlaceholder(template.name)})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.personality}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        Voice: {template.voiceStyle.slice(0, 30)}...
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar-name">Name *</Label>
                <Input
                  id="avatar-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex"
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar-personality">Personality *</Label>
                <textarea
                  id="avatar-personality"
                  value={personality}
                  onChange={e => setPersonality(e.target.value)}
                  placeholder="Describe their personality, style, and how they talk..."
                  className="w-full min-h-[80px] text-sm border border-input rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar-voice">Voice Style</Label>
                <Input
                  id="avatar-voice"
                  value={voiceStyle}
                  onChange={e => setVoiceStyle(e.target.value)}
                  placeholder="Upbeat, energetic, millennial vibe"
                  className="bg-white"
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="avatar-placements">Brand Placements</Label>
                <Input
                  id="avatar-placements"
                  value={brandPlacements}
                  onChange={e => setBrandPlacements(e.target.value)}
                  placeholder="Product on desk, logo on shirt (comma separated)"
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground">
                  Visual elements to include when generating content
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {mode === 'custom' && (
          <div className="p-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCustom}
              disabled={!name || !personality}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Create Avatar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

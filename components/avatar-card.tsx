'use client'

import { useState } from 'react'
import { Zap, Trash2, MoreVertical, Sparkles } from 'lucide-react'
import { Avatar, getAvatarPlaceholder, deleteAvatar } from '@/lib/avatars'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AvatarCardProps {
  avatar: Avatar
  onGenerate?: (avatar: Avatar) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

export function AvatarCard({ avatar, onGenerate, onDelete, compact = false }: AvatarCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const imageUrl = avatar.imageUrl || getAvatarPlaceholder(avatar.name)
  
  const handleDelete = () => {
    if (confirm(`Delete ${avatar.name}?`)) {
      deleteAvatar(avatar.id)
      onDelete?.(avatar.id)
    }
    setShowMenu(false)
  }
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div 
          className="w-8 h-8 rounded-full bg-cover bg-center border border-border"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{avatar.name}</p>
          <p className="text-xs text-muted-foreground truncate">{avatar.personality.slice(0, 30)}...</p>
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {avatar.contentCount}
        </Badge>
      </div>
    )
  }
  
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border group hover:border-primary transition-colors">
      {/* Avatar Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-sm font-medium">{avatar.name}</p>
        <p className="text-white/70 text-xs line-clamp-1">{avatar.personality}</p>
        
        {/* Stats */}
        <div className="flex items-center gap-2 mt-2">
          <Badge 
            variant="secondary" 
            className="text-xs bg-white/20 text-white border-0 backdrop-blur-sm"
          >
            {avatar.contentCount} generated
          </Badge>
        </div>
      </div>
      
      {/* Hover Actions */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button 
          size="sm" 
          onClick={() => onGenerate?.(avatar)}
          className="gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate
        </Button>
      </div>
      
      {/* Menu Button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-md bg-black/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-border py-1 z-10">
            <button
              onClick={handleDelete}
              className="w-full px-3 py-1.5 text-left text-sm text-destructive hover:bg-muted flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// New Avatar Card (dashed border add button)
export function AddAvatarCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
    >
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
        <Zap className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium">Add Avatar</span>
    </button>
  )
}

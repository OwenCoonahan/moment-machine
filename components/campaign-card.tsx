'use client'

import { useState } from 'react'
import { Plus, MoreVertical, Trash2, Users, Image as ImageIcon, Play } from 'lucide-react'
import { Campaign, deleteCampaign, setActiveCampaign, getActiveCampaignId } from '@/lib/campaigns'
import { getAvatars, Avatar } from '@/lib/avatars'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CampaignCardProps {
  campaign: Campaign
  isActive?: boolean
  onSelect?: (campaign: Campaign) => void
  onDelete?: (id: string) => void
}

export function CampaignCard({ campaign, isActive, onSelect, onDelete }: CampaignCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  // Get avatar count
  const avatarCount = campaign.avatarIds.length
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete campaign "${campaign.name}"?`)) {
      deleteCampaign(campaign.id)
      onDelete?.(campaign.id)
    }
    setShowMenu(false)
  }
  
  const handleSelect = () => {
    setActiveCampaign(campaign.id)
    onSelect?.(campaign)
  }
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-sm ${
        isActive 
          ? 'border-2 border-foreground' 
          : 'border border-border hover:border-foreground/30'
      }`}
      onClick={handleSelect}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{campaign.name}</p>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {campaign.gameName || campaign.gameId}
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-border py-1 z-20">
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
        
        {/* Brand Colors Preview */}
        <div className="flex items-center gap-1.5">
          {campaign.brandInfo.colors.slice(0, 3).map((color, i) => (
            <div 
              key={i}
              className="w-4 h-4 rounded border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {campaign.brandInfo.name}
          </span>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{avatarCount} avatar{avatarCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{campaign.contentCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Add Campaign Card (dashed border)
export function AddCampaignCard({ onClick }: { onClick: () => void }) {
  return (
    <Card 
      className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center py-6 text-muted-foreground hover:text-foreground transition-colors">
        <Plus className="h-6 w-6 mb-1" />
        <span className="text-sm font-medium">New Campaign</span>
      </CardContent>
    </Card>
  )
}

// Campaign List for Sidebar
interface CampaignListProps {
  campaigns: Campaign[]
  activeCampaignId: string | null
  onSelect: (campaign: Campaign) => void
  onDelete: (id: string) => void
  onAddNew: () => void
}

export function CampaignList({ 
  campaigns, 
  activeCampaignId, 
  onSelect, 
  onDelete,
  onAddNew 
}: CampaignListProps) {
  return (
    <div className="space-y-2">
      <AddCampaignCard onClick={onAddNew} />
      
      {campaigns.map(campaign => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          isActive={campaign.id === activeCampaignId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
      
      {campaigns.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No campaigns yet
        </p>
      )}
    </div>
  )
}

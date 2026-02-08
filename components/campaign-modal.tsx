'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Sparkles, Globe, Upload, Loader2 } from 'lucide-react'
import { saveCampaign, DEMO_GAMES, CampaignInput } from '@/lib/campaigns'
import { Avatar, getAvatars, AVATAR_TEMPLATES, saveAvatar, getAvatarPlaceholder } from '@/lib/avatars'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface CampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (campaign: any) => void
  initialBrand?: {
    name: string
    domain?: string
    colors: string[]
    industry: string
  }
}

export function CampaignModal({ isOpen, onClose, onCreated, initialBrand }: CampaignModalProps) {
  const [step, setStep] = useState(1) // 1: Details, 2: Avatars
  
  // Form state
  const [name, setName] = useState('')
  const [gameId, setGameId] = useState('demo')
  const [brandUrl, setBrandUrl] = useState('')
  const [brandName, setBrandName] = useState('')
  const [brandIndustry, setBrandIndustry] = useState('')
  const [brandColors, setBrandColors] = useState(['#18181b', '#f4f4f5', '#ffffff'])
  const [brandLogo, setBrandLogo] = useState<string | null>(null)
  const [isLoadingBrand, setIsLoadingBrand] = useState(false)
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<string[]>([])
  
  // Auto-extract brand from URL via API
  const extractBrandFromUrl = async (url: string) => {
    if (!url) return
    setIsLoadingBrand(true)
    
    try {
      // Call our brand extraction API
      const res = await fetch('/api/extract-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await res.json()
      
      if (data.name) {
        setBrandName(data.name)
        setName(`${data.name} - Super Bowl`)
      }
      
      if (data.colors && data.colors.length > 0) {
        setBrandColors(data.colors)
      }
      
      if (data.logo) {
        setBrandLogo(data.logo)
      }
      
      // Default to Restaurant industry for now
      setBrandIndustry('Restaurant')
      
    } catch (e) {
      console.error('Error extracting brand:', e)
      // Fallback to domain parsing
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
        const domain = urlObj.hostname.replace('www.', '')
        const brandNameFromUrl = domain.split('.')[0]
        const prettyName = brandNameFromUrl.charAt(0).toUpperCase() + brandNameFromUrl.slice(1)
        setBrandName(prettyName)
        setBrandIndustry('Restaurant')
        setName(`${prettyName} - Super Bowl`)
      } catch {
        // Ignore
      }
    }
    
    setIsLoadingBrand(false)
  }
  
  // Existing avatars
  const [existingAvatars, setExistingAvatars] = useState<Avatar[]>([])
  
  useEffect(() => {
    if (isOpen) {
      setExistingAvatars(getAvatars())
      
      // Pre-fill from initial brand
      if (initialBrand) {
        setBrandName(initialBrand.name)
        setBrandIndustry(initialBrand.industry)
        setBrandColors(initialBrand.colors)
        setName(`${initialBrand.name} - Super Bowl`)
      }
    }
  }, [isOpen, initialBrand])
  
  const handleAddAvatar = (templateIndex: number) => {
    const template = AVATAR_TEMPLATES[templateIndex]
    const newAvatar = saveAvatar({
      name: template.name,
      imageUrl: getAvatarPlaceholder(template.name),
      personality: template.personality,
      voiceStyle: template.voiceStyle,
      brandAssociations: [brandName],
      brandPlacements: template.brandPlacements
    })
    
    setExistingAvatars(prev => [...prev, newAvatar])
    setSelectedAvatarIds(prev => [...prev, newAvatar.id])
  }
  
  const toggleAvatarSelection = (avatarId: string) => {
    setSelectedAvatarIds(prev => 
      prev.includes(avatarId)
        ? prev.filter(id => id !== avatarId)
        : [...prev, avatarId]
    )
  }
  
  const handleCreate = () => {
    const campaign = saveCampaign({
      name: name || `${brandName} Campaign`,
      gameId,
      gameName: DEMO_GAMES.find(g => g.id === gameId)?.name,
      brandInfo: {
        name: brandName,
        colors: brandColors,
        industry: brandIndustry
      },
      avatarIds: selectedAvatarIds
    })
    
    onCreated(campaign)
    onClose()
    
    // Reset form
    setStep(1)
    setName('')
    setGameId('demo')
    setBrandName('')
    setBrandIndustry('')
    setSelectedAvatarIds([])
  }
  
  if (!isOpen) return null
  
  const selectedGame = DEMO_GAMES.find(g => g.id === gameId)
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold">
              {step === 1 ? 'Create Campaign' : 'Add Avatars'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {step === 1 ? 'Set up your campaign details' : 'Choose AI characters for this campaign'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {step === 1 ? (
            <>
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Super Bowl Campaign"
                  className="bg-white"
                />
              </div>
              
              {/* Game Selection */}
              <div className="space-y-2">
                <Label>Select Game</Label>
                <div className="space-y-2">
                  {DEMO_GAMES.map(game => (
                    <button
                      key={game.id}
                      onClick={() => setGameId(game.id)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        gameId === game.id
                          ? 'border-foreground bg-muted/50'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <p className="text-sm font-medium">{game.name}</p>
                      <p className="text-xs text-muted-foreground">{game.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Brand Info */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Brand Info</Label>
                
                {/* URL Auto-Extract */}
                <div className="space-y-2">
                  <Label htmlFor="brand-url">Website URL (auto-extracts brand)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="brand-url"
                        value={brandUrl}
                        onChange={e => setBrandUrl(e.target.value)}
                        onBlur={() => extractBrandFromUrl(brandUrl)}
                        placeholder="joespizza.com"
                        className="bg-white pl-9"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => extractBrandFromUrl(brandUrl)}
                      disabled={isLoadingBrand || !brandUrl}
                    >
                      {isLoadingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Extract'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input
                      id="brand-name"
                      value={brandName}
                      onChange={e => setBrandName(e.target.value)}
                      placeholder="Joe's Pizza"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand-industry">Industry</Label>
                    <Input
                      id="brand-industry"
                      value={brandIndustry}
                      onChange={e => setBrandIndustry(e.target.value)}
                      placeholder="Restaurant"
                      className="bg-white"
                    />
                  </div>
                </div>
                
                {/* Color picker */}
                <div className="space-y-2">
                  <Label>Brand Colors</Label>
                  <div className="flex gap-2">
                    {brandColors.map((color, i) => (
                      <div key={i} className="relative">
                        <input
                          type="color"
                          value={color}
                          onChange={e => {
                            const newColors = [...brandColors]
                            newColors[i] = e.target.value
                            setBrandColors(newColors)
                          }}
                          className="w-10 h-10 rounded border border-border cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo (optional)</Label>
                  <div className="flex items-center gap-3">
                    {brandLogo ? (
                      <div className="w-16 h-16 rounded border border-border overflow-hidden bg-muted">
                        <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (ev) => {
                              setBrandLogo(ev.target?.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label 
                        htmlFor="logo-upload"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md cursor-pointer hover:bg-muted transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {brandLogo ? 'Change Logo' : 'Upload Logo'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Existing Avatars */}
              {existingAvatars.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Your Avatars
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {existingAvatars.map(avatar => (
                      <button
                        key={avatar.id}
                        onClick={() => toggleAvatarSelection(avatar.id)}
                        className={`p-2 rounded-md border text-left transition-colors ${
                          selectedAvatarIds.includes(avatar.id)
                            ? 'border-foreground bg-muted/50'
                            : 'border-border hover:border-foreground/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full bg-cover bg-center border border-border"
                            style={{ backgroundImage: `url(${avatar.imageUrl || getAvatarPlaceholder(avatar.name)})` }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{avatar.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {avatar.personality.slice(0, 25)}...
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {existingAvatars.length > 0 && <Separator />}
              
              {/* Avatar Templates */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Add from Templates
                </Label>
                <div className="space-y-2">
                  {AVATAR_TEMPLATES.map((template, i) => (
                    <Card 
                      key={i}
                      className="hover:border-foreground/30 transition-colors cursor-pointer"
                      onClick={() => handleAddAvatar(i)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full bg-cover bg-center border border-border shrink-0"
                          style={{ backgroundImage: `url(${getAvatarPlaceholder(template.name)})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {template.personality}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Selected Count */}
              {selectedAvatarIds.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedAvatarIds.length} avatar{selectedAvatarIds.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep(2)}
                disabled={!brandName}
              >
                Next: Add Avatars
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleCreate}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Create Campaign
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

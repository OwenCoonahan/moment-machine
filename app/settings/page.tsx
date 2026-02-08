'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Save, Loader2, Check, Globe, Palette,
  Image as ImageIcon, Twitter, Instagram, Sparkles, Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import {
  Settings,
  BrandSettings,
  SocialIntegrations,
  getSettings,
  saveSettings,
  extractBrandFromUrl,
  isIntegrationConnected
} from '@/lib/settings'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [extracting, setExtracting] = useState(false)

  // Load settings
  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const handleSave = () => {
    if (!settings) return
    setIsSaving(true)
    saveSettings(settings)
    setTimeout(() => {
      setIsSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 300)
  }

  const handleExtractBrand = () => {
    if (!settings?.brand.websiteUrl) return
    setExtracting(true)
    
    const extracted = extractBrandFromUrl(settings.brand.websiteUrl)
    if (extracted) {
      setSettings({
        ...settings,
        brand: {
          ...settings.brand,
          brandName: extracted.brandName || settings.brand.brandName,
          industry: extracted.industry || settings.brand.industry,
          colors: extracted.colors || settings.brand.colors
        }
      })
    }
    
    setTimeout(() => setExtracting(false), 500)
  }

  const updateBrand = (key: keyof BrandSettings, value: string | [string, string, string]) => {
    if (!settings) return
    setSettings({
      ...settings,
      brand: { ...settings.brand, [key]: value }
    })
  }

  const updateColor = (index: number, color: string) => {
    if (!settings) return
    const newColors: [string, string, string] = [...settings.brand.colors] as [string, string, string]
    newColors[index] = color
    updateBrand('colors', newColors)
  }

  const updateTwitter = (key: keyof SocialIntegrations['twitter'], value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        twitter: { ...settings.integrations.twitter, [key]: value }
      }
    })
  }

  const updateInstagram = (value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        instagram: { accessToken: value }
      }
    })
  }

  const updateTiktok = (value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        tiktok: { apiKey: value }
      }
    })
  }

  const updateAyrshare = (value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        ayrshare: { apiKey: value }
      }
    })
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="font-medium text-sm">Settings</span>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Brand Settings */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Brand Settings
            </h2>
            <p className="text-sm text-muted-foreground">Configure your brand identity for content generation</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Website URL with auto-extract */}
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="websiteUrl"
                    placeholder="https://yourbrand.com"
                    value={settings.brand.websiteUrl}
                    onChange={(e) => updateBrand('websiteUrl', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleExtractBrand}
                    disabled={!settings.brand.websiteUrl || extracting}
                  >
                    {extracting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span className="ml-2">Auto-Extract</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Enter your website URL and click Auto-Extract to fill brand details</p>
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  placeholder="Your Brand"
                  value={settings.brand.brandName}
                  onChange={(e) => updateBrand('brandName', e.target.value)}
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Restaurant, Technology, Retail"
                  value={settings.brand.industry}
                  onChange={(e) => updateBrand('industry', e.target.value)}
                />
              </div>

              {/* Brand Colors */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Brand Colors
                </Label>
                <div className="flex gap-4">
                  {settings.brand.colors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm cursor-pointer relative overflow-hidden"
                        style={{ backgroundColor: color }}
                      >
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => updateColor(i, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Accent'}
                      </span>
                      <Input
                        value={color}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="w-24 h-7 text-xs text-center font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Logo URL
                </Label>
                <Input
                  placeholder="https://yourbrand.com/logo.png"
                  value={settings.brand.logoUrl || ''}
                  onChange={(e) => updateBrand('logoUrl', e.target.value)}
                />
                {settings.brand.logoUrl && (
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50 inline-block">
                    <img
                      src={settings.brand.logoUrl}
                      alt="Brand logo preview"
                      className="max-h-16 max-w-48 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Social Integrations */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Twitter className="w-5 h-5" />
              Social Integrations
            </h2>
            <p className="text-sm text-muted-foreground">Connect your social media accounts for direct posting</p>
          </div>

          <div className="space-y-4">
            {/* Twitter/X */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter / X
                  </CardTitle>
                  {isIntegrationConnected('twitter') && (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription>Post directly to Twitter/X</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitterApiKey">API Key</Label>
                    <Input
                      id="twitterApiKey"
                      type="password"
                      placeholder="••••••••"
                      value={settings.integrations.twitter.apiKey}
                      onChange={(e) => updateTwitter('apiKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterApiSecret">API Secret</Label>
                    <Input
                      id="twitterApiSecret"
                      type="password"
                      placeholder="••••••••"
                      value={settings.integrations.twitter.apiSecret}
                      onChange={(e) => updateTwitter('apiSecret', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterAccessToken">Access Token</Label>
                    <Input
                      id="twitterAccessToken"
                      type="password"
                      placeholder="••••••••"
                      value={settings.integrations.twitter.accessToken}
                      onChange={(e) => updateTwitter('accessToken', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterAccessSecret">Access Secret</Label>
                    <Input
                      id="twitterAccessSecret"
                      type="password"
                      placeholder="••••••••"
                      value={settings.integrations.twitter.accessSecret}
                      onChange={(e) => updateTwitter('accessSecret', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </CardTitle>
                  {isIntegrationConnected('instagram') && (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription>Post directly to Instagram</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="instagramToken">Access Token</Label>
                  <Input
                    id="instagramToken"
                    type="password"
                    placeholder="••••••••"
                    value={settings.integrations.instagram.accessToken}
                    onChange={(e) => updateInstagram(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* TikTok */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    TikTok
                  </CardTitle>
                  {isIntegrationConnected('tiktok') && (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription>Post directly to TikTok</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="tiktokApiKey">API Key</Label>
                  <Input
                    id="tiktokApiKey"
                    type="password"
                    placeholder="••••••••"
                    value={settings.integrations.tiktok.apiKey}
                    onChange={(e) => updateTiktok(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ayrshare */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Ayrshare
                    <Badge variant="outline" className="ml-2 text-xs">Recommended</Badge>
                  </CardTitle>
                  {isIntegrationConnected('ayrshare') && (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription>Multi-platform posting with a single API key</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="ayrshareApiKey">API Key</Label>
                  <Input
                    id="ayrshareApiKey"
                    type="password"
                    placeholder="••••••••"
                    value={settings.integrations.ayrshare.apiKey}
                    onChange={(e) => updateAyrshare(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Connect all your social accounts through{' '}
                    <a href="https://ayrshare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      ayrshare.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Save button at bottom */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Saved!' : 'Save All Settings'}
          </Button>
        </div>
      </main>
    </div>
  )
}

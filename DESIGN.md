# Moment Machine — Design System

## Philosophy
Clean, minimal, data-forward. Linear/Vercel aesthetic. No AI slop.

## Colors

### Base Palette
```css
--background: #ffffff
--foreground: #0a0a0a
--muted: #f5f5f5
--muted-foreground: #737373
--border: #e5e5e5
--ring: #0a0a0a
```

### Accent Colors
```css
--primary: #0a0a0a        /* Main actions */
--primary-foreground: #ffffff
--secondary: #f5f5f5      /* Secondary buttons */
--destructive: #ef4444    /* Errors, delete */
--success: #22c55e        /* Success states */
--warning: #f59e0b        /* Warnings */
```

### Brand Color Slots (User-defined)
```css
--brand-primary: [user input]
--brand-secondary: [user input]
--brand-accent: [user input]
```

## Typography

### Fonts
- **Primary:** Geist Sans (system fallback: Inter, -apple-system)
- **Mono:** JetBrains Mono (code, stats, IDs)

### Scale
```css
--text-xs: 0.75rem      /* 12px - labels, badges */
--text-sm: 0.875rem     /* 14px - body small */
--text-base: 1rem       /* 16px - body */
--text-lg: 1.125rem     /* 18px - emphasis */
--text-xl: 1.25rem      /* 20px - section headers */
--text-2xl: 1.5rem      /* 24px - page headers */
--text-3xl: 1.875rem    /* 30px - hero */
```

### Weights
- **Regular (400):** Body text
- **Medium (500):** Labels, buttons
- **Semibold (600):** Headers, emphasis
- **Bold (700):** Hero text only

## Spacing

### Base Unit: 4px
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

## Layout

### Sidebar
- Width: `w-80` (320px)
- Background: `bg-muted/30` or white
- Border: `border-r border-border`
- Padding: `p-6`

### Main Content
- Max width: none (fluid)
- Padding: `p-6`
- Gap between sections: `space-y-6`

### Content Grid
- Columns: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Gap: `gap-4`
- Card aspect: `aspect-square` or `aspect-video`

## Components

### Cards
```jsx
<Card className="border border-border bg-white">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons
```jsx
// Primary
<Button>Generate</Button>

// Secondary
<Button variant="outline">Cancel</Button>

// Ghost
<Button variant="ghost" size="icon">
  <Icon />
</Button>

// Destructive
<Button variant="destructive">Delete</Button>
```

### Stats Grid
```jsx
<div className="grid grid-cols-3 gap-4">
  <Card>
    <CardContent className="pt-4">
      <div className="text-2xl font-bold font-mono">42</div>
      <div className="text-xs text-muted-foreground">Generated</div>
    </CardContent>
  </Card>
</div>
```

### Tabs
```jsx
<Tabs defaultValue="studio">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="studio">Studio</TabsTrigger>
    <TabsTrigger value="nuke">Nuke</TabsTrigger>
  </TabsList>
  <TabsContent value="studio">...</TabsContent>
  <TabsContent value="nuke">...</TabsContent>
</Tabs>
```

### Input Fields
```jsx
<div className="space-y-2">
  <Label htmlFor="url">Website URL</Label>
  <Input 
    id="url" 
    placeholder="https://yoursite.com"
    className="bg-white"
  />
</div>
```

### Toggle/Switch
```jsx
<div className="flex items-center justify-between">
  <Label htmlFor="auto">Auto-generate</Label>
  <Switch id="auto" />
</div>
```

### Badges
```jsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Draft</Badge>
```

## Content Cards

### Generated Image Card
```jsx
<div className="group relative aspect-square rounded-lg overflow-hidden border border-border">
  <img 
    src={content.url} 
    alt={content.caption}
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="absolute bottom-0 left-0 right-0 p-3">
      <p className="text-white text-sm line-clamp-2">{content.caption}</p>
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="secondary">Download</Button>
        <Button size="sm" variant="secondary">Share</Button>
      </div>
    </div>
  </div>
</div>
```

## Campaign Section (New)

### Campaign Card
```jsx
<Card className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
  <CardContent className="flex flex-col items-center justify-center py-8">
    <Plus className="h-8 w-8 text-muted-foreground" />
    <span className="text-sm text-muted-foreground mt-2">New Campaign</span>
  </CardContent>
</Card>
```

### Avatar/Character Card
```jsx
<div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
  <img src={avatar.imageUrl} className="w-full h-full object-cover" />
  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
    <p className="text-white text-sm font-medium">{avatar.name}</p>
    <p className="text-white/70 text-xs">{avatar.personality}</p>
  </div>
</div>
```

## Prediction Market Tab (New)

### Bot Card
```jsx
<Card>
  <CardHeader className="pb-2 flex flex-row items-center gap-3">
    <div className="h-10 w-10 rounded-full bg-[brand-color]" />
    <div>
      <CardTitle className="text-sm">Chipotle Bot</CardTitle>
      <p className="text-xs text-muted-foreground">+$2,340 today</p>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-xs space-y-1">
      <div className="flex justify-between">
        <span>Last trade:</span>
        <span className="font-mono">Chiefs TD @ 1.45</span>
      </div>
      <div className="flex justify-between">
        <span>Win rate:</span>
        <span className="font-mono text-success">67%</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### Trade Feed
```jsx
<div className="space-y-2">
  {trades.map(trade => (
    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
      <div className="h-6 w-6 rounded-full bg-[brand-color]" />
      <span className="text-sm flex-1">
        <strong>{trade.bot}</strong> {trade.action} {trade.market}
      </span>
      <span className="text-xs text-muted-foreground font-mono">
        {trade.time}
      </span>
    </div>
  ))}
</div>
```

## Animations

### Transitions
```css
transition-all duration-200 ease-in-out
```

### Hover States
- Cards: `hover:border-primary` or `hover:shadow-sm`
- Buttons: Built into shadcn/ui
- Images: `group-hover:scale-105`

### Loading States
```jsx
<div className="animate-pulse bg-muted rounded-lg aspect-square" />
```

## Icons
Using Lucide React (included with shadcn/ui):
- `Plus` - Add new
- `Settings` - Configuration
- `Download` - Export
- `Share2` - Share
- `Trash2` - Delete
- `Play` - Start/Generate
- `Pause` - Stop
- `RefreshCw` - Refresh/Regenerate
- `TrendingUp` - Stats/Markets
- `Bot` - AI/Automated

## Responsive Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## File Structure
```
/app
  /page.tsx           # Main dashboard
  /api
    /generate         # Image generation
    /espn             # Game events
    /espn/demo        # Demo mode
/components
  /ui                 # shadcn/ui components
  /campaign-card.tsx  # Campaign management
  /avatar-card.tsx    # AI character cards
  /bot-card.tsx       # Prediction market bots
  /trade-feed.tsx     # Live trade activity
/lib
  /prompts.ts         # Generation prompts
  /storage.ts         # localStorage utils
  /events.ts          # ESPN event types
```

---

Keep it clean. Keep it fast. No decoration without purpose.

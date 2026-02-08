# Moment Machine — Build Plan

*Created: Feb 8, 2025 | Hackathon deadline: ~6pm EST*

---

## 🎯 Vision

A content generation platform for SMBs that:
1. **Auto-generates branded content** during live events (Super Bowl)
2. **Auto-posts** to social platforms without manual intervention
3. Creates both **high-quality curated content** and **mass "nuke" content**
4. Features **AI avatars** that naturally incorporate brand elements (e.g., Chipotle bag in background)

---

## 🚨 Current Problems to Fix

| Problem | Status |
|---------|--------|
| Content Nuke tab doesn't actually work | ❌ Broken |
| No real image/video generation | ❌ Simulated only |
| No content storage | ❌ Lost on refresh |
| UI looks "AI-generated" | ❌ Needs major upgrade |
| Manual arm/disarm is clunky | ❌ Should be automatic |
| No brand asset uploads (logos, images) | ❌ Missing |
| No AI avatar generation | ❌ Missing |

---

## 🏗️ Architecture Plan

### Data Flow
```
Sports API (live game data)
       ↓
Event Detection (TD, fumble, etc.)
       ↓
Content Generation Pipeline
  ├── High-Quality Path → Fal.ai (Flux Pro) + HeyGen (avatars)
  └── Nuke Path → Fal.ai (Flux Schnell) parallel batch
       ↓
Content Storage (localStorage + optional DB)
       ↓
Auto-Post Queue → Social Platforms
```

### Tech Stack
- **Frontend:** Next.js 14 + Tailwind + shadcn/ui (clean components)
- **Image Gen:** Fal.ai (Flux Schnell for speed, Flux Pro for quality)
- **Video/Avatar:** HeyGen API or Fal.ai Kling
- **Live Data:** Sports API (pending Owen sending endpoint)
- **Storage:** localStorage for demo, Vercel KV for persistence
- **Posting:** Buffer/Hootsuite webhooks or direct APIs

---

## 📋 Task Breakdown

### Phase 1: UI Overhaul (1 hour)
- [ ] Install shadcn/ui components
- [ ] Redesign dashboard with clean, minimal aesthetic
- [ ] Remove "AI-generated" look — reference Linear, Vercel, Stripe
- [ ] Better brand setup section with logo/image upload
- [ ] Clean stats display
- [ ] Proper content grid with real previews

### Phase 2: Real Content Generation (1.5 hours)
- [ ] Wire up Fal.ai Flux for real image generation
- [ ] Add prompt templates based on event type + brand
- [ ] High-Quality mode: Generate 3-5 polished pieces per event
- [ ] Nuke mode: Batch generate 50-100 pieces fast
- [ ] Store generated content in localStorage
- [ ] Add content preview with actual images

### Phase 3: AI Avatar Integration (1 hour)
- [ ] Integrate HeyGen or D-ID for avatar videos
- [ ] Create templates: "Girl reacting to game with brand in background"
- [ ] Brand placement options (product on table, logo on screen, etc.)
- [ ] Generate short clips (5-15 seconds)

### Phase 4: Auto-Generation System (45 min)
- [ ] Replace arm/disarm with auto-generation toggle
- [ ] Poll Sports API every 30 seconds when active
- [ ] Detect significant events (TD, fumble, halftime, etc.)
- [ ] Auto-trigger content generation on events
- [ ] Queue content for auto-posting

### Phase 5: Auto-Posting (30 min)
- [ ] Connect to Buffer/Hootsuite webhook
- [ ] Or: Direct Twitter/Instagram API posting
- [ ] Schedule posts with delay (avoid spam)
- [ ] Show posting queue and status

### Phase 6: Polish & Demo (30 min)
- [ ] Test full flow end-to-end
- [ ] Prepare demo script
- [ ] Fix any bugs
- [ ] Take final screenshots

---

## 🎨 UI Design Direction

### Inspiration
- **Linear** — Clean, minimal, functional
- **Vercel Dashboard** — Dark/light mode, good typography
- **Stripe** — Excellent information density
- **Fal.ai Sandbox** — Model selection, clean forms

### Key UI Principles
1. **White space** — Don't cram everything
2. **Typography hierarchy** — Clear labels, readable content
3. **Subtle borders** — Not heavy lines
4. **Consistent spacing** — 4px, 8px, 16px, 24px grid
5. **No gradients or glow** — Flat, professional
6. **Real content** — Show actual generated images, not icons

### Component Library
Using **shadcn/ui** for:
- Buttons
- Inputs
- Cards
- Tabs
- Dialogs
- Dropdowns

---

## 📊 Content Generation Strategy

### High-Quality Mode
**Goal:** 3-5 polished pieces per event that look professional

**Types:**
1. **Branded image** — Event graphic with brand colors/logo
2. **Reaction meme** — Relatable format with brand twist
3. **Video clip** — AI avatar reacting with brand visible
4. **Story post** — Vertical format for Instagram/TikTok
5. **Tweet text** — Witty copy with emoji and CTA

**Prompt Template:**
```
Create a [format] for [brand name], a [industry] business.
Event: [event type] - [description]
Style: [brand voice]
Include: [brand elements - logo, colors, products]
Mood: [excited, celebratory, funny, etc.]
```

### Nuke Mode
**Goal:** 100-500 pieces in under 60 seconds

**Strategy:**
1. Pre-generate prompt variations
2. Parallel API calls (5-10 concurrent)
3. Mix of formats: 60% image, 30% video, 10% text
4. Randomize brand placement
5. Batch upload to posting queue

**Avatar Videos for Nuke:**
```
Scene: Attractive woman at home watching game
Background: [Brand product] visible on table/counter
Script: "Oh my god, did you see that [event]?! [Brand] needs to see this!"
Duration: 5-8 seconds
Variations: 10-20 different scripts per event
```

---

## 🔗 API Integration Details

### Fal.ai (Image Generation)
```javascript
// Endpoints to use
'fal-ai/flux/schnell'     // Fast, good for nuke
'fal-ai/flux-pro/v1.1'    // High quality
'fal-ai/ideogram/v2'      // Good text rendering

// Params
{
  prompt: string,
  image_size: 'square_hd' | 'landscape_16_9' | 'portrait_9_16',
  num_images: 1-4
}
```

### HeyGen (Avatar Videos)
```javascript
// Endpoint
POST https://api.heygen.com/v2/video/generate

// Params
{
  video_inputs: [{
    character: { type: 'avatar', avatar_id: 'xxx' },
    voice: { type: 'text', input_text: 'script here' },
    background: { type: 'image', url: 'brand-background.jpg' }
  }],
  dimension: { width: 1080, height: 1920 } // Vertical for stories
}
```

### Sports API (Live Data)
*Waiting for Owen to send endpoint*

Expected data:
- Game status (quarter, clock, score)
- Play-by-play events
- Event type classification
- Team/player info

---

## 📁 File Structure

```
moment-machine/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard
│   ├── api/
│   │   ├── generate/         # Fal.ai integration
│   │   ├── avatar/           # HeyGen integration
│   │   ├── sports/           # Sports API polling
│   │   └── post/             # Social posting
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn components
│   ├── brand-setup.tsx
│   ├── content-grid.tsx
│   ├── event-feed.tsx
│   └── posting-queue.tsx
├── lib/
│   ├── fal.ts               # Fal.ai client
│   ├── heygen.ts            # HeyGen client
│   ├── storage.ts           # Content storage
│   └── prompts.ts           # Prompt templates
└── PLAN.md                  # This file
```

---

## ⏱️ Timeline

| Time | Phase | Deliverable |
|------|-------|-------------|
| Now - 2:30pm | Phase 1 | Clean UI with shadcn |
| 2:30 - 4:00pm | Phase 2 | Real content generation working |
| 4:00 - 5:00pm | Phase 3 | AI avatars generating |
| 5:00 - 5:45pm | Phase 4-5 | Auto-generation + posting |
| 5:45 - 6:00pm | Phase 6 | Polish + demo prep |

---

## 🎬 Demo Script (for judges)

1. **Show landing page** (10 sec)
   - "Moment Machine generates branded content at the speed of live events"

2. **Add a brand** (20 sec)
   - Enter Chipotle URL
   - Show brand extraction (logo, colors, industry)
   - Upload additional brand assets

3. **Show live game connection** (15 sec)
   - "We're connected to live Super Bowl data"
   - Show score, quarter, recent events

4. **Trigger content generation** (30 sec)
   - Event detected: "TOUCHDOWN"
   - High-quality mode generates 5 pieces
   - Show actual images with brand integration

5. **Show avatar video** (20 sec)
   - AI avatar reacting to the play
   - Chipotle product visible in background
   - "This would auto-post to TikTok"

6. **Demo Nuke mode** (30 sec)
   - Switch to Nuke tab
   - Generate 100+ pieces in seconds
   - Show grid filling up with content

7. **Show auto-posting** (15 sec)
   - Content queued for multiple platforms
   - "One click to deploy 500 posts"

8. **Business pitch** (30 sec)
   - "Madison Ave spends $7M for one Super Bowl ad"
   - "SMBs get 1000 branded content pieces for $49/month"
   - "Real-time, automated, always on-brand"

---

## ❓ Open Questions for Owen

1. **Sports API endpoint** — Need the URL/docs
2. **HeyGen API key** — Do we have access?
3. **Avatar style preference** — Specific look for the "attractive girl"?
4. **Brand placement examples** — Any reference images?
5. **Priority:** Avatar videos or mass image generation first?

---

## 🚀 Let's Build

Starting with **Phase 1: UI Overhaul** using shadcn/ui.

Will update this plan as we progress.

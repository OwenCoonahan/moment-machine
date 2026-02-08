# ⚡ Moment Machine

> AI-powered content generation at the speed of live events.

Generate 1,000+ branded content pieces in 30 seconds. Turn live moments into marketing gold.

![Moment Machine](https://img.shields.io/badge/Super%20Bowl-LX%20Hackathon-22c55e)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Status](https://img.shields.io/badge/Status-Live-22c55e)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Features

- **Brand Extraction** - Paste any URL, we extract logo, colors, and voice
- **Event Detection** - AI watches live events and detects key moments
- **Content Nuke** - Generate 500-1000 content pieces in <45 seconds
- **Multi-Platform** - Ready for Instagram, TikTok, Twitter, Facebook
- **One-Click Deploy** - Send all content to your platforms instantly

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 |
| Styling | Tailwind CSS |
| Event Detection | Gemini 2.0 Flash |
| Image Generation | Flux 1.1 Pro (Fal.ai) |
| Fast Reasoning | DeepSeek R1 (Groq) |
| Video Avatars | HeyGen |
| Deployment | Vercel |

## 📁 Project Structure

```
moment-machine/
├── app/
│   ├── page.tsx          # Landing page
│   ├── dashboard/
│   │   └── page.tsx      # Main dashboard
│   ├── api/
│   │   ├── generate/     # Content generation API
│   │   └── detect/       # Event detection API
│   ├── layout.tsx
│   └── globals.css
├── components/           # Reusable components
├── public/              # Static assets
└── package.json
```

## 🔑 Required API Keys

1. **Fal.ai** (Flux 1.1 Pro) - Image generation
   - Sign up: https://fal.ai
   
2. **Groq** - Fast LLM inference
   - Sign up: https://groq.com
   
3. **Google AI** - Gemini for video analysis
   - Sign up: https://makersuite.google.com

4. **HeyGen** (Optional) - Avatar videos
   - Sign up: https://heygen.com

## 🎬 Demo Flow

1. **Enter business URL** → Brand extraction runs
2. **Click "Arm System"** → Ready for live events
3. **Click "Trigger Demo Event"** → Simulates touchdown
4. **Watch content explode** → 500-800 pieces generated
5. **Click "Deploy All"** → Sends to platforms

## 📊 Dashboard Features

- Real-time content generation counter
- Latency timer (target: <45 seconds)
- Content type breakdown (images/videos/text)
- Platform deployment queue
- Session analytics

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual

```bash
npm run build
npm start
```

## 🎯 Judging Criteria

| Criteria | How We Address It |
|----------|-------------------|
| Real-World Data | ESPN API + video frame analysis |
| Live Deployment | Vercel deployment, working URL |
| Latency <45s | Target: 30-40 seconds |
| Business Impact | Clear ROI: $7M → $49/month |
| Smart AI Use | Gemini detection + Flux generation |
| Usability | One-click brand setup and deploy |
| Demo Quality | Live data → AI → Business output |

## 💰 Business Model

- **Free**: 3 moments/game
- **Pro ($49/mo)**: Unlimited moments, all platforms
- **Agency ($199/mo)**: Multi-client dashboard

## 👥 Team

Built at Pulse NYC Super Bowl LX Hackathon 2025

## 📄 License

MIT

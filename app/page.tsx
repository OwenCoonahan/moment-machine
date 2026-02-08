'use client'

import { useState } from 'react'
import { ArrowRight, Zap, Clock, TrendingUp, Users, Play, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [url, setUrl] = useState('')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏈</span>
            <span className="font-bold text-white text-lg">Blitz</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#how" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How it works
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm bg-white text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-100 transition-colors"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-zinc-950 to-zinc-950" />
        
        {/* Stadium lights effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto">
          {/* Live badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-400">Super Bowl LX • February 9, 2026</span>
            </div>
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              Blitz your feed
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                during the big game
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              AI watches the Super Bowl and generates branded content for your restaurant in real-time. Go viral without the $7M ad budget.
            </p>

            {/* URL Input */}
            <div className="max-w-lg mx-auto mb-8">
              <div className="flex gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your restaurant URL..."
                  className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <Link 
                  href={`/dashboard?url=${encodeURIComponent(url || '')}`}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Works with any restaurant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Posts in &lt;45 seconds</span>
              </div>
            </div>
          </div>

          {/* Hero image mockup */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/5">
              <div className="bg-zinc-900 p-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center text-xs text-zinc-500">blitz.app/dashboard</div>
                </div>
              </div>
              <div className="bg-zinc-900 aspect-[16/9] relative overflow-hidden">
                {/* Dashboard preview mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 p-6">
                  <div className="grid grid-cols-4 gap-4 h-full">
                    {/* Sidebar mock */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                      <div className="h-8 bg-zinc-700/50 rounded w-3/4" />
                      <div className="h-6 bg-zinc-700/30 rounded w-full" />
                      <div className="h-6 bg-zinc-700/30 rounded w-2/3" />
                      <div className="h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-lg mt-4" />
                    </div>
                    {/* Content area mock */}
                    <div className="col-span-3 space-y-4">
                      <div className="flex gap-3">
                        <div className="h-10 bg-zinc-700/50 rounded-lg w-24" />
                        <div className="h-10 bg-zinc-700/30 rounded-lg w-24" />
                        <div className="h-10 bg-zinc-700/30 rounded-lg w-24" />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[1,2,3,4,5,6,7,8].map(i => (
                          <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 flex items-center justify-center">
                            <Play className="w-8 h-8 text-zinc-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-sm text-zinc-500">Posts per game</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">&lt;45s</div>
              <div className="text-sm text-zinc-500">Touchdown to post</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">13</div>
              <div className="text-sm text-zinc-500">Platforms supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">$0</div>
              <div className="text-sm text-zinc-500">To get started</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How Blitz works</h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Three steps to dominate game day marketing — no agency required.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-zinc-800/50 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-xs font-medium text-emerald-400 mb-2">STEP 1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect your brand</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Paste your URL — we auto-extract your colors, logo, and brand voice in seconds.
              </p>
            </div>
            
            <div className="relative p-6 rounded-2xl bg-zinc-800/50 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-xs font-medium text-amber-400 mb-2">STEP 2</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI watches the game</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Touchdowns, interceptions, big plays — content generates the moment it happens.
              </p>
            </div>
            
            <div className="relative p-6 rounded-2xl bg-zinc-800/50 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-xs font-medium text-blue-400 mb-2">STEP 3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Go viral</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                One-click deploy to Instagram, TikTok, Twitter, Facebook — everywhere at once.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-zinc-500 mb-8 uppercase tracking-wider">Trusted by local restaurants everywhere</p>
          <div className="flex items-center justify-center gap-12 opacity-40">
            <div className="text-2xl font-bold">🍕 Joe's Pizza</div>
            <div className="text-2xl font-bold">🍗 Wing King</div>
            <div className="text-2xl font-bold">🌮 Taco Loco</div>
            <div className="text-2xl font-bold">🍔 Burger Barn</div>
            <div className="text-2xl font-bold">🏈 Sports Bar NYC</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtMnYtMmgydi00aC0ydi0yaC00djJoLTJ2LTJoLTR2MmgtMnYyaDJ2NGgtMnYyaDJ2NGgtMnYyaDR2LTJoMnYyaDR2LTJoMnYtMmgtMnYtNGgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative px-12 py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                The big chains have agencies.
                <br />
                You have Blitz.
              </h2>
              <p className="text-emerald-100 mb-8 text-lg max-w-lg mx-auto">
                While Domino's posts once, your pizzeria posts 100 times — each one perfectly timed to the game.
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Launch Blitz — It's Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏈</span>
            <span className="font-semibold text-white">Blitz</span>
          </div>
          <span>Built at Pulse NYC Hackathon • 2026</span>
        </div>
      </footer>
    </div>
  )
}

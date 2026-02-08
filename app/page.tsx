'use client'

import { useState } from 'react'
import { Zap, ArrowRight, Play, BarChart3, Globe, Clock } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [url, setUrl] = useState('')

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-600">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Moment Machine</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm">
              Dashboard
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-accent hover:bg-accent-dim text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-full px-4 py-2 mb-8">
            <div className="status-dot"></div>
            <span className="text-sm text-zinc-400">Live during Super Bowl LX</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="text-white">1,000 content pieces.</span>
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">30 seconds.</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            AI watches live events and generates branded content for your business instantly. 
            Madison Avenue spends $7M on one Super Bowl ad. You get 1,000 pieces for $49/month.
          </p>

          {/* URL Input */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your business URL..."
                className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-5 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
              />
              <Link 
                href={`/dashboard?url=${encodeURIComponent(url)}`}
                className="bg-accent hover:bg-accent-dim text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                Launch
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <p className="text-sm text-zinc-500">
            No credit card required. See it work in 30 seconds.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-dark-600 bg-dark-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2 counter">847,293</div>
              <div className="text-sm text-zinc-400">Content pieces generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2 counter">&lt;45s</div>
              <div className="text-sm text-zinc-400">Average latency</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2 counter">1,247</div>
              <div className="text-sm text-zinc-400">Businesses armed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">$7M → $49</div>
              <div className="text-sm text-zinc-400">Your Super Bowl cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Connect your brand</h3>
              <p className="text-zinc-400">
                Paste your URL. We extract your logo, colors, voice, and products automatically.
              </p>
            </div>
            
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Play className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Arm for live events</h3>
              <p className="text-zinc-400">
                AI watches the game. The moment something happens, content generation triggers.
              </p>
            </div>
            
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Deploy everywhere</h3>
              <p className="text-zinc-400">
                Hundreds of content pieces across TikTok, Instagram, Twitter, Facebook — one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-24 px-6 bg-dark-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">See it in action</h2>
          <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
            Watch how a single touchdown generates hundreds of branded content pieces in real-time.
          </p>
          
          {/* Mock Dashboard Preview */}
          <div className="bg-dark-900 border border-dark-600 rounded-2xl overflow-hidden shadow-2xl">
            <div className="border-b border-dark-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm text-zinc-400 font-mono">moment-machine.ai/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="status-dot"></div>
                <span className="text-sm text-accent font-medium">LIVE</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-dark-700 rounded-xl p-4">
                  <div className="text-sm text-zinc-400 mb-1">Event</div>
                  <div className="font-semibold text-accent">TOUCHDOWN</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-4">
                  <div className="text-sm text-zinc-400 mb-1">Generated</div>
                  <div className="font-semibold text-2xl counter">847</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-4">
                  <div className="text-sm text-zinc-400 mb-1">Latency</div>
                  <div className="font-semibold text-2xl counter">34s</div>
                </div>
                <div className="bg-dark-700 rounded-xl p-4">
                  <div className="text-sm text-zinc-400 mb-1">Status</div>
                  <div className="font-semibold text-accent">Ready to Deploy</div>
                </div>
              </div>
              
              <div className="content-grid">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="content-item" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                      {i % 3 === 0 ? (
                        <Play className="w-4 h-4 text-accent" />
                      ) : (
                        <BarChart3 className="w-4 h-4 text-accent" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to dominate live moments?</h2>
          <p className="text-xl text-zinc-400 mb-8">
            The Super Bowl is in 6 hours. Your competitors are still planning their one post.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dim text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Launch Moment Machine
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">Moment Machine</span>
          </div>
          <div className="text-sm text-zinc-500">
            Built at Pulse NYC Super Bowl Hackathon 2025
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [url, setUrl] = useState('')

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Moment Machine</span>
          </div>
          <Link 
            href="/dashboard" 
            className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-zinc-500 mb-6 tracking-wide uppercase">
            Super Bowl LX • Live Now
          </p>
          
          <h1 className="text-4xl md:text-5xl font-semibold text-zinc-900 mb-6 leading-tight tracking-tight">
            1,000 content pieces.
            <br />
            <span className="text-zinc-400">30 seconds.</span>
          </h1>
          
          <p className="text-lg text-zinc-500 mb-12 max-w-lg mx-auto leading-relaxed">
            AI watches live events and generates branded content for your business instantly.
          </p>

          {/* URL Input */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourbusiness.com"
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
              <Link 
                href={`/dashboard?url=${encodeURIComponent(url || '')}`}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                Start
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-zinc-900 mb-1 counter">847,293</div>
              <div className="text-sm text-zinc-500">Content generated</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-zinc-900 mb-1 counter">&lt;45s</div>
              <div className="text-sm text-zinc-500">Average latency</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-zinc-900 mb-1">$7M → $49</div>
              <div className="text-sm text-zinc-500">Your cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-zinc-900 text-center mb-16">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-4xl font-light text-zinc-300 mb-4">01</div>
              <h3 className="font-medium text-zinc-900 mb-2">Connect your brand</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Enter your URL. We extract colors, voice, and style automatically.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-light text-zinc-300 mb-4">02</div>
              <h3 className="font-medium text-zinc-900 mb-2">Arm the system</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                AI watches the game. When something happens, content generates instantly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-light text-zinc-300 mb-4">03</div>
              <h3 className="font-medium text-zinc-900 mb-2">Deploy everywhere</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Send hundreds of posts to Instagram, TikTok, Twitter, Facebook — one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The Super Bowl is now.
          </h2>
          <p className="text-zinc-500 mb-8">
            Your competitors are posting one thing. You could post 1,000.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-zinc-400">
          <span>Moment Machine</span>
          <span>Built at Pulse NYC Hackathon</span>
        </div>
      </footer>
    </div>
  )
}

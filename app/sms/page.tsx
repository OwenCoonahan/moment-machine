'use client'

import OutreachPanel from './outreach-panel'

export default function SmsLabPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-zinc-900">SMS Lab</h1>
          <p className="text-sm text-zinc-500">Targeted promo messaging based on live events.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <OutreachPanel />
      </main>
    </div>
  )
}

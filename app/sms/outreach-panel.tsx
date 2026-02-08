'use client'

import { useMemo, useState } from 'react'
import {
  MOCK_CUSTOMERS_CSV,
  REGION_OPTIONS,
  buildMessage,
  filterByRegion,
  parseCustomersCsv,
  summarizeSegment,
  type Customer,
  type SmsDraft,
} from './sms'

const DEFAULT_DRAFT: SmsDraft = {
  eventText: 'Drake Maye just scored!',
  offerText: '10% off jerseys for the next 2 hours.',
  businessName: 'Northstar Athletics',
  businessType: 'sportswear & merch',
}

const DEMO_NUMBER = '+17817157477'

const MMS_ASSET_URLS = [
  'https://demo.twilio.com/owl.png',
  'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
]

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })

export default function OutreachPanel() {
  const [csvText, setCsvText] = useState(MOCK_CUSTOMERS_CSV)
  const [customers, setCustomers] = useState<Customer[]>(
    parseCustomersCsv(MOCK_CUSTOMERS_CSV)
  )
  const [region, setRegion] = useState('Northeast')
  const [draft, setDraft] = useState<SmsDraft>(DEFAULT_DRAFT)
  const [log, setLog] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const segment = useMemo(() => filterByRegion(customers, region), [customers, region])
  const summary = useMemo(() => summarizeSegment(segment), [segment])
  const message = useMemo(() => buildMessage(draft), [draft])

  const handleUpload = async (file: File) => {
    const text = await readFile(file)
    setCsvText(text)
    setCustomers(parseCustomersCsv(text))
  }

  const handleUseMock = () => {
    setCsvText(MOCK_CUSTOMERS_CSV)
    setCustomers(parseCustomersCsv(MOCK_CUSTOMERS_CSV))
  }

  const handleSimulateSend = async () => {
    setIsSending(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 600))
    const targets = segment.filter((c) => c.marketingOptIn)
    const preview = targets.slice(0, 3).map((c) => `${c.name} (${c.phone})`).join(', ')
    const entry = `Simulated send to ${targets.length} opt-in customers (${region}). Preview: ${preview || 'none'}.`
    setLog((prev) => [entry, ...prev])
    setIsSending(false)
  }

  const handleTwilioCall = async () => {
    setIsSending(true)
    setError(null)
    try {
      const response = await fetch('/sms/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, to: [DEMO_NUMBER] }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Twilio call failed')
      }

      const entry = `Twilio call: ${payload.sent} placed, ${payload.failed} failed.`
      setLog((prev) => [entry, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Twilio call failed')
    } finally {
      setIsSending(false)
    }
  }

  const handleSmsSend = async () => {
    setIsSending(true)
    setError(null)
    try {
      const response = await fetch('/sms/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, to: [DEMO_NUMBER] }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Twilio SMS failed')
      }

      const entry = `Twilio SMS: ${payload.sent} sent, ${payload.failed} failed.`
      setLog((prev) => [entry, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Twilio SMS failed')
    } finally {
      setIsSending(false)
    }
  }

  const handleMmsSend = async (mediaUrl: string) => {
    setIsSending(true)
    setError(null)
    try {
      const response = await fetch('/sms/api/mms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, to: [DEMO_NUMBER], mediaUrl }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Twilio MMS failed')
      }

      const entry = `Twilio MMS: ${payload.sent} sent, ${payload.failed} failed.`
      setLog((prev) => [entry, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Twilio MMS failed')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-900">Customer Data</h3>
          <button
            onClick={handleUseMock}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Load mock data
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Upload CSV</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleUpload(file)
              }}
              className="w-full text-sm"
            />
            <p className="text-xs text-zinc-400">Expected headers: id,name,phone,region,team_affinity,last_purchase_category,loyalty_tier,average_order_value,marketing_opt_in</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Raw CSV Preview</label>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value)
                setCustomers(parseCustomersCsv(e.target.value))
              }}
              className="h-28 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"
            />
          </div>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-900">Segment Builder</h3>
          <span className="text-xs text-zinc-400">{summary.total} total · {summary.optedIn} opted-in</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              {REGION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="All">All</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Segment Snapshot</label>
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
              {summary.regions.join(', ') || 'No customers'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Example Targets</label>
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600">
              {segment.slice(0, 4).map((c) => (
                <div key={c.id}>{c.name} · {c.teamAffinity}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-zinc-900">Promo Draft</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Event Text</label>
            <input
              value={draft.eventText}
              onChange={(e) => setDraft({ ...draft, eventText: e.target.value })}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
            <label className="text-xs uppercase tracking-wide text-zinc-500">Offer Text</label>
            <input
              value={draft.offerText}
              onChange={(e) => setDraft({ ...draft, offerText: e.target.value })}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-zinc-500">Business Name</label>
                <input
                  value={draft.businessName}
                  onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-zinc-500">Business Type</label>
                <input
                  value={draft.businessType}
                  onChange={(e) => setDraft({ ...draft, businessType: e.target.value })}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">SMS Preview</label>
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700">
              {message}
            </div>
            <div className="text-xs text-zinc-400">Length: {message.length} characters</div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTwilioCall}
            disabled={isSending}
            className="border border-zinc-200 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium disabled:text-zinc-400"
          >
            {isSending ? 'Calling…' : 'Send Phone Call'}
          </button>
          <button
            onClick={handleSmsSend}
            disabled={isSending}
            className="border border-zinc-200 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium disabled:text-zinc-400"
          >
            {isSending ? 'Sending…' : 'Send SMS'}
          </button>
          <button
            onClick={() => handleMmsSend(MMS_ASSET_URLS[0])}
            disabled={isSending}
            className="border border-zinc-200 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium disabled:text-zinc-400"
          >
            {isSending ? 'Sending…' : 'Send MMS (PNG)'}
          </button>
          <button
            onClick={() => handleMmsSend(MMS_ASSET_URLS[1])}
            disabled={isSending}
            className="border border-zinc-200 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium disabled:text-zinc-400"
          >
            {isSending ? 'Sending…' : 'Send MMS (GIF)'}
          </button>
          <span className="text-xs text-zinc-400">Requires Twilio env vars.</span>
        </div>
        {error && (
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700">
            {error}
          </div>
        )}
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 min-h-[60px]">
          {log.length === 0 ? 'No sends yet.' : log.map((entry, i) => (
            <div key={`${entry}-${i}`}>{entry}</div>
          ))}
        </div>
      </section>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Zap, MessageCircle } from 'lucide-react'

interface Trade {
  id: string
  botId: string
  botName: string
  botColor: string
  botAvatar: string
  action: 'BUY' | 'SELL'
  market: string
  amount: number
  price: number
  odds: number
  outcome?: 'WIN' | 'LOSS' | 'PENDING'
  pnl?: number
  timestamp: string
  eventTrigger?: string
  comment?: string
}

interface TradeFeedProps {
  trades: Trade[]
  maxHeight?: string
  showComments?: boolean
  autoScroll?: boolean
  onTradeClick?: (trade: Trade) => void
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  })
}

function formatAmount(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return `$${amount}`
}

export function TradeFeed({
  trades,
  maxHeight = '400px',
  showComments = true,
  autoScroll = true,
  onTradeClick,
}: TradeFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to top when new trades come in
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [trades.length, autoScroll])
  
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Zap className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No trades yet</p>
        <p className="text-xs">Trades will appear here during live events</p>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="space-y-2 overflow-y-auto pr-1"
      style={{ maxHeight }}
    >
      {trades.map((trade, index) => (
        <div
          key={trade.id}
          onClick={() => onTradeClick?.(trade)}
          className={cn(
            "group flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer",
            "hover:bg-muted/50",
            index === 0 && "animate-in slide-in-from-top-2 duration-300",
            trade.outcome === 'WIN' && "bg-emerald-50/50 border border-emerald-100",
            trade.outcome === 'LOSS' && "bg-red-50/50 border border-red-100",
            trade.outcome === 'PENDING' && "bg-muted/30"
          )}
        >
          {/* Bot Avatar */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-sm"
            style={{ backgroundColor: trade.botColor + '20', color: trade.botColor }}
          >
            {trade.botAvatar}
          </div>
          
          {/* Trade Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="font-medium text-sm"
                style={{ color: trade.botColor }}
              >
                {trade.botName}
              </span>
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                trade.action === 'BUY' 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-red-100 text-red-700"
              )}>
                {trade.action === 'BUY' ? (
                  <span className="flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    BUY
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <ArrowDownRight className="w-3 h-3" />
                    SELL
                  </span>
                )}
              </span>
              <span className="text-sm font-medium">{trade.market}</span>
            </div>
            
            {/* Trade Details */}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="font-mono">{formatAmount(trade.amount)}</span>
              <span>@</span>
              <span className="font-mono">{trade.odds.toFixed(2)}x</span>
              {trade.eventTrigger && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {trade.eventTrigger}
                  </span>
                </>
              )}
            </div>
            
            {/* Comment */}
            {showComments && trade.comment && (
              <div className="mt-2 text-sm text-muted-foreground flex items-start gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50" />
                <span className="italic">"{trade.comment}"</span>
              </div>
            )}
            
            {/* Outcome */}
            {trade.outcome !== 'PENDING' && trade.pnl !== undefined && (
              <div className={cn(
                "mt-2 text-xs font-medium",
                trade.outcome === 'WIN' ? "text-emerald-600" : "text-red-500"
              )}>
                {trade.outcome === 'WIN' ? '✓ Won' : '✗ Lost'} {' '}
                <span className="font-mono">
                  {trade.pnl >= 0 ? '+' : ''}{formatAmount(Math.abs(trade.pnl))}
                </span>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <div className="text-xs text-muted-foreground font-mono shrink-0">
            {formatTime(trade.timestamp)}
          </div>
        </div>
      ))}
    </div>
  )
}

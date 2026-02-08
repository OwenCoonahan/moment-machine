'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BotCardProps {
  id: string
  name: string
  brand: string
  avatar: string
  color: string
  personality: 'aggressive' | 'conservative' | 'contrarian' | 'momentum'
  tagline: string
  totalPnL: number
  todayPnL: number
  winRate: number
  totalTrades: number
  streak: number
  lastTrade?: {
    market: string
    action: 'BUY' | 'SELL'
    odds: number
  }
  compact?: boolean
  onClick?: () => void
}

export function BotCard({
  name,
  brand,
  avatar,
  color,
  personality,
  tagline,
  totalPnL,
  todayPnL,
  winRate,
  totalTrades,
  streak,
  lastTrade,
  compact = false,
  onClick,
}: BotCardProps) {
  const isProfitable = totalPnL > 0
  const isHot = streak >= 3
  const isCold = streak <= -3
  
  const personalityStyles: Record<string, string> = {
    aggressive: 'border-orange-200 bg-orange-50/50',
    conservative: 'border-blue-200 bg-blue-50/50',
    contrarian: 'border-purple-200 bg-purple-50/50',
    momentum: 'border-green-200 bg-green-50/50',
  }
  
  if (compact) {
    return (
      <div 
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
          personalityStyles[personality] || 'border-border'
        )}
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: color + '20', color }}
        >
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className={cn(
            "text-xs font-mono",
            isProfitable ? "text-emerald-600" : "text-red-500"
          )}>
            {isProfitable ? '+' : ''}{totalPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{winRate}%</div>
          <div className="text-xs text-muted-foreground">{totalTrades} trades</div>
        </div>
      </div>
    )
  }
  
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md",
        personalityStyles[personality] || ''
      )}
    >
      <CardHeader className="pb-2 flex flex-row items-center gap-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm"
          style={{ backgroundColor: color + '20', color }}
        >
          {avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{name}</span>
            {isHot && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-0">
                🔥 Hot
              </Badge>
            )}
            {isCold && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-0">
                🥶 Cold
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground italic">{tagline}</p>
        </div>
        <div className={cn(
          "text-right",
          isProfitable ? "text-emerald-600" : "text-red-500"
        )}>
          <div className="text-lg font-bold font-mono flex items-center gap-1 justify-end">
            {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isProfitable ? '+' : ''}{totalPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-muted-foreground">
            Today: {todayPnL >= 0 ? '+' : ''}{todayPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2 text-center border-t pt-3">
          <div>
            <div className={cn(
              "text-sm font-bold font-mono",
              winRate >= 55 ? "text-emerald-600" : winRate <= 45 ? "text-red-500" : "text-muted-foreground"
            )}>
              {winRate}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div>
            <div className="text-sm font-bold font-mono">{totalTrades}</div>
            <div className="text-xs text-muted-foreground">Trades</div>
          </div>
          <div>
            <div className={cn(
              "text-sm font-bold font-mono flex items-center justify-center gap-1",
              streak > 0 ? "text-emerald-600" : streak < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              {streak > 0 ? <TrendingUp className="w-3 h-3" /> : streak < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(streak)}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>
        
        {lastTrade && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last trade:</span>
              <span className="font-mono">
                <span className={lastTrade.action === 'BUY' ? 'text-emerald-600' : 'text-red-500'}>
                  {lastTrade.action}
                </span>
                {' '}{lastTrade.market} @ {lastTrade.odds}x
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

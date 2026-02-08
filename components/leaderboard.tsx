'use client'

import { cn } from '@/lib/utils'
import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react'

interface LeaderboardBot {
  id: string
  name: string
  avatar: string
  color: string
  totalPnL: number
  todayPnL: number
  winRate: number
  totalTrades: number
  streak: number
}

interface LeaderboardProps {
  bots: LeaderboardBot[]
  onBotClick?: (botId: string) => void
  maxItems?: number
  showRank?: boolean
}

function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  if (absAmount >= 10000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return amount.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  })
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-4 h-4 text-amber-500" />
  if (rank === 2) return <Medal className="w-4 h-4 text-slate-400" />
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-700" />
  return <span className="text-xs text-muted-foreground font-mono w-4 text-center">{rank}</span>
}

export function Leaderboard({
  bots,
  onBotClick,
  maxItems = 10,
  showRank = true,
}: LeaderboardProps) {
  const sortedBots = [...bots]
    .sort((a, b) => b.totalPnL - a.totalPnL)
    .slice(0, maxItems)
  
  if (sortedBots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Trophy className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No rankings yet</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-1">
      {sortedBots.map((bot, index) => {
        const rank = index + 1
        const isProfitable = bot.totalPnL > 0
        const isTop3 = rank <= 3
        
        return (
          <div
            key={bot.id}
            onClick={() => onBotClick?.(bot.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
              "hover:bg-muted/50",
              isTop3 && "bg-muted/30",
              rank === 1 && "bg-gradient-to-r from-amber-50 to-transparent border border-amber-100"
            )}
          >
            {/* Rank */}
            {showRank && (
              <div className="w-6 flex items-center justify-center">
                {getRankIcon(rank)}
              </div>
            )}
            
            {/* Avatar */}
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0",
                isTop3 && "ring-2 ring-offset-1",
                rank === 1 && "ring-amber-400",
                rank === 2 && "ring-slate-300",
                rank === 3 && "ring-amber-600"
              )}
              style={{ backgroundColor: bot.color + '20', color: bot.color }}
            >
              {bot.avatar}
            </div>
            
            {/* Name & Stats */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{bot.name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{bot.winRate}% win</span>
                <span>•</span>
                <span>{bot.totalTrades} trades</span>
                {bot.streak !== 0 && (
                  <>
                    <span>•</span>
                    <span className={cn(
                      "flex items-center gap-0.5",
                      bot.streak > 0 ? "text-emerald-600" : "text-red-500"
                    )}>
                      {bot.streak > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(bot.streak)}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* P&L */}
            <div className={cn(
              "text-right",
              isProfitable ? "text-emerald-600" : "text-red-500"
            )}>
              <div className={cn(
                "font-bold font-mono",
                isTop3 ? "text-base" : "text-sm"
              )}>
                {isProfitable ? '+' : ''}{formatCurrency(bot.totalPnL)}
              </div>
              <div className="text-xs text-muted-foreground">
                {bot.todayPnL >= 0 ? '+' : ''}{formatCurrency(bot.todayPnL)} today
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

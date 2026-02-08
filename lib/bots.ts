/**
 * Prediction Market Bot System for Moment Machine
 * Simulates brand bots making trades based on live game events
 */

import { EventType, GameEvent } from './events'

// ==========================================
// Bot Profile Types
// ==========================================

export interface BotProfile {
  id: string
  name: string
  brand: string
  color: string
  avatar: string // Emoji for now
  personality: 'aggressive' | 'conservative' | 'contrarian' | 'momentum'
  tagline: string
  riskTolerance: number // 0-1
}

export interface BotStats {
  totalPnL: number
  todayPnL: number
  winRate: number
  totalTrades: number
  winningTrades: number
  streak: number // positive = win streak, negative = loss streak
}

export interface Trade {
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
  eventTrigger?: EventType
  comment?: string
}

export interface Market {
  id: string
  name: string
  shortName: string
  currentPrice: number // 0-1 (probability)
  volume: number
  category: 'game' | 'player' | 'prop'
}

// ==========================================
// Bot Profiles - Brand Characters
// ==========================================

export const BOTS: BotProfile[] = [
  {
    id: 'pizzashack',
    name: 'PizzaShack Bot',
    brand: 'PizzaShack',
    color: '#E31837',
    avatar: '🍕',
    personality: 'aggressive',
    tagline: 'Hot takes, fresh from the oven',
    riskTolerance: 0.8,
  },
  {
    id: 'pizzashack-conservative',
    name: 'PizzaShack Value',
    brand: 'PizzaShack',
    color: '#006B3F',
    avatar: '🍕',
    personality: 'conservative',
    tagline: 'Calculated slices only',
    riskTolerance: 0.3,
  },
  {
    id: 'pizzashack-contrarian',
    name: 'PizzaShack Contrarian',
    brand: 'PizzaShack',
    color: '#FFB612',
    avatar: '🍕',
    personality: 'contrarian',
    tagline: 'When everyone zigs, we zag',
    riskTolerance: 0.6,
  },
]

// ==========================================
// Markets (Simulated)
// ==========================================

// Real Super Bowl LIX Markets (Chiefs vs Eagles)
export const MARKETS: Market[] = [
  // Game Outcome
  { id: 'chiefs-win', name: 'Chiefs to Win Super Bowl LIX', shortName: 'KC Win', currentPrice: 0.52, volume: 12500000, category: 'game' },
  { id: 'eagles-win', name: 'Eagles to Win Super Bowl LIX', shortName: 'PHI Win', currentPrice: 0.48, volume: 11800000, category: 'game' },
  
  // Totals
  { id: 'over-49', name: 'Over 49.5 Total Points', shortName: 'Over 49.5', currentPrice: 0.51, volume: 4500000, category: 'game' },
  { id: 'under-49', name: 'Under 49.5 Total Points', shortName: 'Under 49.5', currentPrice: 0.49, volume: 4200000, category: 'game' },
  
  // MVP
  { id: 'mahomes-mvp', name: 'Patrick Mahomes Super Bowl MVP', shortName: 'Mahomes MVP', currentPrice: 0.35, volume: 2800000, category: 'player' },
  { id: 'hurts-mvp', name: 'Jalen Hurts Super Bowl MVP', shortName: 'Hurts MVP', currentPrice: 0.28, volume: 2400000, category: 'player' },
  { id: 'kelce-mvp', name: 'Travis Kelce Super Bowl MVP', shortName: 'Kelce MVP', currentPrice: 0.12, volume: 1900000, category: 'player' },
  
  // Player Props
  { id: 'mahomes-3td', name: 'Mahomes 3+ Passing TDs', shortName: 'Mahomes 3+ TD', currentPrice: 0.42, volume: 3200000, category: 'player' },
  { id: 'hurts-rush-td', name: 'Jalen Hurts Rushing TD', shortName: 'Hurts Rush TD', currentPrice: 0.58, volume: 2800000, category: 'player' },
  { id: 'kelce-100', name: 'Travis Kelce 100+ Receiving Yards', shortName: 'Kelce 100+', currentPrice: 0.38, volume: 1900000, category: 'player' },
  { id: 'aj-brown-td', name: 'A.J. Brown Receiving TD', shortName: 'AJ Brown TD', currentPrice: 0.62, volume: 1500000, category: 'player' },
  
  // Game Props
  { id: 'first-score-td', name: 'First Score is Touchdown', shortName: '1st Score TD', currentPrice: 0.68, volume: 950000, category: 'prop' },
  { id: 'safety', name: 'Safety Scored in Game', shortName: 'Safety', currentPrice: 0.08, volume: 850000, category: 'prop' },
  { id: 'ot', name: 'Game Goes to Overtime', shortName: 'Overtime', currentPrice: 0.07, volume: 950000, category: 'prop' },
  { id: 'lead-change-3', name: '3+ Lead Changes', shortName: '3+ Lead Changes', currentPrice: 0.72, volume: 650000, category: 'prop' },
  
  // Halftime Show
  { id: 'kendrick-surprise', name: 'Surprise Guest at Halftime', shortName: 'Halftime Guest', currentPrice: 0.82, volume: 1200000, category: 'prop' },
]

// ==========================================
// Bot State (in-memory for demo)
// ==========================================

const botStats: Map<string, BotStats> = new Map()
const allTrades: Trade[] = []
let tradeCounter = 0

// Initialize bot stats
BOTS.forEach(bot => {
  // Randomize starting positions for demo
  const wins = Math.floor(Math.random() * 15) + 5
  const losses = Math.floor(Math.random() * 10) + 3
  const pnl = (wins * Math.random() * 500) - (losses * Math.random() * 300)
  
  botStats.set(bot.id, {
    totalPnL: Math.round(pnl),
    todayPnL: Math.round(pnl * 0.3),
    winRate: Math.round((wins / (wins + losses)) * 100),
    totalTrades: wins + losses,
    winningTrades: wins,
    streak: Math.floor(Math.random() * 5) - 2,
  })
})

// ==========================================
// Trading Logic
// ==========================================

/**
 * Decide what market to trade based on event type
 */
function selectMarketForEvent(event: GameEvent, bot: BotProfile): Market | null {
  const { type, team } = event
  
  // Map events to relevant markets
  const eventMarketMap: Record<EventType, string[]> = {
    TOUCHDOWN: team === 'KC' ? ['chiefs-win', 'mahomes-3td', 'over-48'] : ['eagles-win', 'hurts-rush-td', 'over-48'],
    FIELD_GOAL: ['under-48', team === 'KC' ? 'chiefs-win' : 'eagles-win'],
    INTERCEPTION: team === 'KC' ? ['chiefs-win'] : ['eagles-win'],
    FUMBLE: team === 'KC' ? ['chiefs-win'] : ['eagles-win'],
    SAFETY: ['safety', team === 'KC' ? 'chiefs-win' : 'eagles-win'],
    SACK: team === 'KC' ? ['chiefs-win'] : ['eagles-win'],
    BIG_PLAY: team === 'KC' ? ['chiefs-win', 'kelce-100'] : ['eagles-win', 'over-48'],
    PUNT: [],
    KICKOFF: [],
    TWO_POINT_CONVERSION: ['over-48'],
    HALFTIME: [],
    GAME_START: ['chiefs-win', 'eagles-win', 'over-48', 'mahomes-3td'],
    GAME_END: [],
    PLAY: [],
  }
  
  const relevantMarkets = eventMarketMap[type] || []
  if (relevantMarkets.length === 0) return null
  
  // Pick a market based on bot personality
  const marketId = relevantMarkets[Math.floor(Math.random() * relevantMarkets.length)]
  return MARKETS.find(m => m.id === marketId) || null
}

/**
 * Determine trade direction based on bot personality and event
 */
function decideTrade(bot: BotProfile, event: GameEvent, market: Market): { action: 'BUY' | 'SELL', amount: number } {
  const { personality, riskTolerance } = bot
  const { type, team } = event
  
  // Base amount on risk tolerance ($100-$1000)
  const baseAmount = Math.round(100 + (riskTolerance * 900))
  const amount = Math.round(baseAmount * (0.8 + Math.random() * 0.4))
  
  // Aggressive bots buy on positive events for their side
  if (personality === 'aggressive') {
    return { action: 'BUY', amount: Math.round(amount * 1.2) }
  }
  
  // Conservative bots buy less, at better prices
  if (personality === 'conservative') {
    return { action: market.currentPrice < 0.4 ? 'BUY' : 'SELL', amount: Math.round(amount * 0.6) }
  }
  
  // Contrarian bots bet against the crowd
  if (personality === 'contrarian') {
    // After a TD, they might sell the winning team (fade the public)
    const isPositiveEvent = ['TOUCHDOWN', 'INTERCEPTION', 'FUMBLE'].includes(type)
    return { action: isPositiveEvent ? 'SELL' : 'BUY', amount }
  }
  
  // Momentum bots follow the action
  return { action: 'BUY', amount }
}

/**
 * Generate a personality-driven comment for a trade
 */
export function generateComment(bot: BotProfile, trade: Trade, event?: GameEvent): string {
  const comments: Record<BotProfile['personality'], string[]> = {
    aggressive: [
      `🚀 ALL IN on ${trade.market}! Let's go!`,
      `Big money move. ${trade.market} is the play.`,
      `Fortune favors the bold. ${trade.action} ${trade.market}!`,
      `No guts, no glory. Loading up on ${trade.market}`,
      `This is the moment. ${trade.action}!`,
    ],
    conservative: [
      `Calculated risk on ${trade.market}. The math checks out.`,
      `Small position, high conviction. ${trade.market} looking solid.`,
      `Playing it smart with ${trade.market}.`,
      `Patience pays. ${trade.action} at these levels.`,
      `Steady hands, steady gains.`,
    ],
    contrarian: [
      `Everyone's zigging, I'm zagging. ${trade.action} ${trade.market}`,
      `The crowd is wrong. Fading the public.`,
      `Unpopular opinion: ${trade.market} is the move.`,
      `When they're greedy, I'm fearful. ${trade.action}.`,
      `Against the grain. That's how we win.`,
    ],
    momentum: [
      `Riding the wave! ${trade.market} has momentum.`,
      `The trend is your friend. ${trade.action}!`,
      `Following the action. ${trade.market} is heating up!`,
      `Can't fight the tape. ${trade.action} ${trade.market}`,
      `Energy is shifting. Time to ${trade.action.toLowerCase()}!`,
    ],
  }
  
  const botComments = comments[bot.personality]
  return botComments[Math.floor(Math.random() * botComments.length)]
}

/**
 * Execute a trade for a bot
 */
export function executeTrade(
  botId: string,
  event: GameEvent,
  forceMarket?: string,
  forceAction?: 'BUY' | 'SELL'
): Trade | null {
  const bot = BOTS.find(b => b.id === botId)
  if (!bot) return null
  
  // Select market
  const market = forceMarket 
    ? MARKETS.find(m => m.id === forceMarket)
    : selectMarketForEvent(event, bot)
  
  if (!market) return null
  
  // Decide trade
  const decision = decideTrade(bot, event, market)
  if (forceAction) decision.action = forceAction
  
  // Calculate odds (simplified)
  const odds = decision.action === 'BUY' 
    ? 1 / market.currentPrice 
    : 1 / (1 - market.currentPrice)
  
  // Create trade
  const trade: Trade = {
    id: `trade-${++tradeCounter}-${Date.now()}`,
    botId: bot.id,
    botName: bot.name,
    botColor: bot.color,
    botAvatar: bot.avatar,
    action: decision.action,
    market: market.shortName,
    amount: decision.amount,
    price: market.currentPrice,
    odds: Math.round(odds * 100) / 100,
    outcome: 'PENDING',
    timestamp: new Date().toISOString(),
    eventTrigger: event.type,
    comment: generateComment(bot, { ...{ market: market.shortName } } as Trade, event),
  }
  
  // Store trade
  allTrades.unshift(trade)
  if (allTrades.length > 500) allTrades.pop()
  
  return trade
}

/**
 * Simulate bots reacting to an event
 */
export function simulateBotReactions(event: GameEvent): Trade[] {
  const trades: Trade[] = []
  
  // Each bot has a chance to react based on event significance
  const reactionChance: Record<EventType, number> = {
    TOUCHDOWN: 0.9,
    INTERCEPTION: 0.85,
    FUMBLE: 0.8,
    SAFETY: 0.95,
    FIELD_GOAL: 0.6,
    BIG_PLAY: 0.7,
    SACK: 0.4,
    TWO_POINT_CONVERSION: 0.75,
    HALFTIME: 0.3,
    GAME_START: 0.5,
    GAME_END: 0,
    PUNT: 0.1,
    KICKOFF: 0.1,
    PLAY: 0.05,
  }
  
  const chance = reactionChance[event.type] || 0.1
  
  BOTS.forEach(bot => {
    // Aggressive bots react more often
    const botChance = chance * (0.7 + bot.riskTolerance * 0.5)
    
    if (Math.random() < botChance) {
      const trade = executeTrade(bot.id, event)
      if (trade) {
        trades.push(trade)
        
        // Update bot stats
        const stats = botStats.get(bot.id)
        if (stats) {
          stats.totalTrades++
          stats.todayPnL += Math.round((Math.random() - 0.45) * 200) // Slight edge
          stats.totalPnL += stats.todayPnL
        }
      }
    }
  })
  
  // Randomize order so it's not always the same bot first
  return trades.sort(() => Math.random() - 0.5)
}

/**
 * Get all bots with their current stats
 */
export function getBotsWithStats(): (BotProfile & BotStats)[] {
  return BOTS.map(bot => ({
    ...bot,
    ...(botStats.get(bot.id) || {
      totalPnL: 0,
      todayPnL: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      streak: 0,
    }),
  }))
}

/**
 * Get leaderboard (sorted by P&L)
 */
export function getLeaderboard(): (BotProfile & BotStats)[] {
  return getBotsWithStats().sort((a, b) => b.totalPnL - a.totalPnL)
}

/**
 * Get recent trades
 */
export function getRecentTrades(limit = 50): Trade[] {
  return allTrades.slice(0, limit)
}

/**
 * Get trades for a specific bot
 */
export function getBotTrades(botId: string, limit = 20): Trade[] {
  return allTrades.filter(t => t.botId === botId).slice(0, limit)
}

/**
 * Resolve trades (simulate outcomes for demo)
 */
export function resolvePendingTrades(): void {
  const pendingTrades = allTrades.filter(t => t.outcome === 'PENDING')
  
  pendingTrades.slice(0, 5).forEach(trade => {
    // Random outcome with slight edge for demo
    const won = Math.random() < 0.52
    trade.outcome = won ? 'WIN' : 'LOSS'
    trade.pnl = won 
      ? Math.round(trade.amount * (trade.odds - 1))
      : -trade.amount
    
    // Update bot stats
    const stats = botStats.get(trade.botId)
    if (stats) {
      stats.totalPnL += trade.pnl
      stats.todayPnL += trade.pnl
      if (won) {
        stats.winningTrades++
        stats.streak = stats.streak >= 0 ? stats.streak + 1 : 1
      } else {
        stats.streak = stats.streak <= 0 ? stats.streak - 1 : -1
      }
      stats.winRate = Math.round((stats.winningTrades / stats.totalTrades) * 100)
    }
  })
}

/**
 * Seed initial trades for demo
 */
export function seedDemoTrades(): Trade[] {
  const demoEvents: Partial<GameEvent>[] = [
    { type: 'GAME_START', description: 'Game has started', team: 'NFL' },
    { type: 'FIELD_GOAL', description: 'Eagles FG', team: 'PHI' },
    { type: 'TOUCHDOWN', description: 'Chiefs TD', team: 'KC' },
    { type: 'BIG_PLAY', description: '35 yard pass', team: 'KC' },
  ]
  
  const trades: Trade[] = []
  demoEvents.forEach((event, i) => {
    setTimeout(() => {
      const newTrades = simulateBotReactions(event as GameEvent)
      trades.push(...newTrades)
    }, i * 100)
  })
  
  return trades
}

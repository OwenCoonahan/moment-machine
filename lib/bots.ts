/**
 * Prediction Market Bot System for Blitz
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
  category: 'game' | 'player' | 'prop' | 'halftime'
  url: string
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
// Real Super Bowl LX Markets (Seahawks vs Patriots)
// ==========================================

export const MARKETS: Market[] = [
  // MVP Markets
  { 
    id: 'darnold-mvp', 
    name: 'Sam Darnold Super Bowl MVP', 
    shortName: 'Darnold MVP', 
    currentPrice: 0.43, 
    volume: 656843, 
    category: 'player',
    url: 'https://polymarket.com/event/super-bowl-lx-mvp'
  },
  { 
    id: 'maye-mvp', 
    name: 'Drake Maye Super Bowl MVP', 
    shortName: 'Maye MVP', 
    currentPrice: 0.26, 
    volume: 607636, 
    category: 'player',
    url: 'https://polymarket.com/event/super-bowl-lx-mvp'
  },
  { 
    id: 'jsn-mvp', 
    name: 'Jaxon Smith-Njigba MVP', 
    shortName: 'JSN MVP', 
    currentPrice: 0.16, 
    volume: 515651, 
    category: 'player',
    url: 'https://polymarket.com/event/super-bowl-lx-mvp'
  },
  { 
    id: 'walker-mvp', 
    name: 'Kenneth Walker III MVP', 
    shortName: 'Walker MVP', 
    currentPrice: 0.09, 
    volume: 452122, 
    category: 'player',
    url: 'https://polymarket.com/event/super-bowl-lx-mvp'
  },
  { 
    id: 'stevenson-mvp', 
    name: 'Rhamondre Stevenson MVP', 
    shortName: 'Stevenson MVP', 
    currentPrice: 0.02, 
    volume: 311757, 
    category: 'player',
    url: 'https://polymarket.com/event/super-bowl-lx-mvp'
  },

  // Halftime Show - Bad Bunny First Song
  { 
    id: 'titi-first', 
    name: 'Tití Me Preguntó First Song', 
    shortName: 'Tití First', 
    currentPrice: 0.74, 
    volume: 848600, 
    category: 'halftime',
    url: 'https://polymarket.com/event/first-song-at-super-bowl-lx-halftime-show'
  },
  { 
    id: 'monaco-first', 
    name: 'MONACO First Song', 
    shortName: 'MONACO First', 
    currentPrice: 0.11, 
    volume: 102723, 
    category: 'halftime',
    url: 'https://polymarket.com/event/first-song-at-super-bowl-lx-halftime-show'
  },
  { 
    id: 'mudanza-first', 
    name: 'LA MUDANZA First Song', 
    shortName: 'MUDANZA First', 
    currentPrice: 0.07, 
    volume: 258138, 
    category: 'halftime',
    url: 'https://polymarket.com/event/first-song-at-super-bowl-lx-halftime-show'
  },

  // Coin Toss
  { 
    id: 'coin-heads', 
    name: 'Coin Toss Heads', 
    shortName: 'Heads', 
    currentPrice: 0.50, 
    volume: 500000, 
    category: 'prop',
    url: 'https://polymarket.com/event/super-bowl-lx-coin-toss'
  },
  { 
    id: 'coin-tails', 
    name: 'Coin Toss Tails', 
    shortName: 'Tails', 
    currentPrice: 0.50, 
    volume: 500000, 
    category: 'prop',
    url: 'https://polymarket.com/event/super-bowl-lx-coin-toss'
  },

  // Overtime
  { 
    id: 'overtime-yes', 
    name: 'Game Goes to Overtime', 
    shortName: 'Overtime Yes', 
    currentPrice: 0.07, 
    volume: 320000, 
    category: 'game',
    url: 'https://polymarket.com/event/super-bowl-lx-overtime'
  },

  // Bad Bunny Special
  { 
    id: 'badbunny-ice', 
    name: 'Bad Bunny says "F*ck ICE"', 
    shortName: 'BB F-ICE', 
    currentPrice: 0.08, 
    volume: 113948, 
    category: 'halftime',
    url: 'https://polymarket.com/event/will-bad-bunny-say-fuck-ice-at-the-super-bowl'
  },

  // Octopus (TD + 2pt by same player)
  { 
    id: 'octopus-yes', 
    name: 'Octopus Scored (TD + 2pt same player)', 
    shortName: 'Octopus', 
    currentPrice: 0.05, 
    volume: 180000, 
    category: 'prop',
    url: 'https://polymarket.com/event/pro-football-championship-octopus'
  },

  // National Anthem
  { 
    id: 'anthem-under-2', 
    name: 'National Anthem Under 2:00', 
    shortName: 'Anthem <2:00', 
    currentPrice: 0.35, 
    volume: 250000, 
    category: 'prop',
    url: 'https://polymarket.com/event/super-bowl-lx-national-anthem-time'
  },
  { 
    id: 'anthem-over-2', 
    name: 'National Anthem Over 2:00', 
    shortName: 'Anthem >2:00', 
    currentPrice: 0.65, 
    volume: 250000, 
    category: 'prop',
    url: 'https://polymarket.com/event/super-bowl-lx-national-anthem-time'
  },

  // Player Cry
  { 
    id: 'player-cry', 
    name: 'Player Cries During Anthem', 
    shortName: 'Player Cry', 
    currentPrice: 0.12, 
    volume: 95000, 
    category: 'prop',
    url: 'https://polymarket.com/event/pro-football-championship-player-to-cry-during-national-anthem'
  },
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
    TOUCHDOWN: team === 'SEA' 
      ? ['darnold-mvp', 'jsn-mvp', 'walker-mvp', 'overtime-yes'] 
      : ['maye-mvp', 'stevenson-mvp', 'overtime-yes'],
    FIELD_GOAL: ['overtime-yes'],
    INTERCEPTION: team === 'SEA' ? ['darnold-mvp'] : ['maye-mvp'],
    FUMBLE: team === 'SEA' ? ['darnold-mvp'] : ['maye-mvp'],
    SAFETY: ['octopus-yes'],
    SACK: team === 'SEA' ? ['darnold-mvp'] : ['maye-mvp'],
    BIG_PLAY: team === 'SEA' ? ['jsn-mvp', 'walker-mvp'] : ['stevenson-mvp'],
    PUNT: [],
    KICKOFF: ['coin-heads', 'coin-tails'],
    TWO_POINT_CONVERSION: ['octopus-yes'],
    HALFTIME: ['titi-first', 'monaco-first', 'badbunny-ice'],
    GAME_START: ['darnold-mvp', 'maye-mvp', 'coin-heads', 'anthem-over-2'],
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
    { type: 'FIELD_GOAL', description: 'Patriots FG', team: 'NE' },
    { type: 'TOUCHDOWN', description: 'Seahawks TD', team: 'SEA' },
    { type: 'BIG_PLAY', description: '35 yard pass', team: 'SEA' },
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

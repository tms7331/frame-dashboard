
export type Token = {
    id: string
    symbol: string
    name: string
    price: number
    amount: number
    value: number
    sentiment: "positive" | "neutral" | "negative"
    change24h: number
}

export type Portfolio = {
    totalValue: number
    tokens: Token[]
    historicalData: {
        labels: string[]
        values: number[]
    }
}

export type PortfolioAnalysis = {
    haiku: string
    timestamp: string
}

export type LeaderboardEntry = {
    category: string
    name: string
    score: number
    rank: number
    comment: string
}

export type CategoryData = {
    leaders: LeaderboardEntry[]
    yourScore: number
    yourRank: number
}

export type LeaderboardData = {
    bluechip: CategoryData
    degen: CategoryData
    broke: CategoryData
}

export type NewsItem = {
    tag: string
    content: string
}

export type MarketReport = {
    title: string
    timestamp: string
    summary: string
    keyPoints: string[]
    sentiment: "bullish" | "bearish" | "neutral"
}

export type UserInterests = {
    interests: string
    lastUpdated: string
}


export type LeaderboardCategory = "bluechip" | "degen" | "broke"
export type SnarkLevel = "belligerent" | "passive_aggressive" | "euphoric"

export type DebankToken = {
    id: string
    chain: string
    name: string
    symbol: string
    display_symbol: string | null
    optimized_symbol: string
    decimals: number
    logo_url: string
    protocol_id: string
    price: number
    price_24h_change: number
    is_verified: boolean
    is_core: boolean
    is_wallet: boolean
    time_at: number
    amount: number
    raw_amount: number
    raw_amount_hex_str: string
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


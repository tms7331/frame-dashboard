"use client"

import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowUp, ArrowDown, ArrowUpIcon, ArrowDownIcon, Minus } from "lucide-react"
import type { Portfolio, PortfolioAnalysis, MarketReport } from "@/lib/types"
import { fetchPortfolioData, analyzePortfolio, castHaikuToFarcaster } from "@/lib/portfolio-service"
import { fetchMarketReport } from "@/lib/market-service"

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
    const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [casting, setCasting] = useState(false)
    const [marketReport, setMarketReport] = useState<MarketReport | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [portfolioData, report] = await Promise.all([fetchPortfolioData(), fetchMarketReport()])
                setPortfolio(portfolioData)
                setMarketReport(report)
            } catch (error) {
                console.error("Error loading data:", error)
            }
        }
        loadData()
    }, [])

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            const analysis = await analyzePortfolio()
            setAnalysis(analysis)
        } catch (error) {
            console.error("Error analyzing portfolio:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCast = async () => {
        if (!analysis?.haiku) return

        setCasting(true)
        try {
            await castHaikuToFarcaster(analysis.haiku)
            alert("Haiku cast successfully!")
        } catch (error) {
            console.error("Error casting haiku:", error)
        } finally {
            setCasting(false)
        }
    }

    const handleCastToFarcaster = async () => {
        setLoading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            alert("Cast to Farcaster successfully!")
        } catch (error) {
            console.error("Error casting to Farcaster:", error)
        } finally {
            setLoading(false)
        }
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "bg-green-500"
            case "negative":
                return "bg-red-500"
            default:
                return "bg-yellow-500"
        }
    }

    const getSentimentIcon = (sentiment: MarketReport["sentiment"]) => {
        switch (sentiment) {
            case "bullish":
                return <ArrowUp className="w-6 h-6 text-green-500" />
            case "bearish":
                return <ArrowDown className="w-6 h-6 text-red-500" />
            case "neutral":
                return <Minus className="w-6 h-6 text-yellow-500" />
        }
    }

    if (!portfolio) return null

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
            <MobileNav />

            <div className="container px-4 py-8 space-y-8">
                {/* Portfolio Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Portfolio</h1>
                    <div className="text-2xl font-bold text-white">${portfolio.totalValue.toLocaleString()}</div>
                </div>

                {/* Tokens List */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Holdings</h2>
                        <div className="space-y-3">
                            {portfolio.tokens.map((token) => (
                                <Link
                                    key={token.id}
                                    href={`/research/coins/${token.id}`}
                                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${getSentimentColor(token.sentiment)}`} />
                                        <div>
                                            <div className="font-medium text-white">{token.name}</div>
                                            <div className="text-sm text-gray-400">
                                                {token.amount} {token.symbol}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-white">${token.value.toLocaleString()}</div>
                                        <div
                                            className={`text-sm flex items-center gap-1 ${token.change24h >= 0 ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {token.change24h >= 0 ? (
                                                <ArrowUpIcon className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownIcon className="w-4 h-4" />
                                            )}
                                            {Math.abs(token.change24h)}%
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Analysis Section */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Analysis of the Day</h2>
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                            >
                                Write a haiku describing my portfolio
                            </Button>
                        </div>

                        {analysis && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-gray-300 whitespace-pre-line font-medium">{analysis.haiku}</p>
                                        <p className="text-sm text-gray-400">Generated: {new Date(analysis.timestamp).toLocaleString()}</p>
                                    </div>
                                    <Button
                                        onClick={handleCast}
                                        disabled={casting}
                                        variant="secondary"
                                        className="bg-purple-500 hover:bg-purple-600 text-white"
                                    >
                                        Cast
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Market Report Section */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Market Report</h2>
                                <p className="text-sm text-gray-400">
                                    {marketReport?.timestamp ? new Date(marketReport.timestamp).toLocaleString() : "Loading..."}
                                </p>
                            </div>
                            {marketReport && getSentimentIcon(marketReport.sentiment)}
                        </div>

                        {marketReport ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{marketReport.title}</h3>
                                    <p className="mt-2 text-gray-300">{marketReport.summary}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-white mb-2">Key Points:</h4>
                                    <ul className="space-y-2">
                                        {marketReport.keyPoints.map((point, index) => (
                                            <li key={index} className="text-gray-300 flex items-start">
                                                <span className="text-purple-400 mr-2">•</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleCastToFarcaster}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                >
                                    Cast to Farcaster
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">Loading market report...</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}



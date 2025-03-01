"use client"

import { useState, useEffect, useCallback } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getPortfolio, getPortfolioString } from "@/lib/portfolioData"
import Link from "next/link"
import sdk from "@farcaster/frame-sdk";
import { ArrowUp, ArrowDown, ArrowUpIcon, ArrowDownIcon, Minus } from "lucide-react"
import type { DebankToken, MarketReport } from "@/lib/types"
import { perplexityPortfolioReportPrompt, chatGPTPortfolioSummarizerPrompt, chatGPTFunAnalysis } from "@/lib/prompts"
import { getReport, upsertReport } from "@/lib/supabaseClient"
import { useParams } from "next/navigation"

async function funAnalysis(portfolioString: string) {
    const submitString = `Write a haiku about the following cryptocurrency portfolio, the format is the token symbol and then balances on each line: ${portfolioString}`
    const response = await fetch(`/api/chatgpt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: submitString, context: chatGPTFunAnalysis }),
    });
    const data = await response.json();
    return data.response;
}


async function buildReport(portfolioString: string) {
    const response = await fetch(`/api/perplexity`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: portfolioString, context: perplexityPortfolioReportPrompt }),
    });
    const data = await response.json();
    return data.response;
}

async function summarizeReport(report: string) {
    const response = await fetch(`/api/chatgpt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: report, context: chatGPTPortfolioSummarizerPrompt }),
    });
    const data = await response.json();
    return data.response;
}

export default function PortfolioPage() {
    const params = useParams()
    const address = params.address as string

    const [portfolio, setPortfolio] = useState<DebankToken[] | null>(null)
    const [report, setReport] = useState<string | null>(null)
    const [summary, setSummary] = useState<string | null>(null)
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [casting, setCasting] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                // Get portfolio data
                console.log("Getting portfolio data for", address)
                const portfolioData = await getPortfolio(address)
                console.log("portfolioData", portfolioData)
                setPortfolio(portfolioData)

                if (portfolioData.length === 0) {
                    setReport("No portfolio data found!")
                    setSummary("No portfolio data found!")
                } else {
                    const existingReport = await getReport(address)
                    console.log("existingReport", existingReport)

                    if (existingReport) {
                        setReport(existingReport.report)
                        setSummary(existingReport.summary)
                    } else {
                        // Generate new report and summary
                        const portfolioString = getPortfolioString(portfolioData)
                        const newReport = await buildReport(portfolioString)
                        const newSummary = await summarizeReport(newReport)

                        // Update state
                        setReport(newReport)
                        setSummary(newSummary)

                        // Save to database
                        await upsertReport(address, newSummary, newReport)

                    }
                }
            } catch (error) {
                console.error("Error loading data:", error)
            }
        }
        loadData()
    }, [address])

    const handleAnalyze = async () => {
        setLoading(true)

        const portfolioString = getPortfolioString(portfolio)

        try {
            const analysis = await funAnalysis(portfolioString)
            setAnalysis(analysis)
        } catch (error) {
            console.error("Error analyzing portfolio:", error)
        } finally {
            setLoading(false)
        }
    }
    const openUrl = useCallback((url: string) => {
        sdk.actions.openUrl(url);
    }, []);

    const handleCast = async () => {
        if (!analysis) return

        setCasting(true)
        try {
            const castLink = `https://warpcast.com/~/compose?text=${analysis}`
            openUrl(castLink)
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

    // Calculate total value from the array
    const totalValue = portfolio.reduce((sum, token) => sum + token.price * token.amount, 0)

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
            <MobileNav />

            <div className="container px-4 py-8 space-y-8">
                {/* Portfolio Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Portfolio</h1>
                    <div className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</div>
                </div>

                {/* Tokens List */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Holdings</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400">
                                        <th className="p-3">Token</th>
                                        <th className="p-3">Chain</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3">24h Change</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolio.map((token) => (
                                        <tr
                                            key={token.id}
                                            className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="p-3">
                                                <Link href={`/research/coins/${token.id}`} className="flex items-center gap-2">
                                                    <span className="text-white">{token.symbol}</span>
                                                </Link>
                                            </td>
                                            <td className="p-3 text-white">{token.chain}</td>
                                            <td className="p-3 text-white">${token.price.toLocaleString()}</td>
                                            <td className={`p-3 flex items-center gap-1 ${token.price_24h_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                {token.price_24h_change >= 0 ? (
                                                    <ArrowUpIcon className="w-4 h-4" />
                                                ) : (
                                                    <ArrowDownIcon className="w-4 h-4" />
                                                )}
                                                {Math.abs(token.price_24h_change)}%
                                            </td>
                                            <td className="p-3 text-white">{token.amount.toLocaleString()}</td>
                                            <td className="p-3 text-white">${(token.price * token.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                                        <p className="text-gray-300 whitespace-pre-line font-medium">{analysis}</p>
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

                {/* Market Report Summary Section */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Market Report Summary</h2>
                            </div>
                        </div>

                        {summary ? (
                            <div className="space-y-4">
                                <p className="text-gray-300">{summary}</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">Creating summary, please wait up to 1 minute...</div>
                        )}
                    </div>
                </Card>

                {/* Market Report Section */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Market Report</h2>
                            </div>
                        </div>

                        {report ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="mt-2 text-gray-300">{report}</p>
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
                            <div className="text-center py-8 text-gray-400">Creating market report, please wait up to 1 minute...</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

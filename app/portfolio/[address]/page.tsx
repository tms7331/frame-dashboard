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
        body: JSON.stringify({ message: portfolioString, context: perplexityPortfolioReportPrompt, model: "sonar-deep-research" }),
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
            const encodedText = encodeURIComponent(analysis);
            // const castLink = `https://warpcast.com/~/compose?text=${encodedText}`;
            const castLink = `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=https://pulseboardai.framestop.xyz/dailymeme/hello`;
            openUrl(castLink)
        } catch (error) {
            console.error("Error casting haiku:", error)
        } finally {
            setCasting(false)
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
                        <div className="grid gap-4">
                            {portfolio.map((token) => (
                                <div
                                    key={token.id + token.chain}
                                    className="p-4 rounded-lg bg-gray-700/30 border border-gray-700"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <Link href={`/research/coins/${token.id}`} className="text-lg font-medium text-white">
                                            {token.symbol}
                                        </Link>
                                        <span className="text-white font-bold">
                                            ${(token.price * token.amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-gray-400">Chain</div>
                                        <div className="text-white text-right">{token.chain}</div>

                                        <div className="text-gray-400">Price</div>
                                        <div className="text-white text-right">${token.price.toLocaleString()}</div>

                                        <div className="text-gray-400">24h Change</div>
                                        <div className={`flex items-center justify-end gap-1 ${token.price_24h_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {token.price_24h_change >= 0 ? (
                                                <ArrowUpIcon className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownIcon className="w-4 h-4" />
                                            )}
                                            {Math.abs(token.price_24h_change * 100).toFixed(2)}%
                                        </div>

                                        <div className="text-gray-400">Amount</div>
                                        <div className="text-white text-right">{token.amount.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Analysis Section */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold text-white">AI Meme Analysis of the Day</h2>
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

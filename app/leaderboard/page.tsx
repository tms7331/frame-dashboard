"use client"

import { useState, useEffect, useCallback } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { LeaderboardData, LeaderboardEntry, SnarkLevel, LeaderboardCategory, DebankToken } from "@/lib/types"
import { getAllLeaderboardEntries, upsertLeaderboardEntry } from "@/lib/supabaseClient"
import sdk, { type Context } from "@farcaster/frame-sdk"
import { getLeaderboardJudgementPrompt } from "@/lib/prompts"
import { getPortfolio, getPortfolioString } from "@/lib/portfolioData"
import { useAtomValue } from 'jotai'
import { walletAddressAtom } from "@/lib/atoms"

const SNARK_LEVELS = [
    { value: "belligerent", label: "Rude" },
    { value: "passive_aggressive", label: "Passive Aggressive" },
    { value: "euphoric", label: "Bubbly" },
] as const

type UserScore = {
    score: number
    rank: number
    comment: string
} | null


function parseScore(score: string) {
    // Split by $$$ and take first two elements regardless of how many splits exist
    const [first, second] = score.split("$$$").slice(0, 2)

    // Try to parse first as number, fallback to random if it fails
    const firstValue = Number.isNaN(parseInt(first))
        ? Math.floor(Math.random() * 1000) + 1
        : parseInt(first)

    return {
        first: firstValue,
        second: second || "" // Return empty string if second is undefined
    }
}

export default function LeaderboardPage() {
    const [username, setUsername] = useState("")
    // 5650 is vitalik's fid, shouldn't ever fail though
    const [fid, setFid] = useState<number>(5650)
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
    const [worstTrade, setWorstTrade] = useState("")
    const [loading, setLoading] = useState(false)
    const [userScores, setUserScores] = useState<Record<string, UserScore>>({
        bluechip: null,
        degen: null,
        broke: null,
    })
    const [snarkLevels, setSnarkLevels] = useState<Record<string, SnarkLevel>>({
        bluechip: "belligerent",
        degen: "belligerent",
        broke: "belligerent",
    })
    const [isSDKLoaded, setIsSDKLoaded] = useState(false)
    const [portfolio, setPortfolio] = useState<DebankToken[]>([])
    const walletAddress = useAtomValue(walletAddressAtom)

    useEffect(() => {
        const fetchPortfolio = async () => {
            const portfolio = await getPortfolio(walletAddress)
            setPortfolio(portfolio)
        }
        fetchPortfolio()

        const fetchLeaderboardData = async () => {
            const entries = await getAllLeaderboardEntries();

            // Find user's entries for each category
            const userEntries = {
                bluechip: entries.find(entry => entry.category === 'bluechip' && entry.username === username),
                degen: entries.find(entry => entry.category === 'degen' && entry.username === username),
                broke: entries.find(entry => entry.category === 'broke' && entry.username === username),
            };

            // Update user scores based on found entries
            setUserScores({
                bluechip: userEntries.bluechip ? {
                    score: userEntries.bluechip.score,
                    rank: entries.filter(e => e.category === 'bluechip' && e.score > userEntries.bluechip.score).length + 1,
                    comment: userEntries.bluechip.comment
                } : null,
                degen: userEntries.degen ? {
                    score: userEntries.degen.score,
                    rank: entries.filter(e => e.category === 'degen' && e.score > userEntries.degen.score).length + 1,
                    comment: userEntries.degen.comment
                } : null,
                broke: userEntries.broke ? {
                    score: userEntries.broke.score,
                    rank: entries.filter(e => e.category === 'broke' && e.score > userEntries.broke.score).length + 1,
                    comment: userEntries.broke.comment
                } : null,
            });

            // Process entries for each category
            const processedData: LeaderboardData = {
                bluechip: {
                    leaders: entries
                        .filter(entry => entry.category === 'bluechip')
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((entry, index) => ({
                            name: entry.username,
                            score: entry.score,
                            rank: index + 1,
                            comment: entry.comment,
                            fid: entry.fid
                        })),
                    yourScore: userEntries.bluechip?.score || 0,
                    yourRank: userEntries.bluechip ? entries.filter(e => e.category === 'bluechip' && e.score > userEntries.bluechip.score).length + 1 : 0,
                },
                degen: {
                    leaders: entries
                        .filter(entry => entry.category === 'degen')
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((entry, index) => ({
                            name: entry.username,
                            score: entry.score,
                            rank: index + 1,
                            comment: entry.comment,
                            fid: entry.fid
                        })),
                    yourScore: userEntries.degen?.score || 0,
                    yourRank: userEntries.degen ? entries.filter(e => e.category === 'degen' && e.score > userEntries.degen.score).length + 1 : 0,
                },
                broke: {
                    leaders: entries
                        .filter(entry => entry.category === 'broke')
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((entry, index) => ({
                            name: entry.username,
                            score: entry.score,
                            rank: index + 1,
                            comment: entry.comment,
                            fid: entry.fid
                        })),
                    yourScore: userEntries.broke?.score || 0,
                    yourRank: userEntries.broke ? entries.filter(e => e.category === 'broke' && e.score > userEntries.broke.score).length + 1 : 0,
                },
            };

            setLeaderboardData(processedData);
        };

        fetchLeaderboardData();
    }, [username]);

    // Refactor and store user context somewhere instead?
    useEffect(() => {
        const load = async () => {
            const context = await sdk.context;
            setUsername(context?.user.username || "");
            setFid(context?.user.fid || 5650);
        };
        if (sdk && !isSDKLoaded) {
            setIsSDKLoaded(true);
            load();
        }
    }, [isSDKLoaded]);

    const handleSnarkLevelChange = (category: string, value: SnarkLevel) => {
        setSnarkLevels((prev) => ({
            ...prev,
            [category]: value,
        }))
    }

    const handleJudgeMe = async (category: LeaderboardCategory) => {
        setLoading(true)
        const context = getLeaderboardJudgementPrompt(category, snarkLevels[category])
        const portfolioString = getPortfolioString(portfolio)
        const message = category === "broke" ? worstTrade : portfolioString;
        try {
            const response = await fetch("/api/chatgpt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ context, message }),
            });

            const data = await response.json();
            const { first: score, second: comment } = parseScore(data.response);

            // Update Supabase with the new score and comment
            await upsertLeaderboardEntry({
                username,
                category,
                score,
                comment,
                fid,
                wallet_address: walletAddress
            });

            // Update leaderboardData with the new score
            setLeaderboardData(prevData => {
                if (!prevData) return prevData;

                const categoryData = prevData[category];
                const newLeaders = [...categoryData.leaders];

                // Create new entry
                const newEntry = {
                    name: username,
                    score,
                    comment,
                    fid: fid.toString(),
                    rank: 0 // Will be updated below
                };

                // Insert new entry and sort
                newLeaders.push(newEntry);
                newLeaders.sort((a, b) => b.score - a.score);

                // Update ranks and keep top 3
                newLeaders.forEach((entry, index) => entry.rank = index + 1);
                const updatedLeaders = newLeaders.slice(0, 3);

                // Calculate your rank
                const yourRank = newLeaders.findIndex(entry => entry.name === username) + 1;

                // Update userScores
                setUserScores(prev => ({
                    ...prev,
                    [category]: {
                        score,
                        rank: yourRank,
                        comment
                    }
                }));

                return {
                    ...prevData,
                    [category]: {
                        ...categoryData,
                        leaders: updatedLeaders,
                        yourScore: score,
                        yourRank: yourRank
                    }
                };
            });

        } catch (error) {
            console.error("Failed to get AI response:", error);
        } finally {
            setLoading(false)
        }
    }

    const handleCastToFarcaster = useCallback((score: number, category: string) => {
        const text = `My ${category} trading score: ${score}! Judge my trades on Farcaster Trader`;
        sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`);
    }, []);

    const renderSnarkLevelSelector = (category: string) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Choose snark level</label>
            <RadioGroup
                value={snarkLevels[category]}
                onValueChange={(value) => handleSnarkLevelChange(category, value as SnarkLevel)}
                className="flex gap-2"
            >
                {SNARK_LEVELS.map((level) => (
                    <div
                        key={level.value}
                        className="flex items-center space-x-2 px-4 py-3 rounded-md border border-gray-700 
              [&:has(:checked)]:bg-purple-500/20 [&:has(:checked)]:border-purple-500 
              hover:bg-gray-700/30 transition-colors cursor-pointer"
                    >
                        <RadioGroupItem
                            value={level.value}
                            id={`${category}-${level.value}`}
                            className="border-gray-500 text-purple-500"
                        />
                        <Label htmlFor={`${category}-${level.value}`} className="text-white font-medium cursor-pointer">
                            {level.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )

    if (!leaderboardData) return null

    const renderCategory = (title: string, category: LeaderboardCategory) => {
        const data = leaderboardData[category]
        const userScore = userScores[category]
        const isBroke = category === "broke"

        return (
            <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-white">{title} Traders</h2>

                <div className="space-y-4">
                    {data.leaders.map((leader: LeaderboardEntry, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-bold text-purple-400">#{leader.rank}</span>
                                <div>
                                    <span
                                        className="text-white cursor-pointer hover:text-purple-400 transition-colors underline"
                                        onClick={() => leader.fid && sdk.actions.viewProfile({ fid: parseInt(leader.fid) })}
                                    >
                                        @{leader.name}
                                    </span>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {leader.comment}
                                    </p>
                                </div>
                            </div>
                            <span className="text-gray-300">Score: {leader.score}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-700 pt-6 space-y-4">
                    <h3 className="text-xl font-semibold text-white">Your Score</h3>

                    {userScore && (
                        <div className="flex justify-between items-center bg-gray-700/30 rounded-lg p-4">
                            <div className="space-y-1">
                                <div className="text-gray-400">Current Rank: #{userScore.rank}</div>
                                <div className="text-xl font-bold text-white">Score: {userScore.score}</div>
                                <div className="text-sm text-gray-400 mt-1">{userScore.comment}</div>
                            </div>
                            <Button
                                className="bg-purple-500 hover:bg-purple-600"
                                onClick={() => handleCastToFarcaster(userScore.score, category)}
                            >
                                Cast to Farcaster
                            </Button>
                        </div>
                    )}

                    {isBroke && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Describe your worst trade</label>
                            <Textarea
                                value={worstTrade}
                                onChange={(e) => setWorstTrade(e.target.value)}
                                placeholder="It all started when I aped into..."
                                className="min-h-[100px] bg-gray-700/30 border-gray-600 text-white"
                            />
                        </div>
                    )}

                    {renderSnarkLevelSelector(category)}

                    <Button
                        onClick={() => handleJudgeMe(category)}
                        disabled={loading || (isBroke && !worstTrade)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                        Judge Me
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
            <MobileNav />

            <div className="container px-4 py-8">
                <h1 className="text-3xl font-bold text-white text-center mb-8">Leaderboard</h1>
                <div className="space-y-8">
                    {renderCategory("Bluechip", "bluechip")}
                    {renderCategory("Degen", "degen")}
                    {renderCategory("Broke", "broke")}
                </div>
            </div>
        </div>
    )
}


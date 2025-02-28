"use client"

import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { LeaderboardData } from "@/lib/types"

const SNARK_LEVELS = [
    { value: "kind", label: "Kind" },
    { value: "rude", label: "Rude" },
    { value: "belligerent", label: "Belligerent" },
] as const

type SnarkLevel = (typeof SNARK_LEVELS)[number]["value"]

export default function LeaderboardPage() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
    const [worstTrade, setWorstTrade] = useState("")
    const [loading, setLoading] = useState(false)
    const [snarkLevels, setSnarkLevels] = useState<Record<string, SnarkLevel>>({
        bluechip: "kind",
        degen: "kind",
        broke: "kind",
    })

    useEffect(() => {
        // Simulated data fetch
        setLeaderboardData({
            bluechip: {
                leaders: [
                    { name: "Alex Thompson", score: 2456, rank: 1 },
                    { name: "Maria Garcia", score: 2100, rank: 2 },
                    { name: "John Smith", score: 1950, rank: 3 },
                ],
                yourScore: 1200,
                yourRank: 15,
            },
            degen: {
                leaders: [
                    { name: "Sarah Chen", score: 1893, rank: 1 },
                    { name: "David Kim", score: 1654, rank: 2 },
                    { name: "Lisa Wong", score: 1432, rank: 3 },
                ],
                yourScore: 980,
                yourRank: 8,
            },
            broke: {
                leaders: [
                    { name: "Mike Johnson", score: 156, rank: 1 },
                    { name: "Tom Wilson", score: 143, rank: 2 },
                    { name: "Emma Davis", score: 121, rank: 3 },
                ],
                yourScore: 100,
                yourRank: 5,
            },
        })
    }, [])

    const handleSnarkLevelChange = (category: string, value: SnarkLevel) => {
        setSnarkLevels((prev) => ({
            ...prev,
            [category]: value,
        }))
    }

    const renderSnarkLevelSelector = (category: string) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Choose snark level</label>
            <RadioGroup
                value={snarkLevels[category]}
                onValueChange={(value) => handleSnarkLevelChange(category, value as SnarkLevel)}
                className="flex gap-4"
            >
                {SNARK_LEVELS.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.value} id={`${category}-${level.value}`} />
                        <Label htmlFor={`${category}-${level.value}`} className="text-white font-medium">
                            {level.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )

    if (!leaderboardData) return null

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
            <MobileNav />

            <div className="container px-4 py-8 space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Leaderboard</h1>

                <div className="grid gap-8">
                    {/* Bluechip Section */}
                    <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-white">Bluechip Traders</h2>

                        <div className="space-y-4">
                            {leaderboardData.bluechip.leaders.map((leader, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-bold text-purple-400">#{leader.rank}</span>
                                        <span className="text-white">{leader.name}</span>
                                    </div>
                                    <span className="text-gray-300">Score: {leader.score}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-700 pt-6 space-y-4">
                            <h3 className="text-xl font-semibold text-white">Your Score</h3>
                            <div className="flex justify-between items-center bg-gray-700/30 rounded-lg p-4">
                                <div className="space-y-1">
                                    <div className="text-gray-400">Current Rank: #{leaderboardData.bluechip.yourRank}</div>
                                    <div className="text-xl font-bold text-white">Score: {leaderboardData.bluechip.yourScore}</div>
                                </div>
                                <Button className="bg-purple-500 hover:bg-purple-600">Cast to Farcaster</Button>
                            </div>

                            {renderSnarkLevelSelector("bluechip")}

                            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                                Judge Me
                            </Button>
                        </div>
                    </div>

                    {/* Degen Section */}
                    <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-white">Degen Traders</h2>

                        <div className="space-y-4">
                            {leaderboardData.degen.leaders.map((leader, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-bold text-purple-400">#{leader.rank}</span>
                                        <span className="text-white">{leader.name}</span>
                                    </div>
                                    <span className="text-gray-300">Score: {leader.score}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-700 pt-6 space-y-4">
                            <h3 className="text-xl font-semibold text-white">Your Score</h3>
                            <div className="flex justify-between items-center bg-gray-700/30 rounded-lg p-4">
                                <div className="space-y-1">
                                    <div className="text-gray-400">Current Rank: #{leaderboardData.degen.yourRank}</div>
                                    <div className="text-xl font-bold text-white">Score: {leaderboardData.degen.yourScore}</div>
                                </div>
                                <Button className="bg-purple-500 hover:bg-purple-600">Cast to Farcaster</Button>
                            </div>

                            {renderSnarkLevelSelector("degen")}

                            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                                Judge Me
                            </Button>
                        </div>
                    </div>

                    {/* Broke Section */}
                    <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-white">Broke Traders</h2>

                        <div className="space-y-4">
                            {leaderboardData.broke.leaders.map((leader, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-bold text-purple-400">#{leader.rank}</span>
                                        <span className="text-white">{leader.name}</span>
                                    </div>
                                    <span className="text-gray-300">Score: {leader.score}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-700 pt-6 space-y-4">
                            <h3 className="text-xl font-semibold text-white">Your Score</h3>
                            <div className="flex justify-between items-center bg-gray-700/30 rounded-lg p-4">
                                <div className="space-y-1">
                                    <div className="text-gray-400">Current Rank: #{leaderboardData.broke.yourRank}</div>
                                    <div className="text-xl font-bold text-white">Score: {leaderboardData.broke.yourScore}</div>
                                </div>
                                <Button className="bg-purple-500 hover:bg-purple-600">Cast to Farcaster</Button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Describe your worst trade</label>
                                <Textarea
                                    value={worstTrade}
                                    onChange={(e) => setWorstTrade(e.target.value)}
                                    placeholder="It all started when I aped into..."
                                    className="min-h-[100px] bg-gray-700/30 border-gray-600 text-white"
                                />
                            </div>

                            {renderSnarkLevelSelector("broke")}

                            <Button
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                disabled={!worstTrade}
                            >
                                Judge Me
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


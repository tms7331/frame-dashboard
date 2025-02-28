"use client"

import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { fetchUserInterests } from "@/lib/market-service"

export default function PersonalizePage() {
    const [inputText, setInputText] = useState("")
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const interests = await fetchUserInterests()
                setInputText(interests.interests)
                setLastUpdated(interests.lastUpdated)
            } catch (error) {
                console.error("Error loading data:", error)
            }
        }
        loadData()
    }, [])

    const handleSave = () => {
        setLoading(true)
        try {
            setLastUpdated(new Date().toISOString())
            alert("Areas of interest updated successfully!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
            <MobileNav />

            <div className="container px-4 py-8 space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Personalize</h1>

                {/* Areas of Interest Section */}
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Areas of Interest</h2>
                                {lastUpdated && (
                                    <p className="text-sm text-gray-400">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Enter your areas of interest..."
                                className="bg-gray-700/30 border-gray-600 text-white"
                            />
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-purple-500 hover:bg-purple-600 whitespace-nowrap"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}


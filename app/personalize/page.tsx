"use client"

import { useState, useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { deleteNewsByUsername, getUserPrompt, upsertUserPrompt } from "@/lib/supabaseClient"
import sdk from "@farcaster/frame-sdk"
export default function PersonalizePage() {
    const [inputText, setInputText] = useState("")
    const [loading, setLoading] = useState(false)
    const [username, setUsername] = useState("-")

    useEffect(() => {
        const loadData = async () => {
            try {
                const context = await sdk.context;
                const ctxUsername = context?.user.username || ""
                setUsername(ctxUsername)
                const userPrompt = await getUserPrompt(ctxUsername)
                setInputText(userPrompt?.prompt || "")
            } catch (error) {
                console.error("Error loading data:", error)
            }
        }
        loadData()
    }, [])

    const handleSave = async () => {
        if (!username) return; // Prevent saving if username is empty
        setLoading(true)
        try {
            // Want to delete any elements they have in the news table so we'll update again on home screen
            await deleteNewsByUsername(username);

            await upsertUserPrompt(
                username,
                inputText
            )
            alert("Areas of interest updated successfully!")
        } catch (error) {
            console.error("Error saving data:", error)
            alert("Failed to save changes")
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
                                disabled={loading || !username}
                                className="bg-purple-500 hover:bg-purple-600 whitespace-nowrap"
                            >
                                Save
                            </Button>
                        </div>
                        {!username && (
                            <p className="text-sm text-yellow-400">Use in Warpcast to personalize prompt</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}


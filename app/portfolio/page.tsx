"use client"

import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PortfolioPage() {
    const { address } = useAccount()
    const router = useRouter()

    useEffect(() => {
        if (address) {
            router.push(`/portfolio/${address}`)
        }
    }, [address, router])

    // Show loading state or connect wallet prompt while not connected
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center">
            {!address ? (
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
                    <p className="text-gray-400">Please connect your wallet to view your portfolio</p>
                </div>
            ) : (
                <div>Loading Portfolio...</div>
            )}
        </div>
    )
}
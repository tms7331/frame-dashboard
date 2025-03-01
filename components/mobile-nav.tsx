import Link from "next/link"
import Image from "next/image"
import { useAtomValue } from 'jotai'
import { walletAddressAtom, profileImageAtom } from '@/lib/atoms'

const bottomNavItems = [
    { name: "News", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Leaderboard", href: "/leaderboard" },
]

export function MobileNav() {
    const walletAddress = useAtomValue(walletAddressAtom)
    const profileImage = useAtomValue(profileImageAtom)

    return (
        <div className="w-full bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
            {/* Top Row */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700/50">
                <Link
                    href="/personalize"
                    className="text-sm text-gray-300 hover:text-white font-medium px-2 py-1 rounded-md hover:bg-white/10 transition-colors border border-gray-500/30 hover:border-gray-400/50"
                >
                    Personalize
                </Link>

                <div className="flex items-center gap-3">
                    <span className="text-gray-300 font-mono text-xs">{walletAddress}</span>
                    <button className="w-6 h-6 rounded-full overflow-hidden border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-900">
                        <Image
                            src={profileImage}
                            alt="Profile"
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="px-3 py-1.5">
                <nav className="flex justify-center gap-3">
                    {bottomNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm text-white font-medium px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}


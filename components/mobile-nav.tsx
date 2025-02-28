import Link from "next/link"
import Image from "next/image"

const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Alpha", href: "/alpha" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Agent", href: "/agent" },
]

export function MobileNav() {
    return (
        <div className="w-full bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
            <div className="flex items-center justify-between px-4">
                <div className="overflow-x-auto flex-1">
                    <nav className="flex min-w-max py-3 gap-6">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-white font-medium px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Profile Picture */}
                <div className="pl-4 flex items-center">
                    <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                        <Image
                            src="/placeholder.svg?height=40&width=40"
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}


import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FarcasterFrame() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 pt-4">
      <div className="container px-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">Frashboard</h1>

          <div className="flex flex-col gap-4 mt-8">
            <Link href="/portfolio">
              <Button className="h-12 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105">
                View Portfolio
              </Button>
            </Link>

            <Link href="/news">
              <Button className="h-12 px-8 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105">
                View News Feed
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


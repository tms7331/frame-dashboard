"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { getTopEntryForEachCategory, getAllNews, getUserPrompt } from "@/lib/supabaseClient"
import type { ChartData, LeaderboardEntry, NewsItem } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import sdk, {
  AddFrame,
  FrameNotificationDetails,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
// import { createStore } from 'mipd'
import { useAccount } from "wagmi";
import { useSetAtom } from 'jotai'
import { walletAddressAtom, profileImageAtom, portfolioUrlAtom } from '@/lib/atoms'
import { resolveENS } from "@/lib/ensResolve"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type HistoricalPriceData = {
  prices: [number, number][]; // Array of [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

async function getHistoricalPrices(
  coinId: string,
  currency: string,
  days: number = 30,
  interval: "minutely" | "hourly" | "daily" = "daily"
): Promise<[number, number][]> {
  const apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data: HistoricalPriceData = await response.json();
    return data.prices; // Array of [timestamp, price]
  } catch (error) {
    console.error("Failed to fetch historical prices:", error);
    return [];
  }
}

export default function FarcasterFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [userContext, setUserContext] = useState<Context.FrameContext>();
  const [prices, setPrices] = useState<number[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [news, setNews] = useState<NewsItem[]>([])

  const { address, isConnected } = useAccount();
  const setWalletAddress = useSetAtom(walletAddressAtom)
  const setProfileImage = useSetAtom(profileImageAtom)
  const setPortfolioUrl = useSetAtom(portfolioUrlAtom)

  useEffect(() => {
    const loadData = async () => {
      const historicalPrices = await getHistoricalPrices("ethereum", "usd", 30, "daily");
      console.log(historicalPrices);
      // Extract prices and convert timestamps to dates
      const priceValues = historicalPrices.map(([_, price]) => price);
      const labels = historicalPrices.map(([timestamp]) =>
        new Date(timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      );

      setPrices(priceValues);
      setChartData({
        labels,
        prices: priceValues
      });

      const [leadersData, newsData] = await Promise.all([
        getTopEntryForEachCategory(),
        getAllNews()
      ]);

      // Set the leadersData so they are always in the order of bluechip, degen, broke
      const sortedLeaders = leadersData.sort((a, b) => {
        const order = ['bluechip', 'degen', 'broke'];
        return order.indexOf(a.category) - order.indexOf(b.category);
      });

      setLeaders(sortedLeaders)
      setNews(newsData)
    }

    loadData()
  }, [])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Ethereum Price",
        color: "rgba(255, 255, 255, 0.9)",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          bottom: 15,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  }

  useEffect(() => {
    const load = async () => {
      if (address) {
        const resolvedAddress = await resolveENS(address)
        console.log("resolvedAddress", resolvedAddress)
        // Truncate the address to the first 6 and last 4 characters
        const truncatedAddress = resolvedAddress.slice(0, 6) + "..." + resolvedAddress.slice(-4)
        setWalletAddress(truncatedAddress)
        setPortfolioUrl(`/portfolio/${resolvedAddress}`)
      }
    }
    load()
  }, [address, setWalletAddress])

  useEffect(() => {
    const load = async () => {
      const userContext_ = await sdk.context;
      setUserContext(userContext_);
      const username = userContext_?.user.username || ""
      const userPrompt = await getUserPrompt(username)

      // Set profile image if available in userContext
      if (userContext_?.user.pfpUrl) {
        setProfileImage(userContext_.user.pfpUrl)
      }

      console.log("userPrompt", userPrompt)
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded, setProfileImage]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
      <MobileNav />

      <div className="container px-4 space-y-8 pt-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">PulseBoardAI</h1>
          <p>{JSON.stringify(userContext, null, 2)}</p>
          <div className="flex gap-2">
            <span>Address:</span>
            <code>{address}</code>
          </div>
        </div>

        {/* Chart Section */}
        <div className="w-full h-[200px] bg-gray-800/50 rounded-lg p-4">
          {chartData && (
            <Line
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    data: chartData.prices,
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    tension: 0.4,
                  },
                ],
              }}
              options={chartOptions}
            />
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Leaderboard Champions</h2>
          <div className="grid gap-3">
            {leaders.map((leader, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-semibold">{leader.category.charAt(0).toUpperCase() + leader.category.slice(1)}</span>
                  <span className="text-white font-bold">Score: {leader.score}</span>
                </div>
                <span className="text-gray-300">{leader.name}</span>
                <span className="text-gray-400 text-sm">{leader.comment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Latest News</h2>
          <div className="grid gap-3">
            {news.map((item, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-white font-semibold">{item.tag}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


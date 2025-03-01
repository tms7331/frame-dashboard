"use client"

import { useCallback, useEffect, useState } from "react"
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
import { getTopEntryForEachCategory, getUserPrompt, upsertNewsItem, getNewsByUsername } from "@/lib/supabaseClient"
import type { LeaderboardEntry, NewsItem } from "@/lib/types"
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
import { getPerplexity } from "@/lib/newsData"
import { filterCoindeskArticles } from "@/lib/newsData"
import { getCoindeskArticles } from "@/lib/newsData"
import { filterFarcasterCasts } from "@/lib/newsData"
import { getFarcasterCasts } from "@/lib/newsData"

type ChartData = {
  labels: string[];
  prices: number[];
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type HistoricalPriceData = {
  prices: [number, number][]; // Array of [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

async function getNewsForUser(fid: number, username: string, prompt: string): Promise<NewsItem[]> {

  const interests = prompt;
  // const fid = 5650;
  const farcasterPosts = await getFarcasterCasts(fid);
  const filteredFarcasterPosts = await filterFarcasterCasts(farcasterPosts.casts, interests);
  await upsertNewsItem("farcaster", filteredFarcasterPosts, username);

  const coindeskArticles = await getCoindeskArticles();
  console.log("COINDESK ARTICLES", coindeskArticles);
  const filteredCoindeskArticles = await filterCoindeskArticles(coindeskArticles, interests);
  console.log("FILTERED COINDESK ARTICLES", filteredCoindeskArticles);
  await upsertNewsItem("coindesk", filteredCoindeskArticles, username);

  const perplexityString = await getPerplexity(interests);
  console.log("PERPLEXITY STRING", perplexityString);
  await upsertNewsItem("perplexity", perplexityString, username);

  return [{ "tag": "farcaster", "content": filteredFarcasterPosts }, { "tag": "coindesk", "content": filteredCoindeskArticles }, { "tag": "perplexity", "content": perplexityString }]
}

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

// Add this helper function to check if data is stale (older than 1 hour)
const isDataStale = (timestamp: string) => {
  const writeTime = new Date(timestamp).getTime();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  console.log("STALE DATA CHECK", writeTime, oneHourAgo)
  console.log("IS STALE?", writeTime < oneHourAgo)
  return writeTime < oneHourAgo;
};

export default function FarcasterFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [userContext, setUserContext] = useState<Context.FrameContext>();
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [news, setNews] = useState<NewsItem[]>([])

  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);
  const [addFrameResult, setAddFrameResult] = useState("");

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

      setChartData({
        labels,
        prices: priceValues
      });

      // Get leaders data separately since it's not dependent on the prompt
      const leadersData = await getTopEntryForEachCategory();
      const sortedLeaders = leadersData.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
        const order = ['bluechip', 'degen', 'broke'];
        return order.indexOf(a.category) - order.indexOf(b.category);
      });
      setLeaders(sortedLeaders);
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

  const addFrame = useCallback(async () => {
    console.log("adding frame...")
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);


  useEffect(() => {
    const load = async () => {
      const userContext_ = await sdk.context;
      setUserContext(userContext_);
      const username = userContext_?.user.username || "";
      const userPrompt = await getUserPrompt(username);

      await addFrame();

      let newsData: NewsItem[];
      if (!userPrompt) {
        // If no user prompt, use "-" as username
        newsData = await getNewsByUsername("-");
      } else {
        // Get existing news data from table
        const existingNews = await getNewsByUsername(username);
        console.log("existingNews!", existingNews)
        if (!existingNews.length || isDataStale(existingNews[0].write_timestamp!)) {
          console.log("getting fresh news")
          // If data is stale or doesn't exist, get fresh news
          const fid = userContext_?.user.fid;
          newsData = await getNewsForUser(fid, username, userPrompt.prompt);
          console.log("newsData!", newsData)
          // The getNewsForUser function should handle writing to the table
        } else {
          console.log("using existing news")
          // Use existing news data if it's fresh
          newsData = existingNews;
        }
      }
      //Set it so they are always sorted in this order: farcaster, coindesk, perplexity
      const sortedNewsData = newsData.sort((a, b) => {
        const order = ['farcaster', 'coindesk', 'perplexity'];
        return order.indexOf(a.tag) - order.indexOf(b.tag);
      });
      setNews(sortedNewsData);

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

  useEffect(() => {
    const load = async () => {
      if (address) {
        const resolvedAddress = await resolveENS(address)
        console.log("resolvedAddress", resolvedAddress)
        setWalletAddress(resolvedAddress)
        setPortfolioUrl(`/portfolio/${resolvedAddress}`)
      }
    }
    load()
  }, [address, setWalletAddress])

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
      <MobileNav />

      <div className="container px-4 space-y-8 pt-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">PulseBoardAI</h1>
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
              options={chartOptions as any}
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
                  <div className="text-gray-300">
                    {leader.username ? (
                      <>
                        <button
                          onClick={() => leader.fid && sdk.actions.viewProfile({ fid: parseInt(leader.fid) })}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          @{leader.username}
                        </button>
                        <span> is </span>
                        <span className="text-purple-400">{leader.category.charAt(0).toUpperCase() + leader.category.slice(1)}</span>
                        <span> champion</span>
                      </>
                    ) : (
                      <span>{leader.username}</span>
                    )}
                  </div>
                  <span className="text-white font-bold">Score: {leader.score}</span>
                </div>
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
                <h3 className="text-white font-semibold">{item.tag.charAt(0).toUpperCase() + item.tag.slice(1)}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


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
import { fetchChartData, fetchLeaders, fetchNews } from "./data-service"
import type { ChartData, Leader, NewsItem } from "@/lib/types"
import { MobileNav } from "@/components/mobile-nav"
import sdk, {
  AddFrame,
  FrameNotificationDetails,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import { createStore } from 'mipd'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function FarcasterFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);

  const [lastEvent, setLastEvent] = useState("");

  const [addFrameResult, setAddFrameResult] = useState("");
  const [sendNotificationResult, setSendNotificationResult] = useState("");

  //////////////////
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [chartData, leadersData, newsData] = await Promise.all([fetchChartData(), fetchLeaders(), fetchNews()])

      setChartData(chartData)
      setLeaders(leadersData)
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
        text: "Crypto Markets",
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
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
      <MobileNav />

      <div className="container px-4 space-y-8 pt-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">Frashboard</h1>
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
          <h2 className="text-xl font-semibold text-white">Leaderboard</h2>
          <div className="grid gap-3">
            {leaders.map((leader, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-semibold">{leader.title}</span>
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
                <h3 className="text-white font-semibold">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


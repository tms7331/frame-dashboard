import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api";
import { NextResponse } from "next/server";

const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY || "", // Note: Use server-side env variable, not NEXT_PUBLIC_
});

const client = new NeynarAPIClient(config);

export async function GET() {
    try {
        /*
        // Trending
        const feed = await client.fetchFeed({
            feedType: FeedType.Filter,
            filterType: FilterType.GlobalTrending,
            limit: 10,
        });
        // Channel
        const channelId = "ethereum";
        const filterType = FilterType.ChannelId;
        const feed = await client.fetchFeed({
            feedType: FeedType.Filter,
            filterType,
            channelId,
        });
        */
        const vitalikFid = 5650;
        const feed = await client.fetchFeed({ feedType: FeedType.Following, fid: vitalikFid });
        return NextResponse.json(feed);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch trending posts" }, { status: 500 });
    }
} 
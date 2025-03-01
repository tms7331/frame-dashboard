import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api";
import { NextResponse } from "next/server";

const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY || "", // Note: Use server-side env variable, not NEXT_PUBLIC_
});

const client = new NeynarAPIClient(config);


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const fid = searchParams.get('fid');

        if (!fid) {
            return NextResponse.json({ error: "fid is required" }, { status: 400 });
        }

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
        const feed = await client.fetchFeed({ feedType: FeedType.Following, fid: parseInt(fid) });
        return NextResponse.json(feed);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch trending posts" }, { status: 500 });
    }
} 
"use client";

import { deleteNewsByUsername, upsertNewsItem, dumpDummyLeaderboardEntries } from "@/lib/supabaseClient";
import { getFarcasterCasts, getPerplexity, getCoindeskArticles, filterFarcasterCasts, formatFarcasterCasts, filterCoindeskArticles, formatCoindeskArticles } from "@/lib/newsData";

export default function Home() {
    const updateAll = async () => {
        try {
            const interests = "general cryptocurrency news";
            // Filter vitalik's feed

            const vitalikFid = 5650;
            const farcasterPosts = await getFarcasterCasts(vitalikFid);
            const formattedFarcasterPosts = await formatFarcasterCasts(farcasterPosts.casts);
            const filteredFarcasterPosts = await filterFarcasterCasts(formattedFarcasterPosts, interests);
            await upsertNewsItem("farcaster", filteredFarcasterPosts, "-");

            const coindeskArticles = await getCoindeskArticles();
            console.log("COINDESK ARTICLES", coindeskArticles);
            const formattedCoindeskArticles = await formatCoindeskArticles(coindeskArticles);
            console.log("FORMATTED COINDESK ARTICLES", formattedCoindeskArticles);
            const filteredCoindeskArticles = await filterCoindeskArticles(formattedCoindeskArticles, interests);
            console.log("FILTERED COINDESK ARTICLES", filteredCoindeskArticles);
            await upsertNewsItem("coindesk", filteredCoindeskArticles, "-");

            const perplexityString = await getPerplexity(interests);
            console.log("PERPLEXITY STRING", perplexityString);
            await upsertNewsItem("perplexity", perplexityString, "-");


        } catch (error) {
            console.error("Error updating data:", error);
        }
    };

    const deleteAll = async () => {
        try {
            console.log("DELETING ALL NEWS");
            await deleteNewsByUsername("-");
            console.log("DELETED ALL NEWS");
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const dumpDummyData = async () => {
        try {
            console.log("DUMPING DUMMY LEADERBOARD DATA");
            await dumpDummyLeaderboardEntries();
            console.log("DUMPED DUMMY LEADERBOARD DATA");
        } catch (error) {
            console.error("Error dumping dummy data:", error);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <main className="flex flex-col items-center gap-4">
                <button
                    onClick={updateAll}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Update Default Data
                </button>
                <button
                    onClick={deleteAll}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Delete Default Data
                </button>
                <button
                    onClick={dumpDummyData}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Load Dummy Leaderboard Data
                </button>
            </main>
        </div>
    );
}
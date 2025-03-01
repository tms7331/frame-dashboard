"use client";

import { useState } from "react";


async function getNews() {
    const response = await fetch("https://data-api.coindesk.com/news/v1/article/list?lang=EN&limit=10", {
        method: "GET",
    });
    const data = await response.json();
    return data.Data;
}

export default function Home() {

    const [summary, setSummary] = useState("");
    const [judgement, setJudgement] = useState("");
    const [news, setNews] = useState([]);
    const [perplexity, setPerplexity] = useState("");

    // async function judgePortfolio(balances: string) {
    //     const context = "You are a judge of crypto portfolios.  You are very snarky and judgemental.  Users will submit their portfolios to you, and you will return a very short judgement regarding how awful it is (because it will always be awful)"
    //     const response = await fetch("/api/chatgpt", {
    //         method: "POST",
    //         body: JSON.stringify({ message: balances, context }),
    //     });
    //     const data = await response.json();
    //     return data.response;
    // }

async function judgePortfolio(balances: string) {
    const context = `You are a crypto portfolio analyzer that evaluates holdings on a scale of 1-1000. Users will submit their portfolios to you, and you will return a very short judgement regarding how awful it is (because it will always be awful)
    
    Analyze the provided portfolio balances and return:
    1. A numerical score between 1-1000 (higher = better)
    2. A brief, snarky judgment about the portfolio quality
    
    Score based on:
    - Diversification (variety of assets)
    - Risk management (allocation percentages)
    - Inclusion of established projects vs speculative tokens
    - Presence of blue-chip cryptos (BTC, ETH)
    - Allocation to DeFi, L1/L2s, and emerging sectors
    
    Format response EXACTLY as: "$$$SCORE: [number]$$$\n[brief judgment]" with the dollar signs as separators`

    const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: balances, context }),
    });
    
    const data = await response.json();
    return data.response;
    };
}

    
    async function getPerplexSummary(message: string) {
        const context = "You are a helpful assistant that summarizes messages. You will be given a message, there is a user interested in cryptocurrency based on a report you will be given and you need to summarize the messages in a way that succinctly lets them know what information is available"
        const response = await fetch("/api/chatgpt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message, context }),
        });
        const data = await response.json();
        return data.response;
    }

async function getPerplex(message: string,) {
    const context = `You are a crypto news assistant researching crypto for a Farcaster frame. Analyze the provided messages and create a concise summary of discussions relevant to the user's balances.

Your summary should:
1. Prioritize mentions of the user's specific tokens
2. Include price movements, project updates, and community sentiment
3. Highlight timely information (upcoming events, recent announcements)
4. Be brief (under 280 characters) and actionable
5. Use crypto-native terminology appropriate for Farcaster users
6. provide the raw data that is found`

    const response = await fetch("/api/perplexity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            message, 
            context
        }),
    });
    const data = await response.json();
    return data.response;
}
    
    async function getBalances(address: string) {
        const response = await fetch(`/api/debank?address=${address}`);
        const data = await response.json();
        // {
        //     "id": "0x2826d136f5630ada89c1678b64a61620aab77aea",
        //     "chain": "swell",
        //     "name": "Swell Governance Token",
        //     "symbol": "SWELL",
        //     "display_symbol": null,
        //     "optimized_symbol": "SWELL",
        //     "decimals": 18,
        //     "logo_url": "https://static.debank.com/image/project/logo_url/swellbridge/c1c8d54abb623f1ca9d808c830f7864d.png",
        //     "protocol_id": "swell_swellnetwork",
        //     "price": 0.01304,
        //     "price_24h_change": 0.06623058053965658,
        //     "is_verified": true,
        //     "is_core": true,
        //     "is_wallet": true,
        //     "time_at": 1733824053,
        //     "amount": 1667.6106629917074,
        //     "raw_amount": 1.6676106629917072e+21,
        //     "raw_amount_hex_str": "0x5a66bf369c6a5da708"
        // }
        // Filter for balances where price * amount is greater than 100
        const filteredBalances = data.filter((balance: any) => balance.price * balance.amount > 100);
        console.log("filteredBalances");
        console.log(filteredBalances);

        // Now create a string that only consists of the token, and our total value of it
        const balancesString = filteredBalances.map((balance: any) => `${balance.symbol}: ${balance.price * balance.amount}`).join("\n");
        console.log("balancesString");
        console.log(balancesString);
        const judgement = await judgePortfolio(balancesString);
        setJudgement(judgement);
    }

    const handleClick = async () => {
        console.log("Button function was called!");
        try {
            const response = await fetch('/api/farcasterposts');
            const feed = await response.json();
            console.log(feed);


            // For each element in feed.casts, print the text
            feed.casts.forEach((post: any) => {
                console.log(post.text);
                // Urls like:
                // https://warpcast.com/jessepollak/0xb07bc646
                const hash = post.hash.slice(0, 10);
                const user = post.author.username;
                const url = `https://warpcast.com/${user}/${hash}`;
                console.log(url);

            });
            // Also create a single string of all the messages, concatenated with newline characters
            const allMessages = feed.casts.map((post: any) => post.text).join("\n");
            const summary = await getSummary(allMessages);
            setSummary(summary);
            console.log(summary);

        } catch (error) {
            console.error("Error fetching trending posts:", error);
        }
    };

    const handleBalancesClick = async () => {
        try {
            await getBalances("0xf7b10d603907658f690da534e9b7dbc4dab3e2d6");
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    };

    const handlePerplexityClick = async () => {
        const message = "I have ETH and SOL, what is the latest crypto news that is relevant to me?";
        const perplexity = await getPerplexity(message);
        setPerplexity(perplexity);
    };

    const handleNewsClick = async () => {
        const news = await getNews();
        // {
        //     "TYPE": "121",
        //     "ID": 40914062,
        //     "GUID": "https://bitcoinworld.co.in/?p=134979",
        //     "PUBLISHED_ON": 1740668035,
        //     "IMAGE_URL": "https://resources.cryptocompare.com/news/82/default.png",
        //     "TITLE": "Solana About to Crash to $120? Why Is SOLX The Best ICO Alternative?",
        //     "URL": "https://bitcoinworld.co.in/solana-about-to-crash-to-120-why-is-solx-the-best-ico-alternative/",
        //     "SOURCE_ID": 82,
        //     "BODY": "The crypto market is going through a rough period at the moment. Many thought after Trump’s inauguration that a golden era for crypto was about to begin. However, Trump’s posturing with Mexico, Canada, and China unfortunately started off what has been a period of bearish conditions for the market. As is often the case, it began with Bitcoin ($BTC) which took a hit after Trump failed to make good on pre-election promises regarding the number one crypto token. That has now slipped down to major altcoins and Solana ($SOL) has not been immune. Despite its popularity in 2024, it has taken a hit recently. Luckily for readers who may be worried about the decline of Solana, we have an alternative called Solaxy ($SOLX). So why is $SOLX the best ICO alternative? Besides the great properties that the project has, the timing couldn’t have been more perfect. Let’s take a look at why. Visit Solaxy Presale Solaxy $SOLX Layer 2 ICO Hits $23M the Next Big Crypto Play? $SOLX just smashed $23 million in its ICO, and the hype is real! With Layer 2 scaling and big investor interest, could $SOLX be the next crypto rocket? Don’t blink—this one’s moving fast! #Crypto #SOLX #MoonMission … pic.twitter.com/Q9Xz4j8jTW — madmix (@madmixnum) February 24, 2025 Why $SOLX is the best ICO alternative to Solana As we just mentioned the Solaxy ($SOLX) launch has come at a perfect time. Unfortunately, one of the reasons for the timing has been the collapse of Solana and the price of $SOL. The price has now dropped by over 40% in the last 30 days but the question is: why? Experts believe it is a combination of three things: Solana’s total value locked has dropped by $5 billion since January 25th, There has been a significant shift toward other chains like Ethereum, and lastly the meme coin market taking a hit has also damaged Solana. A lot of its growth came from successful meme coins choosing Solana so it makes sense now that the sector is struggling so is the network. The other reason the timing of Solaxy is perfect is because of the stress that the Solana network is under because of how many new meme coins over the last year have been built on the chain. Solaxy offering the first Solana Layer 2 solution could not have come at a better time making it the best ICO alternative. Solaxy could be the antidote to investor’s problems with Solana We can not fully go off metrics when it comes to finding the best new crypto presale on Solana but what we are seeing from Solaxy is very promising. It has raised over $23.6 million so far and has been raising money at a steady pace throughout. Visit Solaxy Presale This shows that what they are selling is going down very well with investors. We touched on this already but the amount of new meme coins on Solana has led to some congestion problems. The OFFICIAL TRUMP ($TRUMP) and Official Melina Meme ($MEME) have added to the problems as of late. The idea behind Solaxy is to provide a Layer 2 solution on Solana by offering unlimited scalability and a future-proof network. It should be very popular with investors and there are even staking rewards for early adaptors. The APY is currently at 179% but make sure to act fast as this figure won’t last given the best ICO’s popularity. Visit Solaxy Presale Even Grok believes that Solaxy is the best investment option More and more savvy investors are using AI to try and get a leg up on the competition when it comes to crypto. Nobody knows yet what AI is the best but given Musk’s love of crypto, X’s Grok AI is a good bet. When we asked what was the best crypto to buy in February Grok went for Solaxy. Conclusion As you can see, if you’re looking for the best ICO alternative, the only place to go is to the Solaxy presale. Right now the price is 1 SOLX = $0.001646 which seems too good to be true. However, readers should note that the price is going up regularly. It just increased today so act fast to get in at the best possible price.",
        //     "KEYWORDS": "Crypto News|Press Release|best ICO|INVESTOR|Solaxy presale|SOLX",
        //     "LANG": "EN",
        //     "UPVOTES": 0,
        //     "DOWNVOTES": 0,
        //     "SCORE": 0,
        //     "SENTIMENT": "NEGATIVE",
        //     "STATUS": "ACTIVE",
        //     "CREATED_ON": 1740668047,
        //     "UPDATED_ON": null,
        //     "SOURCE_DATA": {
        //         "TYPE": "120",
        //         "ID": 82,
        //         "SOURCE_KEY": "bitcoinworld",
        //         "NAME": "Bitcoin World",
        //         "IMAGE_URL": "https://resources.cryptocompare.com/news/82/default.png",
        //         "URL": "https://bitcoinworld.co.in/feed/",
        //         "LANG": "EN",
        //         "SOURCE_TYPE": "RSS",
        //         "LAUNCH_DATE": null,
        //         "SORT_ORDER": 0,
        //         "BENCHMARK_SCORE": 0,
        //         "STATUS": "ACTIVE",
        //         "LAST_UPDATED_TS": 1740667326,
        //         "CREATED_ON": 1698066984,
        //         "UPDATED_ON": 1698067023
        //     },
        //     "CATEGORY_DATA": [
        //         {
        //             "TYPE": "122",
        //             "ID": 46,
        //             "NAME": "SOL",
        //             "CATEGORY": "SOL"
        //         },
        //         {
        //             "TYPE": "122",
        //             "ID": 205,
        //             "NAME": "TOKEN SALE",
        //             "CATEGORY": "TOKEN SALE"
        //         },
        //         {
        //             "TYPE": "122",
        //             "ID": 50,
        //             "NAME": "TRADING",
        //             "CATEGORY": "TRADING"
        //         },
        //         {
        //             "TYPE": "122",
        //             "ID": 37,
        //             "NAME": "MARKET",
        //             "CATEGORY": "MARKET"
        //         },
        //         {
        //             "TYPE": "122",
        //             "ID": 15,
        //             "NAME": "BUSINESS",
        //             "CATEGORY": "BUSINESS"
        //         }
        //     ]
        // }
        console.log(news);
        // Create a string of titles and bodies, concatenated with newline characters
        const newsString = news.map((item: any) => `${item.TITLE}: ${item.BODY}`).join("\n");
        setNews(newsString);
    };

    return (
        <div className="min-h-screen p-8">
            <main className="flex flex-col items-center gap-4">
                <button
                    onClick={handleClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Get Farcaster Posts and Summarize
                </button>
                <button
                    onClick={handleBalancesClick}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Get Balances
                </button>
                <button
                    onClick={handleNewsClick}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Get News
                </button>
                <button
                    onClick={handlePerplexityClick}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Get Perplexity
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Summary</h2>
                    <p className="text-white-700">{summary}</p>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Judgement</h2>
                        <p className="text-white-700">{judgement}</p>
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">News</h2>
                    <p className="text-white-700">{news}</p>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Perplexity</h2>
                    <p className="text-white-700">{perplexity}</p>
                </div>
            </main>
        </div>
    );
}

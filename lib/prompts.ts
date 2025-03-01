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

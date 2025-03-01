import { perplexityNewsPrompt, getFarcasterFilterPrompt, getCoindeskFilterPrompt } from "./prompts";

export async function getCoindeskArticles() {
    const response = await fetch("https://data-api.coindesk.com/news/v1/article/list?lang=EN&limit=10", {
        method: "GET",
    });
    const data = await response.json();
    return data.Data;
}

export async function getFarcasterCasts(fid: number) {
    const response = await fetch(`/api/farcasterposts?fid=${fid}`);
    const data = await response.json();
    return data;
}

export async function formatFarcasterCasts(casts: any[]) {
    return casts.map((cast: any) => `@${cast.author.username}: ${cast.text}`).join("\n");
}

export async function formatCoindeskArticles(articles: any[]) {
    return articles.map((article: any) => `${article.TITLE}: ${article.BODY}`).join("\n");
}

export async function getPerplexity(interests: string) {
    const messagePass = "I am interested in " + interests;
    const response = await fetch("/api/perplexity", {
        method: "POST",
        body: JSON.stringify({ message: messagePass, context: perplexityNewsPrompt, model: "sonar-pro" }),
    });
    const data = await response.json();
    return data.response;
}


export async function filterFarcasterCasts(casts: string, interests: string): Promise<string> {
    const context = getFarcasterFilterPrompt(interests)
    const message = casts;
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


export async function filterCoindeskArticles(articles: string, interests: string): Promise<string> {
    const context = getCoindeskFilterPrompt(interests)
    const message = articles;
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
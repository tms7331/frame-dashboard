import { perplexityNewsPrompt } from "./prompts";

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

export async function getPerplexity(interests: string) {
    const messagePass = "I am interested in " + interests;
    const response = await fetch("/api/perplexity", {
        method: "POST",
        body: JSON.stringify({ message: messagePass, context: perplexityNewsPrompt, model: "sonar-pro" }),
    });
    const data = await response.json();
    return data.response;
}


export async function filterFarcasterCasts(casts: any[], interests: string): Promise<string> {
    const message = casts.map((cast: any) => cast.text).join("\n");
    const context = `You are a helpful assistant that filters farcaster posts. The user is interested in ${interests}. 
    You need to filter the posts to only include the top three or four posts that are most relevant to the user's interests. 
    Return the filtered posts as a string, each post on a new line, with the post title and body concatenated.
    Here are the posts:
    ${message}`;
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


export async function filterCoindeskArticles(articles: any[], interests: string): Promise<string> {
    const message = articles.map((article: any) => `${article.TITLE}: ${article.BODY}`).join("\n");
    const context = `You are a helpful assistant that filters coindesk articles. The user is interested in ${interests}. 
    You need to filter the articles to only include the top three or four articles that are most relevant to the user's interests. 
    Return the filtered articles as a string, each article on a new line, with the article title and body concatenated.
    Here are the articles:
    ${message}`;
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
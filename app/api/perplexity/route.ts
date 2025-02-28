import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const { context, message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const API_KEY = process.env.PERPLEXITY_API_KEY;

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    {
                        role: "system",
                        content: context,
                    },
                    {
                        role: "user",
                        content: message,
                    },
                ],
            }),
        });

        const data = await response.json();

        return NextResponse.json({ response: data.choices[0].message.content });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

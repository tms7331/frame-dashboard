import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    if (!address) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }
    const headers = { "AccessKey": process.env.DEBANK_API_KEY || "" }

    const url = `https://pro-openapi.debank.com/v1/user/all_token_list?id=${address}`

    try {
        const r = await fetch(url, { headers })
        const data = await r.json()
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch trending posts" }, { status: 500 });
    }
} 
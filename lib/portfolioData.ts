import { DebankToken } from "./types";

export async function getPortfolio(address: string) {
    const response = await fetch(`/api/debank?address=${address}`);
    const data = await response.json();
    console.log("DATA", data)
    // {
    //     "errors": {
    //         "id": "Address when sending a str, it must be a hex string. Got: '0xc521...4636'"
    //     },
    //     "message": "Input payload validation failed"
    // }
    if (data.errors) {
        return [];
    }
    // Also filterer for "isVerified" flag being true
    const filteredBalances = data.filter((balance: any) => balance.price * balance.amount > 20 && balance.is_verified);
    return filteredBalances;
}

export function getPortfolioString(portfolio: DebankToken[] | null) {
    if (!portfolio) {
        return "I have no crypto holdings!"
    }
    return portfolio?.map(token => (
        `${token.chain} ${token.name} (${token.symbol}): ${token.amount} @ $${token.price}`
    )).join('\n')
}
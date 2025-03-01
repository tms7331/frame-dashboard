import { DebankToken } from "./types";

export async function getPortfolio(address: string) {
    const response = await fetch(`/api/debank?address=${address}`);
    const data = await response.json();
    const filteredBalances = data.filter((balance: any) => balance.price * balance.amount > 20);
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
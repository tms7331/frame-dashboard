import { Metadata } from 'next'

const appUrl = process.env.NEXT_PUBLIC_URL;

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PulseBoardAI Rich List',
        description: 'View the richest wallets for any token',
        openGraph: {
            title: 'PulseBoardAI Rich List',
            description: 'View the richest wallets for any token',
            images: [`${appUrl}/rich-list-preview.png`],
        },
        other: {
            'fc:frame': JSON.stringify({
                version: 'vNext',
                image: `${appUrl}/rich-list-preview.png`,
                buttons: [
                    {
                        label: 'Enter Token Address',
                        action: 'post'
                    }
                ],
                input: {
                    text: 'Enter token contract address',
                }
            }),
        },
    }
}

export default function RichPage() {
    return (
        <main>
            <h1>Hello! AI</h1>
            <p>Hello! Supercharge your Farcaster experience with Pulseboard AI</p>
        </main>
    )
}
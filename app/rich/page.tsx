import { Metadata } from 'next'

// Define your metadata
export const metadata: Metadata = {
    title: 'Pulseboard AI',
    description: 'Supercharge your Farcaster experience with Pulseboard AI',
    openGraph: {
        title: 'Pulseboard AI',
        description: 'Supercharge your Farcaster experience with Pulseboard AI',
        url: 'https://pulseboardai.framestop.xyz/rich',
        siteName: 'Pulseboard AI',
        images: [
            {
                url: 'https://pulseboardai.framestop.xyz/rich',
                width: 1200,
                height: 630,
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    other: {
        // Frame metadata
        'fc:frame': 'next',
        'fc:frame:image': 'https://pulseboardai.framestop.xyz/frame-image.png',
        'fc:frame:button:1': 'Start AI Chat',
        'fc:frame:post_url': 'https://pulseboardai.framestop.xyz/api/frame',
    },
}

// Add head tags directly
export default function Page() {
    return (
        <>
            <head>
                <meta property="fc:frame" content="next" />
                <meta property="fc:frame:image" content="https://pulseboardai.framestop.xyz/next.png" />
                <meta property="fc:frame:button:1" content="Start AI Chat" />
                <meta property="fc:frame:post_url" content="https://pulseboardai.framestop.xyz/api/frame" />
            </head>
            <main>
                <h1>Hello! AI</h1>
                <p>Hello! Supercharge your Farcaster experience with Pulseboard AI</p>
            </main>
        </>
    )
}
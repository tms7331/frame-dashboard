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
        'fc:frame:button:1:title': 'Start AI Chat',
        'fc:frame:button:1:action': 'launch_frame',
        'fc:frame:button:1:name': 'Pulseboard AI',
        'fc:frame:button:1:url': 'https://pulseboardai.framestop.xyz/chat',
        'fc:frame:button:1:splash_image': 'https://pulseboardai.framestop.xyz/splash.png',
        'fc:frame:button:1:splash_background': '#000000',
    },
}

export default function Page() {
    return (
        <main>
            <h1>Hello! AI</h1>
            <p>Hello! Supercharge your Farcaster experience with Pulseboard AI</p>
        </main>
    )
}
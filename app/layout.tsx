import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = "https://pulseboardai.framestop.xyz"

export const metadata: Metadata = {
  title: "PulseBoardAI",
  description: "Supercharge your crypto portfolio with PulseBoardAI",
  openGraph: {
    title: "PulseBoardAI",
    description: "Supercharge your crypto portfolio with PulseBoardAI",
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/pulseboardpage.png`,
      button: {
        title: "Launch PulseBoardAI",
        action: {
          type: "launch_frame",
          name: "PulseBoardAI Frame",
          url: appUrl,
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: "#f7f7f7",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
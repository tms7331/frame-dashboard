"use client"

import { useParams } from "next/navigation";

export default function DailyMemePage() {
    const params = useParams()
    const text = params.text as string

    const decodedText = decodeURIComponent(text);

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="max-w-2xl text-center text-xl">
                {decodedText}
            </div>
        </div>
    );
} 
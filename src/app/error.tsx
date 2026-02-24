"use client";

import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center px-6 bg-white">
            <div className="max-w-md text-center animate-fade-in">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                    ⚠️
                </div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                    Something went wrong
                </h2>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                    {error.message || "An unexpected error occurred. Please try again."}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="btn-primary px-6 py-2.5 text-sm"
                    >
                        Try again
                    </button>
                    <Link href="/" className="btn-secondary px-6 py-2.5 text-sm">
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}

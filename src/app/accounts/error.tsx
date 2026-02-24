"use client";

export default function AccountsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
            <div className="max-w-md text-center animate-fade-in">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                    ⚠️
                </div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                    Something went wrong
                </h2>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                    {error.message || "An unexpected error occurred while loading your accounts."}
                </p>
                <button
                    onClick={reset}
                    className="btn-primary mt-6 px-6 py-2.5 text-sm"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

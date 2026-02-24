"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await apiFetch<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.success) {
      setSent(true);
    } else {
      setError(res.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-stone-50">
      <div className="w-full max-w-sm animate-fade-in">
        <Link
          href="/login"
          className="text-sm font-semibold tracking-tight text-neutral-900 mb-12 inline-block"
        >
          Publish Everywhere
        </Link>

        {sent ? (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Check your console
            </h1>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              If an account exists for <strong className="text-neutral-700">{email}</strong>,
              a password reset link has been generated. Check your server console
              for the link.
            </p>
            <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
              In production, this would be sent via email. For now, look at the
              terminal running <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">npm run dev</code>.
            </p>
            <div className="mt-8">
              <Link href="/login" className="btn-primary w-full text-center">
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Reset password
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Enter your email and we&apos;ll generate a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner-white" />
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-neutral-900 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

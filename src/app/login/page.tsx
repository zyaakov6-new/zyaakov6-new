"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error ?? "Login failed.");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-neutral-950 px-16">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Your words.<br />
            <span className="text-neutral-500">Every platform.</span>
          </h2>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
            Publish to Medium, WordPress, and Substack from a single, beautiful dashboard.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">M</div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">W</div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">S</div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900 mb-12 inline-block">
            Publish Everywhere
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to your account to continue.
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

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-neutral-900 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

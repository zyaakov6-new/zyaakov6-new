"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passwordChecks.length) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error ?? "Signup failed.");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-neutral-950 px-16">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Start publishing<br />
            <span className="text-neutral-500">in seconds.</span>
          </h2>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
            Connect your accounts, write your content, and reach your audience on every platform.
          </p>
          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              <span className="text-sm text-neutral-400">One-click publishing to three platforms</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              <span className="text-sm text-neutral-400">Markdown support with full formatting</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              <span className="text-sm text-neutral-400">Track every publication in real-time</span>
            </div>
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Get started with multi-platform publishing.
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
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
            </div>

            {password.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 -mt-2">
                {[
                  { label: "8+ characters", met: passwordChecks.length },
                  { label: "Uppercase", met: passwordChecks.uppercase },
                  { label: "Number", met: passwordChecks.number },
                ].map((rule) => (
                  <span
                    key={rule.label}
                    className={`text-xs flex items-center gap-1 transition-colors ${rule.met ? "text-green-600" : "text-neutral-400"
                      }`}
                  >
                    {rule.met ? "✓" : "○"} {rule.label}
                  </span>
                ))}
              </div>
            )}

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Repeat password"
                autoComplete="new-password"
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-neutral-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div >
    </div >
  );
}

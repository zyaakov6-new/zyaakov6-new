"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await apiFetch<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error ?? "Something went wrong.");
    }
  }

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Invalid link
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          This reset link is missing a token. Please request a new one.
        </p>
        <div className="mt-8">
          <Link href="/forgot-password" className="btn-primary w-full text-center">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Password reset
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <div className="mt-8">
          <Link href="/login" className="btn-primary w-full text-center">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Set new password
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="password" className="label">
            New password
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
              Resetting...
            </span>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-stone-50">
      <div className="w-full max-w-sm animate-fade-in">
        <Link
          href="/login"
          className="text-sm font-semibold tracking-tight text-neutral-900 mb-12 inline-block"
        >
          Publish Everywhere
        </Link>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <div className="spinner h-6 w-6" />
            </div>
          }
        >
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}

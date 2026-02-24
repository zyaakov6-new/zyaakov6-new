"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import { apiFetch } from "@/lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    apiFetch("/api/auth/me").then((res) => {
      if (!res.success) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner h-6 w-6" />
          <p className="text-xs text-neutral-400">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

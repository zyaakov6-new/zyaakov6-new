"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/posts/new", label: "New Post" },
  { href: "/posts", label: "History" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/posts") return pathname === "/posts";
    return pathname === href || (pathname?.startsWith(href + "/") ?? false);
  }

  return (
    <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-neutral-900"
        >
          Publish Everywhere
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="rounded-full px-4 py-1.5 text-[13px] font-medium text-neutral-400 transition-all duration-200 hover:text-neutral-900 hover:bg-neutral-100"
        >
          Log out
        </button>
      </div>

      {/* Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto px-4 py-2 sm:hidden border-t border-neutral-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
              isActive(item.href)
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

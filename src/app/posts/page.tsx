"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProviderIcon from "@/components/ProviderIcon";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";

interface PostRecord {
  id: string;
  title: string;
  createdAt: string;
  publications: Array<{
    id: string;
    providerType: string;
    status: string;
    remoteUrl?: string;
  }>;
}

export default function PostsHistoryPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<PostRecord[]>("/api/posts").then((res) => {
      if (res.success && res.data) {
        setPosts(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="section-title">History</h1>
            <p className="section-subtitle">
              Every post you&apos;ve published.
            </p>
          </div>
          <Link href="/posts/new" className="btn-primary text-sm">
            New post
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner h-6 w-6" />
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-20 animate-fade-in-up">
            <p className="text-neutral-400 mb-4">No posts yet.</p>
            <Link href="/posts/new" className="btn-primary text-sm inline-flex">
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-2">
            {posts.map((post) => {
              const allSuccess = post.publications.every(
                (p) => p.status === "SUCCESS"
              );
              const anyFailed = post.publications.some(
                (p) => p.status === "FAILED"
              );

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-6 py-5 transition-all duration-200 hover:shadow-elevated hover:border-neutral-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900 group-hover:text-accent-700 transition-colors">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="ml-6 flex items-center gap-4">
                    <div className="flex -space-x-1">
                      {post.publications.map((pub) => (
                        <ProviderIcon
                          key={pub.id}
                          provider={pub.providerType}
                        />
                      ))}
                    </div>
                    <StatusBadge
                      status={
                        allSuccess
                          ? "SUCCESS"
                          : anyFailed
                          ? "FAILED"
                          : "PENDING"
                      }
                    />
                    <svg
                      className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

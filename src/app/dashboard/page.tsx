"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProviderIcon, { providerNames } from "@/components/ProviderIcon";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";

interface DashboardData {
  connectedAccounts: number;
  totalPosts: number;
  successfulPublications: number;
  recentPosts: Array<{
    id: string;
    title: string;
    createdAt: string;
    publications: Array<{
      providerType: string;
      status: string;
    }>;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardData>("/api/dashboard").then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your multi-platform publishing overview.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent-600" />
        </div>
      ) : data ? (
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="text-sm font-medium text-gray-500">Connected Accounts</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.connectedAccounts}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-500">Total Posts</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.totalPosts}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-500">
                Successful Publications
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {data.successfulPublications}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Link href="/accounts" className="btn-secondary">
              Connect Accounts
            </Link>
            <Link href="/posts/new" className="btn-primary">
              New Post
            </Link>
            <Link href="/posts" className="btn-secondary">
              View Posts History
            </Link>
          </div>

          {/* Recent posts */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Recent Posts
            </h2>
            {data.recentPosts.length === 0 ? (
              <p className="text-sm text-gray-500">
                No posts yet. Create your first post!
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50 -mx-3 px-3 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {post.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {post.publications.map((pub, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <ProviderIcon provider={pub.providerType} />
                          <StatusBadge
                            status={pub.status as "SUCCESS" | "FAILED"}
                          />
                        </div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">Failed to load dashboard.</p>
      )}
    </AppShell>
  );
}

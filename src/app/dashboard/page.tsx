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
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-10">
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            Your publishing command center.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner h-6 w-6" />
          </div>
        ) : data ? (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Connected",
                  value: data.connectedAccounts,
                  sublabel: "platforms",
                },
                {
                  label: "Published",
                  value: data.totalPosts,
                  sublabel: "posts",
                },
                {
                  label: "Successful",
                  value: data.successfulPublications,
                  sublabel: "deliveries",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="card group hover:shadow-elevated transition-all duration-300"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {stat.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-neutral-900">
                      {stat.value}
                    </span>
                    <span className="text-sm text-neutral-400">{stat.sublabel}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href="/posts/new" className="btn-primary">
                New post
              </Link>
              <Link href="/accounts" className="btn-secondary">
                Connect accounts
              </Link>
              <Link href="/posts" className="btn-secondary">
                View history
              </Link>
            </div>

            {/* Recent Posts */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-neutral-900">
                  Recent Posts
                </h2>
                {data.recentPosts.length > 0 && (
                  <Link
                    href="/posts"
                    className="text-xs font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    View all
                  </Link>
                )}
              </div>

              {data.recentPosts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-neutral-400 mb-4">
                    No posts yet. Start writing.
                  </p>
                  <Link href="/posts/new" className="btn-primary text-sm">
                    Create your first post
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.recentPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="group flex items-center justify-between rounded-xl px-4 py-3 -mx-4 transition-all duration-200 hover:bg-neutral-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900 group-hover:text-accent-700 transition-colors">
                          {post.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {post.publications.map((pub, i) => (
                            <ProviderIcon
                              key={i}
                              provider={pub.providerType}
                            />
                          ))}
                        </div>
                        {post.publications.length > 0 && (
                          <StatusBadge
                            status={
                              post.publications.every((p) => p.status === "SUCCESS")
                                ? "SUCCESS"
                                : post.publications.some((p) => p.status === "FAILED")
                                ? "FAILED"
                                : "PENDING"
                            }
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-neutral-400">Unable to load dashboard.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

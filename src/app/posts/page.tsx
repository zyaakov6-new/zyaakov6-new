"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProviderIcon, { providerNames } from "@/components/ProviderIcon";
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts History</h1>
          <p className="mt-1 text-sm text-gray-500">
            All posts published from this dashboard.
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary">
          New Post
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No posts yet.</p>
          <Link href="/posts/new" className="mt-4 btn-primary inline-flex">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Platforms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => {
                const allSuccess = post.publications.every(
                  (p) => p.status === "SUCCESS"
                );
                const anyFailed = post.publications.some(
                  (p) => p.status === "FAILED"
                );

                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-accent-600"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        {post.publications.map((pub) => (
                          <ProviderIcon
                            key={pub.id}
                            provider={pub.providerType}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={
                          allSuccess
                            ? "SUCCESS"
                            : anyFailed
                            ? "FAILED"
                            : "PENDING"
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

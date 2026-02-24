"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProviderIcon, { providerNames } from "@/components/ProviderIcon";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";

interface PostDetail {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  tags: string[];
  canonicalUrl?: string;
  createdAt: string;
  publications: Array<{
    id: string;
    providerType: string;
    remoteId?: string;
    remoteUrl?: string;
    status: string;
    errorMessage?: string;
    createdAt: string;
  }>;
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<PostDetail>(`/api/posts/${id}`).then((res) => {
      if (res.success && res.data) {
        setPost(res.data);
      } else {
        setError(res.error ?? "Failed to load post.");
      }
      setLoading(false);
    });
  }, [id]);

  return (
    <AppShell>
      {/* Back link */}
      <Link
        href="/posts"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to history
      </Link>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent-600" />
        </div>
      ) : error ? (
        <div className="card">
          <p className="text-red-600">{error}</p>
        </div>
      ) : post ? (
        <div className="space-y-6">
          {/* Post header */}
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            {post.subtitle && (
              <p className="mt-1 text-lg text-gray-500">{post.subtitle}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>
                Created {new Date(post.createdAt).toLocaleDateString()}
              </span>
              {post.tags.length > 0 && (
                <div className="flex gap-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {post.canonicalUrl && (
                <a
                  href={post.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-600 hover:underline"
                >
                  Canonical URL
                </a>
              )}
            </div>
          </div>

          {/* Publication results */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Publication Results
            </h2>
            <div className="space-y-3">
              {post.publications.map((pub) => (
                <div
                  key={pub.id}
                  className="rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ProviderIcon provider={pub.providerType} size="md" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {providerNames[pub.providerType]}
                        </p>
                        {pub.remoteUrl && (
                          <a
                            href={pub.remoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent-600 hover:underline"
                          >
                            {pub.remoteUrl}
                          </a>
                        )}
                        {pub.remoteId && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Remote ID: {pub.remoteId}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={pub.status as "SUCCESS" | "FAILED"} />
                  </div>
                  {pub.errorMessage && (
                    <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {pub.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Post content preview */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Content Preview
            </h2>
            <div className="rounded-lg bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {post.content}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

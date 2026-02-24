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
      <div className="animate-fade-in">
        {/* Back */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          History
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner h-6 w-6" />
          </div>
        ) : error ? (
          <div className="card py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : post ? (
          <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="card">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                {post.title}
              </h1>
              {post.subtitle && (
                <p className="mt-2 text-lg text-neutral-400">{post.subtitle}</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-xs text-neutral-400">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {post.tags.length > 0 && (
                  <>
                    <span className="text-neutral-200">|</span>
                    <div className="flex gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-medium text-neutral-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {post.canonicalUrl && (
                  <>
                    <span className="text-neutral-200">|</span>
                    <a
                      href={post.canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-600 hover:underline"
                    >
                      Canonical URL
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Publications */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-5">
                Deliveries
              </h2>
              <div className="space-y-3">
                {post.publications.map((pub) => (
                  <div
                    key={pub.id}
                    className="flex items-center justify-between rounded-2xl border border-neutral-100 p-5 transition-all duration-200 hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-4">
                      <ProviderIcon provider={pub.providerType} size="lg" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {providerNames[pub.providerType]}
                        </p>
                        {pub.remoteUrl && (
                          <a
                            href={pub.remoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent-600 hover:underline"
                          >
                            View published post
                          </a>
                        )}
                        {!pub.remoteUrl && pub.remoteId && (
                          <p className="text-xs text-neutral-400">
                            ID: {pub.remoteId}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={pub.status as "SUCCESS" | "FAILED"} />
                  </div>
                ))}
                {post.publications.some((p) => p.errorMessage) && (
                  <div className="mt-2 space-y-2">
                    {post.publications
                      .filter((p) => p.errorMessage)
                      .map((pub) => (
                        <div
                          key={pub.id}
                          className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-700"
                        >
                          <span className="font-medium">
                            {providerNames[pub.providerType]}:
                          </span>{" "}
                          {pub.errorMessage}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-5">
                Content
              </h2>
              <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-6">
                <pre className="whitespace-pre-wrap text-sm text-neutral-700 font-mono leading-relaxed">
                  {post.content}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

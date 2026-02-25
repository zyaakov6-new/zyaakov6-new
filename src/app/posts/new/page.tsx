"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProviderIcon, { providerNames } from "@/components/ProviderIcon";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";

type ProviderType = "MEDIUM" | "WORDPRESS";

const ALL_PROVIDERS: ProviderType[] = ["MEDIUM", "WORDPRESS"];

interface PublicationResult {
  providerType: string;
  status: string;
  remoteId?: string;
  remoteUrl?: string;
  errorMessage?: string;
}

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [publishStatus, setPublishStatus] = useState<"draft" | "public">(
    "draft"
  );
  const [selectedProviders, setSelectedProviders] = useState<Set<ProviderType>>(
    new Set()
  );
  const [connectedProviders, setConnectedProviders] = useState<
    Set<ProviderType>
  >(new Set());

  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PublicationResult[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Array<{ providerType: ProviderType }>>("/api/credentials").then(
      (res) => {
        if (res.success && res.data) {
          const connected = new Set(res.data.map((c) => c.providerType));
          setConnectedProviders(connected);
          setSelectedProviders(new Set(connected));
        }
      }
    );
  }, []);

  function toggleProvider(p: ProviderType) {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  async function handlePublish() {
    setError("");
    setResults(null);

    if (!title.trim() || !bodyMarkdown.trim()) {
      setError("Title and body are required.");
      return;
    }

    if (selectedProviders.size === 0) {
      setError("Select at least one platform to publish to.");
      return;
    }

    setPublishing(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await apiFetch<{
      post: { id: string };
      publications: PublicationResult[];
    }>("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        title,
        subtitle: subtitle || undefined,
        bodyMarkdown,
        tags: tags.length > 0 ? tags : undefined,
        canonicalUrl: canonicalUrl || undefined,
        publishStatus,
        providers: Array.from(selectedProviders),
      }),
    });

    setPublishing(false);

    if (res.success && res.data) {
      setResults(res.data.publications);
    } else {
      setError(res.error ?? "Publishing failed.");
    }
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="mb-10">
          <h1 className="section-title">New Post</h1>
          <p className="section-subtitle">
            Write once, publish everywhere.
          </p>
        </div>

        {results ? (
          <div className="card animate-scale-in">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">
              Results
            </h2>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-neutral-100 p-5 transition-all duration-200 hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-4">
                    <ProviderIcon provider={r.providerType} size="lg" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {providerNames[r.providerType]}
                      </p>
                      {r.remoteUrl && (
                        <a
                          href={r.remoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-600 hover:underline"
                        >
                          View published post
                        </a>
                      )}
                      {r.errorMessage && (
                        <p className="mt-1 text-xs text-red-500">
                          {r.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={r.status as "SUCCESS" | "FAILED"} />
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setResults(null);
                  setTitle("");
                  setSubtitle("");
                  setBodyMarkdown("");
                  setTagsInput("");
                  setCanonicalUrl("");
                }}
                className="btn-secondary text-sm"
              >
                Write another
              </button>
              <button
                onClick={() => router.push("/posts")}
                className="btn-primary text-sm"
              >
                View all posts
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Content */}
            <div className="card">
              <div className="space-y-5">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input text-base font-medium"
                    placeholder="Your post title"
                  />
                </div>
                <div>
                  <label className="label">
                    Subtitle
                    <span className="font-normal text-neutral-300 ml-1">
                      optional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="input"
                    placeholder="A brief subtitle"
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="card">
              <label className="label">Content</label>
              <textarea
                value={bodyMarkdown}
                onChange={(e) => setBodyMarkdown(e.target.value)}
                rows={18}
                className="input font-mono text-sm leading-relaxed resize-y"
                placeholder="Write in Markdown..."
              />
            </div>

            {/* Metadata */}
            <div className="card">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="label">
                    Tags
                    <span className="font-normal text-neutral-300 ml-1">
                      comma-separated
                    </span>
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="input"
                    placeholder="react, javascript, web-dev"
                  />
                </div>
                <div>
                  <label className="label">
                    Canonical URL
                    <span className="font-normal text-neutral-300 ml-1">
                      optional
                    </span>
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="input"
                    placeholder="https://yourblog.com/post"
                  />
                </div>
              </div>
            </div>

            {/* Publish Options */}
            <div className="card">
              <h3 className="text-base font-semibold text-neutral-900 mb-6">
                Publishing
              </h3>

              {/* Status toggle */}
              <div className="mb-6">
                <p className="label">Visibility</p>
                <div className="inline-flex rounded-full border border-neutral-200 p-1">
                  <button
                    type="button"
                    onClick={() => setPublishStatus("draft")}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                      publishStatus === "draft"
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishStatus("public")}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                      publishStatus === "public"
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Public
                  </button>
                </div>
              </div>

              {/* Platforms */}
              <div>
                <p className="label">Platforms</p>
                <div className="space-y-2">
                  {ALL_PROVIDERS.map((p) => {
                    const connected = connectedProviders.has(p);
                    const selected = selectedProviders.has(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => connected && toggleProvider(p)}
                        disabled={!connected}
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                          selected
                            ? "border-neutral-900 bg-neutral-50"
                            : "border-neutral-100 bg-white hover:border-neutral-200"
                        } ${!connected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <ProviderIcon provider={p} size="md" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-neutral-900">
                            {providerNames[p]}
                          </span>
                          {!connected && (
                            <span className="block text-xs text-neutral-400 mt-0.5">
                              Not connected -{" "}
                              <Link
                                href="/accounts"
                                className="text-accent-600 hover:underline"
                              >
                                set up
                              </Link>
                            </span>
                          )}
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            selected
                              ? "border-neutral-900 bg-neutral-900"
                              : "border-neutral-300"
                          }`}
                        >
                          {selected && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 border border-red-100">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="btn-primary px-10"
              >
                {publishing ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner-white" />
                    Publishing...
                  </span>
                ) : (
                  "Publish"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProviderIcon, { providerNames } from "@/components/ProviderIcon";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";

type ProviderType = "MEDIUM" | "WORDPRESS" | "SUBSTACK";

const ALL_PROVIDERS: ProviderType[] = ["MEDIUM", "WORDPRESS", "SUBSTACK"];

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
  const [publishStatus, setPublishStatus] = useState<"draft" | "public">("draft");
  const [selectedProviders, setSelectedProviders] = useState<Set<ProviderType>>(
    new Set()
  );
  const [connectedProviders, setConnectedProviders] = useState<Set<ProviderType>>(
    new Set()
  );

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
      if (next.has(p)) {
        next.delete(p);
      } else {
        next.add(p);
      }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Write your content and publish to multiple platforms at once.
        </p>
      </div>

      {results ? (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Publishing Results
          </h2>
          <div className="space-y-3">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <ProviderIcon provider={r.providerType} size="md" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {providerNames[r.providerType]}
                    </p>
                    {r.remoteUrl && (
                      <a
                        href={r.remoteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-600 hover:underline"
                      >
                        View post &rarr;
                      </a>
                    )}
                    {r.errorMessage && (
                      <p className="mt-1 text-sm text-red-600">
                        {r.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={r.status as "SUCCESS" | "FAILED"} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setResults(null);
                setTitle("");
                setSubtitle("");
                setBodyMarkdown("");
                setTagsInput("");
                setCanonicalUrl("");
              }}
              className="btn-secondary"
            >
              New Post
            </button>
            <button
              onClick={() => router.push("/posts")}
              className="btn-primary"
            >
              View All Posts
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Title and subtitle */}
          <div className="card">
            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Your post title"
                />
              </div>
              <div>
                <label className="label">
                  Subtitle{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
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
            <label className="label">Body (Markdown)</label>
            <textarea
              value={bodyMarkdown}
              onChange={(e) => setBodyMarkdown(e.target.value)}
              rows={16}
              className="input font-mono text-sm"
              placeholder="Write your post content in Markdown..."
            />
          </div>

          {/* Tags and canonical URL */}
          <div className="card">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  Tags{" "}
                  <span className="font-normal text-gray-400">
                    (comma-separated)
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
                  Canonical URL{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="input"
                  placeholder="https://yourblog.com/original-post"
                />
              </div>
            </div>
          </div>

          {/* Publish options */}
          <div className="card">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Publishing Options
            </h3>

            {/* Publish status */}
            <div className="mb-6">
              <p className="label">Publish as</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={publishStatus === "draft"}
                    onChange={() => setPublishStatus("draft")}
                    className="h-4 w-4 text-accent-600 focus:ring-accent-500"
                  />
                  <span className="text-sm text-gray-700">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={publishStatus === "public"}
                    onChange={() => setPublishStatus("public")}
                    className="h-4 w-4 text-accent-600 focus:ring-accent-500"
                  />
                  <span className="text-sm text-gray-700">Public</span>
                </label>
              </div>
            </div>

            {/* Provider checkboxes */}
            <div>
              <p className="label">Publish to</p>
              <div className="space-y-2">
                {ALL_PROVIDERS.map((p) => {
                  const connected = connectedProviders.has(p);
                  return (
                    <label
                      key={p}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        selectedProviders.has(p)
                          ? "border-accent-300 bg-accent-50"
                          : "border-gray-200 bg-white"
                      } ${!connected ? "opacity-50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProviders.has(p)}
                        onChange={() => toggleProvider(p)}
                        disabled={!connected}
                        className="h-4 w-4 rounded text-accent-600 focus:ring-accent-500"
                      />
                      <ProviderIcon provider={p} />
                      <span className="text-sm font-medium text-gray-900">
                        {providerNames[p]}
                      </span>
                      {!connected && (
                        <span className="text-xs text-gray-400">
                          (not connected)
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary px-8"
            >
              {publishing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Publishing...
                </span>
              ) : (
                "Publish"
              )}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

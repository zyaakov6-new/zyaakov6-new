"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

type ProviderType = "MEDIUM" | "WORDPRESS" | "SUBSTACK";

interface CredentialRecord {
  id: string;
  providerType: ProviderType;
  createdAt: string;
  updatedAt: string;
}

interface ProviderCardProps {
  provider: ProviderType;
  title: string;
  description: string;
  connected: boolean;
  onSave: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

function ProviderCard({
  provider,
  title,
  description,
  connected,
  onSave,
  onDelete,
  children,
}: ProviderCardProps) {
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    error?: string;
    [key: string]: unknown;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="card">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        </div>
        {connected && (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Connected
          </span>
        )}
      </div>

      <div className="space-y-3">{children}</div>

      {testResult && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            testResult.valid
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {testResult.valid
            ? "Connection successful!"
            : `Connection failed: ${testResult.error}`}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary text-sm"
        >
          {saving ? "Saving..." : connected ? "Update" : "Save"}
        </button>
        {connected && (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="btn-danger text-sm"
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Medium
  const [mediumToken, setMediumToken] = useState("");
  const [mediumStatus, setMediumStatus] = useState<string | null>(null);

  // WordPress
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpPassword, setWpPassword] = useState("");
  const [wpStatus, setWpStatus] = useState<string | null>(null);

  // Substack
  const [substackUrl, setSubstackUrl] = useState("");
  const [substackToken, setSubstackToken] = useState("");
  const [substackStatus, setSubstackStatus] = useState<string | null>(null);

  const loadCredentials = useCallback(async () => {
    const res = await apiFetch<CredentialRecord[]>("/api/credentials");
    if (res.success && res.data) {
      setCredentials(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  function isConnected(provider: ProviderType) {
    return credentials.some((c) => c.providerType === provider);
  }

  async function testConnection(provider: ProviderType, config: unknown) {
    const res = await apiFetch<{ valid: boolean; error?: string }>(
      "/api/credentials/test",
      {
        method: "POST",
        body: JSON.stringify({ providerType: provider, config }),
      }
    );
    return res;
  }

  async function saveCredential(provider: ProviderType, config: unknown) {
    const res = await apiFetch("/api/credentials", {
      method: "PUT",
      body: JSON.stringify({ providerType: provider, config }),
    });
    if (res.success) {
      await loadCredentials();
    }
    return res;
  }

  async function deleteCredential(provider: ProviderType) {
    const res = await apiFetch(
      `/api/credentials?providerType=${provider}`,
      { method: "DELETE" }
    );
    if (res.success) {
      await loadCredentials();
    }
    return res;
  }

  // Handlers
  async function handleMediumSave() {
    if (!mediumToken.trim()) {
      setMediumStatus("error:Please enter your Medium token.");
      return;
    }
    const config = { token: mediumToken };
    setMediumStatus("testing");
    const test = await testConnection("MEDIUM", config);
    if (!test.success) {
      setMediumStatus(`error:${test.error ?? "Connection test failed."}`);
      return;
    }
    setMediumStatus("saving");
    const save = await saveCredential("MEDIUM", config);
    if (save.success) {
      setMediumStatus("success:Medium connected successfully!");
      setMediumToken("");
    } else {
      setMediumStatus(`error:${save.error ?? "Failed to save."}`);
    }
  }

  async function handleWordpressSave() {
    if (!wpSiteUrl.trim() || !wpUsername.trim() || !wpPassword.trim()) {
      setWpStatus("error:Please fill in all WordPress fields.");
      return;
    }
    const config = {
      siteUrl: wpSiteUrl,
      username: wpUsername,
      applicationPassword: wpPassword,
    };
    setWpStatus("testing");
    const test = await testConnection("WORDPRESS", config);
    if (!test.success) {
      setWpStatus(`error:${test.error ?? "Connection test failed."}`);
      return;
    }
    setWpStatus("saving");
    const save = await saveCredential("WORDPRESS", config);
    if (save.success) {
      setWpStatus("success:WordPress connected successfully!");
      setWpSiteUrl("");
      setWpUsername("");
      setWpPassword("");
    } else {
      setWpStatus(`error:${save.error ?? "Failed to save."}`);
    }
  }

  async function handleSubstackSave() {
    if (!substackUrl.trim() || !substackToken.trim()) {
      setSubstackStatus("error:Please fill in all Substack fields.");
      return;
    }
    const config = {
      publicationUrl: substackUrl,
      authToken: substackToken,
    };
    setSubstackStatus("saving");
    const save = await saveCredential("SUBSTACK", config);
    if (save.success) {
      setSubstackStatus("success:Substack credentials saved!");
      setSubstackUrl("");
      setSubstackToken("");
    } else {
      setSubstackStatus(`error:${save.error ?? "Failed to save."}`);
    }
  }

  function renderStatus(status: string | null) {
    if (!status) return null;
    if (status === "testing" || status === "saving") {
      return (
        <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {status === "testing" ? "Testing connection..." : "Saving..."}
        </p>
      );
    }
    const [type, ...rest] = status.split(":");
    const message = rest.join(":");
    return (
      <p
        className={`mt-3 rounded-lg px-3 py-2 text-sm ${
          type === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {message}
      </p>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Connect Accounts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add your platform credentials to enable cross-posting.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Medium */}
          <div className="card">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Medium</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  Connect with your Medium integration token.
                </p>
              </div>
              {isConnected("MEDIUM") && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Connected
                </span>
              )}
            </div>
            <div>
              <label className="label">Integration Token</label>
              <input
                type="password"
                value={mediumToken}
                onChange={(e) => setMediumToken(e.target.value)}
                className="input"
                placeholder="Your Medium integration token"
              />
              <p className="mt-1 text-xs text-gray-400">
                Get your token from Medium Settings &rarr; Integration tokens.
              </p>
            </div>
            {renderStatus(mediumStatus)}
            <div className="mt-4 flex gap-2">
              <button onClick={handleMediumSave} className="btn-primary text-sm">
                {isConnected("MEDIUM") ? "Update" : "Save & Test"}
              </button>
              {isConnected("MEDIUM") && (
                <button
                  onClick={() => deleteCredential("MEDIUM").then(loadCredentials)}
                  className="btn-danger text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* WordPress */}
          <div className="card">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">WordPress</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  Connect with your WordPress site URL and Application Password.
                </p>
              </div>
              {isConnected("WORDPRESS") && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Connected
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Site URL</label>
                <input
                  type="url"
                  value={wpSiteUrl}
                  onChange={(e) => setWpSiteUrl(e.target.value)}
                  className="input"
                  placeholder="https://yoursite.com"
                />
              </div>
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  value={wpUsername}
                  onChange={(e) => setWpUsername(e.target.value)}
                  className="input"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="label">Application Password</label>
                <input
                  type="password"
                  value={wpPassword}
                  onChange={(e) => setWpPassword(e.target.value)}
                  className="input"
                  placeholder="xxxx xxxx xxxx xxxx"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Generate at WP Admin &rarr; Users &rarr; Your Profile &rarr; Application Passwords.
                </p>
              </div>
            </div>
            {renderStatus(wpStatus)}
            <div className="mt-4 flex gap-2">
              <button onClick={handleWordpressSave} className="btn-primary text-sm">
                {isConnected("WORDPRESS") ? "Update" : "Save & Test"}
              </button>
              {isConnected("WORDPRESS") && (
                <button
                  onClick={() => deleteCredential("WORDPRESS").then(loadCredentials)}
                  className="btn-danger text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Substack */}
          <div className="card">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Substack</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  Connect with your Substack publication URL and session cookie.
                </p>
              </div>
              {isConnected("SUBSTACK") && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Connected
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Publication URL</label>
                <input
                  type="url"
                  value={substackUrl}
                  onChange={(e) => setSubstackUrl(e.target.value)}
                  className="input"
                  placeholder="https://yourpub.substack.com"
                />
              </div>
              <div>
                <label className="label">Session Token (substack.sid cookie)</label>
                <input
                  type="password"
                  value={substackToken}
                  onChange={(e) => setSubstackToken(e.target.value)}
                  className="input"
                  placeholder="Your substack.sid cookie value"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Extract from your browser&apos;s DevTools &rarr; Application &rarr; Cookies after logging in to Substack.
                </p>
              </div>
            </div>
            {renderStatus(substackStatus)}
            <div className="mt-4 flex gap-2">
              <button onClick={handleSubstackSave} className="btn-primary text-sm">
                {isConnected("SUBSTACK") ? "Update" : "Save"}
              </button>
              {isConnected("SUBSTACK") && (
                <button
                  onClick={() => deleteCredential("SUBSTACK").then(loadCredentials)}
                  className="btn-danger text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

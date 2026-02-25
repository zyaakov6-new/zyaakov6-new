"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import ProviderIcon from "@/components/ProviderIcon";
import { apiFetch } from "@/lib/api";

type ProviderType = "MEDIUM" | "WORDPRESS";

interface CredentialRecord {
  id: string;
  providerType: ProviderType;
  createdAt: string;
  updatedAt: string;
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
    return apiFetch<{ valid: boolean; error?: string }>(
      "/api/credentials/test",
      {
        method: "POST",
        body: JSON.stringify({ providerType: provider, config }),
      }
    );
  }

  async function saveCredential(provider: ProviderType, config: unknown) {
    const res = await apiFetch("/api/credentials", {
      method: "PUT",
      body: JSON.stringify({ providerType: provider, config }),
    });
    if (res.success) await loadCredentials();
    return res;
  }

  async function deleteCredential(provider: ProviderType) {
    const res = await apiFetch(`/api/credentials?providerType=${provider}`, {
      method: "DELETE",
    });
    if (res.success) await loadCredentials();
    return res;
  }

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

  function renderStatus(status: string | null) {
    if (!status) return null;
    if (status === "testing" || status === "saving") {
      return (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600 border border-neutral-100">
          <span className="spinner h-3.5 w-3.5" />
          {status === "testing" ? "Testing connection..." : "Saving..."}
        </div>
      );
    }
    const [type, ...rest] = status.split(":");
    const message = rest.join(":");
    return (
      <div
        className={`mt-4 rounded-xl px-4 py-3 text-sm border ${
          type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-red-50 text-red-700 border-red-100"
        }`}
      >
        {message}
      </div>
    );
  }

  function ConnectedBadge() {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Connected
      </span>
    );
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="mb-10">
          <h1 className="section-title">Accounts</h1>
          <p className="section-subtitle">
            Connect your platforms to start publishing.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner h-6 w-6" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Medium */}
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ProviderIcon provider="MEDIUM" size="lg" />
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      Medium
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Integration token
                    </p>
                  </div>
                </div>
                {isConnected("MEDIUM") && <ConnectedBadge />}
              </div>

              <div>
                <label className="label">Token</label>
                <input
                  type="password"
                  value={mediumToken}
                  onChange={(e) => setMediumToken(e.target.value)}
                  className="input"
                  placeholder="Your Medium integration token"
                />
                <p className="mt-2 text-xs text-neutral-400">
                  Medium Settings &rarr; Security and apps &rarr; Integration tokens
                </p>
              </div>

              {renderStatus(mediumStatus)}

              <div className="mt-5 flex gap-3">
                <button onClick={handleMediumSave} className="btn-primary text-sm py-2.5">
                  {isConnected("MEDIUM") ? "Update" : "Connect"}
                </button>
                {isConnected("MEDIUM") && (
                  <button
                    onClick={() => deleteCredential("MEDIUM")}
                    className="btn-ghost text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* WordPress */}
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ProviderIcon provider="WORDPRESS" size="lg" />
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      WordPress
                    </h3>
                    <p className="text-sm text-neutral-400">
                      REST API credentials
                    </p>
                  </div>
                </div>
                {isConnected("WORDPRESS") && <ConnectedBadge />}
              </div>

              <div className="space-y-4">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  </div>
                </div>
                <p className="text-xs text-neutral-400">
                  WP Admin &rarr; Users &rarr; Profile &rarr; Application Passwords
                </p>
              </div>

              {renderStatus(wpStatus)}

              <div className="mt-5 flex gap-3">
                <button onClick={handleWordpressSave} className="btn-primary text-sm py-2.5">
                  {isConnected("WORDPRESS") ? "Update" : "Connect"}
                </button>
                {isConnected("WORDPRESS") && (
                  <button
                    onClick={() => deleteCredential("WORDPRESS")}
                    className="btn-ghost text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

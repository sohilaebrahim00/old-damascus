"use client";

import { useState } from "react";
import { integrations } from "@/config/integrations";
import { RefreshCw, ShieldAlert, CheckCircle, Database } from "lucide-react";

export default function CloverAdminPage() {
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncReport, setSyncReport] = useState<Record<string, unknown> | null>(null);
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/clover/sync-menu", { method: "GET" });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, error: "Connection request failed." });
    } finally {
      setTesting(false);
    }
  };

  const runSync = async () => {
    setSyncing(true);
    setSyncReport(null);
    try {
      const res = await fetch("/api/admin/clover/sync-menu", { method: "POST" });
      const data = await res.json();
      setSyncReport(data);
    } catch {
      setSyncReport({ success: false, error: "Synchronization request failed." });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-site max-w-4xl space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-olive-dark">
            Clover Integration Hub
          </h1>
          <p className="text-olive text-sm mt-1">
            Manage your Clover Merchant connection, trigger menu syncs, and verify configuration status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status card */}
          <div className="card p-6 bg-white space-y-4 md:col-span-2">
            <h2 className="font-heading text-xl font-semibold text-olive-dark flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-dark" /> Connection Status
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-cream p-3 rounded-xl">
                <span className="text-xs text-olive block mb-1">Clover Enabled</span>
                <span className="font-semibold text-olive-dark flex items-center gap-1.5">
                  {integrations.cloverEnabled ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Not Configured
                    </>
                  )}
                </span>
              </div>
              <div className="bg-cream p-3 rounded-xl">
                <span className="text-xs text-olive block mb-1">Direct Checkout</span>
                <span className="font-semibold text-olive-dark flex items-center gap-1.5">
                  {integrations.directOrderingEnabled ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ready
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Inactive
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="divider" />

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-olive-dark">Actions</h3>
              <div className="flex gap-3">
                <button
                  onClick={testConnection}
                  disabled={testing}
                  className="btn-outline btn-sm"
                >
                  {testing ? "Testing..." : "Test Connection"}
                </button>
                <button
                  onClick={runSync}
                  disabled={syncing}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="card p-6 bg-white space-y-4">
            <h2 className="font-heading text-lg font-semibold text-olive-dark flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-dark" /> Guidelines
            </h2>
            <p className="text-xs text-olive leading-relaxed">
              Clover variables must be populated in <code className="bg-cream px-1 py-0.5 rounded text-red-600 font-mono">.env.local</code> on the server. Do not commit keys to GitHub.
            </p>
            <p className="text-xs text-olive leading-relaxed">
              After filling variables, run &quot;Sync Now&quot; to download menu categories, modifiers, and products directly to Supabase.
            </p>
          </div>
        </div>

        {/* Results Panels */}
        {testResult && (
          <div className="card p-5 bg-white space-y-3 border-brand/20">
            <h3 className="font-semibold text-sm text-olive-dark flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-dark" /> Connection Test Result
            </h3>
            <pre className="bg-cream p-4 rounded-xl text-xs overflow-x-auto max-h-48 font-mono">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {syncReport && (
          <div className="card p-5 bg-white space-y-3 border-brand/20">
            <h3 className="font-semibold text-sm text-olive-dark flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-dark" /> Sync Report
            </h3>
            <pre className="bg-cream p-4 rounded-xl text-xs overflow-x-auto max-h-48 font-mono">
              {JSON.stringify(syncReport, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

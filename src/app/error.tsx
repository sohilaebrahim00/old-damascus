"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md space-y-5">
        <AlertCircle className="w-16 h-16 text-error mx-auto" />
        <h1 className="font-heading text-3xl font-bold text-olive-dark">
          Something Went Wrong
        </h1>
        <p className="text-sm text-olive">
          We encountered an unexpected error. Please try refreshing the page. If
          the problem persists, contact us directly.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <a href="/" className="btn-outline">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

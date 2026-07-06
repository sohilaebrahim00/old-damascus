"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(
      "Direct user accounts require Supabase connection. Checkout is available as guest."
    );
  };

  return (
    <div className="min-h-screen bg-cream py-16 flex items-center justify-center">
      <div className="card w-full max-w-md p-6 sm:p-8 bg-white space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-olive hover:text-brand-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-olive-dark">
            Welcome Back
          </h1>
          <p className="text-sm text-olive mt-1">
            Log in to manage your saved addresses and order history.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-brand-gold/30 text-amber-800 rounded-xl text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center">
            Log In
          </button>
        </form>

        <div className="text-center text-xs text-olive">
          Don&apos;t have an account?{" "}
          <Link href="/create-account" className="font-semibold text-brand-dark hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

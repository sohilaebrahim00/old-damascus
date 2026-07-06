import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md space-y-5">
        <AlertCircle className="w-16 h-16 text-brand-dark mx-auto" />
        <h1 className="font-heading text-3xl font-bold text-olive-dark">
          Page Not Found
        </h1>
        <p className="text-sm text-olive">
          We couldn&apos;t find the page you&apos;re looking for. Check the URL or go back home to browse our Mediterranean menu.
        </p>
        <Link href="/" className="btn-primary inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

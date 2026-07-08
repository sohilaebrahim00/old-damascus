"use client";

import { Share2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/Toaster";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          fallbackCopy();
        }
      }
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast("The link has been copied to your clipboard.", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleShare}
      className="btn-outline btn-sm focus-visible:ring-2 focus-visible:ring-brand-gold outline-none"
      aria-label="Share this dish"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </>
      )}
    </button>
  );
}

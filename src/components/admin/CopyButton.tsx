"use client";

import { Copy } from "lucide-react";

export function CopyButton({ code }: { code: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Copied: ' + code);
  };

  return (
    <button 
      className="text-brand-gold hover:text-brand-dark transition-colors p-1" 
      title="Copy ID"
      onClick={handleCopy}
    >
      <Copy className="w-4 h-4" />
    </button>
  );
}

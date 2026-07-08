"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface Faq {
  q: string;
  a: string;
}

export function PackagesFaqClient({ faqs }: { faqs: Faq[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="card bg-white overflow-hidden">
          <button
            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            className="w-full flex items-center justify-between p-5 text-left font-semibold text-olive-dark hover:bg-cream/40 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-brand-dark flex-shrink-0" />
              {faq.q}
            </span>
            <span className="text-xl font-light text-olive">{openFaq === idx ? "−" : "+"}</span>
          </button>
          {openFaq === idx && (
            <div className="px-5 pb-5 pt-1 text-sm text-olive leading-relaxed border-t border-border/40">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

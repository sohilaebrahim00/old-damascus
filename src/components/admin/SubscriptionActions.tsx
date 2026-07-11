"use client";

import { Copy, QrCode, Eye } from "lucide-react";
import Link from "next/link";
import { Subscription } from "@/lib/supabase/types";
import { useState } from "react";
import { SubscriptionDetailsModal } from "./SubscriptionDetailsModal";

export function SubscriptionActions({ sub }: { sub: Subscription }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(sub.subscription_code);
    alert('Copied: ' + sub.subscription_code);
  };

  const confirmAction = (e: React.MouseEvent<HTMLButtonElement>, message: string) => {
    if (!confirm(message)) {
      e.preventDefault();
    }
  };

  return (
    <>
    <div className="flex items-center justify-end gap-2 flex-wrap max-w-[250px]">
      <button 
        className="text-brand-gold hover:text-brand-dark transition-colors p-1" 
        title="View Details"
        onClick={() => setIsModalOpen(true)}
      >
        <Eye className="w-4 h-4" />
      </button>

      <button 
        className="text-brand-gold hover:text-brand-dark transition-colors p-1" 
        title="Copy ID"
        onClick={handleCopy}
      >
        <Copy className="w-4 h-4" />
      </button>
      
      <Link href={`/admin/meal-checkin?token=${sub.qr_code_token}`} className="text-brand-gold hover:text-brand-dark transition-colors p-1" title="Show QR Code / Check-in URL">
        <QrCode className="w-4 h-4" />
      </Link>

      <form action="/api/admin/subscriptions" method="POST" className="inline-block">
          <input type="hidden" name="subscription_id" value={sub.id} />
          
          {sub.payment_status !== 'paid' && (
              <button type="submit" name="action" value="mark_paid" className="btn-outline bg-white px-2 py-1 text-[10px] h-auto ml-1 border-brand-olive text-brand-dark hover:bg-brand-olive/10 uppercase tracking-wider">
                  Mark Paid
              </button>
          )}
          
          {sub.status !== 'cancelled' && (
              <button 
                type="submit" 
                name="action" 
                value="cancel" 
                className="btn-outline bg-white px-2 py-1 text-[10px] h-auto ml-1 border-red-200 text-red-600 hover:bg-red-50 uppercase tracking-wider" 
                onClick={(e) => confirmAction(e, 'Cancel subscription?')}
              >
                  Cancel
              </button>
          )}
          
          <button 
            type="submit" 
            name="action" 
            value="extend" 
            className="btn-outline bg-white px-2 py-1 text-[10px] h-auto ml-1 border-brand-gold text-brand-dark hover:bg-brand-gold/10 uppercase tracking-wider mt-1" 
            onClick={(e) => confirmAction(e, 'Extend subscription by 1 week?')}
          >
              Extend 1 Week
          </button>
      </form>
    </div>

    {isModalOpen && (
      <SubscriptionDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscription={sub}
        onUpdate={() => {
          // Ideally refresh the data, but for now we just let the optimistic UI or page refresh handle it
          window.location.reload();
        }}
      />
    )}
    </>
  );
}

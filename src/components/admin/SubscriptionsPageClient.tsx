"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddSubscriptionModal } from "./AddSubscriptionModal";
import { useSearchParams } from "next/navigation";

export function SubscriptionsPageClient() {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(() => searchParams.get("action") === "new");

  const initialData = {
    name: searchParams.get("name") || "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
    package: searchParams.get("package") || "",
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add Subscription
      </button>

      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={initialData}
      />
    </>
  );
}

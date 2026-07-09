"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function AddSubscriptionModal({
  isOpen,
  onClose,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    name?: string;
    phone?: string;
    email?: string;
    package?: string;
  };
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl w-full max-w-lg relative border border-border/50 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-olive hover:text-brand-dark transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="font-heading text-2xl font-bold text-olive-dark mb-6">Create Subscription</h2>

        <form action="/api/admin/subscriptions" method="POST" className="space-y-4">
          <input type="hidden" name="action" value="create" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="label">Customer Name</label>
                <input type="text" name="customer_name" required defaultValue={initialData.name} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" />
            </div>
            <div>
                <label className="label">Phone</label>
                <input type="tel" name="customer_phone" required defaultValue={initialData.phone} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" />
            </div>
          </div>

          <div>
            <label className="label">Email (Optional)</label>
            <input type="email" name="customer_email" defaultValue={initialData.email} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="label">Package Type</label>
                <select name="package_type" required defaultValue={initialData.package === 'Two Meals Daily Package' ? 'two_meals_daily' : 'one_meal_daily'} className="input bg-white focus-visible:ring-2 focus-visible:ring-brand-gold outline-none">
                    <option value="one_meal_daily">One Meal Daily</option>
                    <option value="two_meals_daily">Two Meals Daily</option>
                </select>
            </div>
            <div>
                <label className="label">Payment Status</label>
                <select name="payment_status" required defaultValue="paid" className="input bg-white focus-visible:ring-2 focus-visible:ring-brand-gold outline-none">
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="unpaid">Unpaid</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="label">Start Date</label>
                <input type="date" name="start_date" required defaultValue={new Date().toISOString().split('T')[0]} className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" />
            </div>
            <div>
                <label className="label">Payment Method</label>
                <select name="payment_method" className="input bg-white focus-visible:ring-2 focus-visible:ring-brand-gold outline-none">
                    <option value="cash">Cash</option>
                    <option value="clover_manual">Clover POS</option>
                    <option value="phone">Phone</option>
                    <option value="other">Other</option>
                </select>
            </div>
          </div>

          <div>
            <label className="label">Notes / Lead Ref</label>
            <input type="text" name="notes" className="input focus-visible:ring-2 focus-visible:ring-brand-gold outline-none" placeholder="e.g. Converted from package inquiry" />
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
             <button type="submit" onClick={() => setTimeout(() => setLoading(true), 10)} disabled={loading} className="btn-primary flex-1 justify-center">
                 {loading ? 'Creating...' : 'Create Active Subscription'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}

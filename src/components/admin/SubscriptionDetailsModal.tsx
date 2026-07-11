"use client";

import { X, Copy, Download, RefreshCw, Smartphone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { Subscription, MealCheckin } from "@/lib/supabase/types";

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onUpdate: () => void;
}

export function SubscriptionDetailsModal({ isOpen, onClose, subscription, onUpdate }: SubscriptionDetailsModalProps) {
  const [history, setHistory] = useState<MealCheckin[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}/checkins`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.checkins || []);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subscription.id]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const formData = new FormData();
      formData.append("action", action);
      formData.append("subscription_id", subscription.id);

      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onUpdate();
        if (action === "extend" || action === "extend_month" || action === "reactivate" || action === "mark_paid" || action === "cancel") {
          // If we mutate the subscription, we might want to refetch history if it affects it, but usually not needed.
        }
      }
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied!`);
  };

  const downloadCard = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null });
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `OldDamascus-Card-${subscription.subscription_code}.png`;
        link.href = url;
        link.click();
      } catch (err) {
        console.error("Failed to download card", err);
        alert("Failed to generate card image.");
      }
    }
  };

  // Calculations
  const startDate = new Date(subscription.start_date);
  const endDate = new Date(subscription.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1; // inclusive
  const totalMealsIncluded = totalDays * subscription.meals_per_day;
  const mealsServed = history.length;
  const mealsRemaining = Math.max(0, totalMealsIncluded - mealsServed);
  const today = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
  const todaysServed = history.filter(c => c.checkin_date === today.toISOString().split('T')[0]).length;
  const checkinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/meal-checkin?token=${subscription.qr_code_token}`;

  return (
    <>
      {/* Hidden Membership Card for Export */}
      <div className="fixed top-[-9999px] left-[-9999px]">
        <div ref={cardRef} className="w-[600px] h-[350px] bg-brand-dark rounded-3xl relative overflow-hidden flex flex-row shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "30px 30px" }} />
          
          {/* Left Column (Gold) */}
          <div className="w-[180px] bg-brand-gold flex flex-col items-center justify-center p-6 relative z-10 text-center">
            <h1 className="font-heading text-3xl font-bold text-brand-dark leading-tight mb-4">Old<br/>Damascus</h1>
            <div className="bg-white p-3 rounded-2xl shadow-lg mt-2">
              <QRCodeSVG value={checkinUrl} size={110} level="H" includeMargin={false} />
            </div>
          </div>

          {/* Right Column (Dark) */}
          <div className="flex-1 p-8 flex flex-col justify-between relative z-10">
            <div>
              <div className="text-brand-gold font-bold tracking-widest text-xs uppercase mb-1">VIP Meal Subscription</div>
              <h2 className="text-3xl font-bold text-white mb-1 truncate">{subscription.customer_name}</h2>
              <div className="text-brand-olive font-mono text-sm mb-6">{subscription.subscription_code}</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Package</div>
                  <div className="text-white font-semibold">{subscription.package_type === 'two_meals_daily' ? 'Two Meals Daily' : 'One Meal Daily'}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Valid Thru</div>
                  <div className="text-white font-semibold">{endDate.toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-6">
              <div className="text-white/60 text-xs">
                Scan QR Code for daily check-in.<br/>
                Non-transferable.
              </div>
              <div className="text-right text-xs">
                <div className="text-brand-gold font-bold">+1 469-728-5635</div>
                <div className="text-white/80">olddamascus.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-cream rounded-3xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] flex flex-col border border-border/50 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-6 sm:p-8 border-b border-border/50 bg-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-olive-dark">
                    {subscription.customer_name}
                  </h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    subscription.status === 'active' ? 'bg-success/20 text-success-dark' :
                    subscription.status === 'expired' ? 'bg-red-100 text-red-700' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-olive">
                  <div className="font-mono font-bold text-brand-dark bg-cream-warm px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-brand-gold/20 transition-colors" onClick={() => copyToClipboard(subscription.subscription_code, "ID")}>
                    {subscription.subscription_code} <Copy className="w-3 h-3" />
                  </div>
                  <a href={`tel:${subscription.customer_phone}`} className="hover:text-brand-gold transition-colors">{subscription.customer_phone}</a>
                  {subscription.customer_email && <a href={`mailto:${subscription.customer_email}`} className="hover:text-brand-gold transition-colors">{subscription.customer_email}</a>}
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-cream-warm rounded-full text-olive hover:text-brand-dark transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col - Stats & QR */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 text-center">
                    <h3 className="font-semibold text-olive-dark mb-4">Membership QR</h3>
                    <div className="bg-white p-4 inline-block rounded-xl shadow-sm border border-border/30 mb-4">
                      <QRCodeSVG value={checkinUrl} size={150} level="H" includeMargin={false} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={downloadCard} className="btn-primary w-full text-sm py-2 justify-center gap-2">
                          <Download className="w-4 h-4" /> Save Card
                        </button>
                        <button onClick={() => copyToClipboard(checkinUrl, "Check-in URL")} className="btn-outline bg-white w-full text-sm py-2 justify-center gap-2">
                          <Copy className="w-4 h-4" /> Copy URL
                        </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
                    <h3 className="font-semibold text-olive-dark border-b border-border/50 pb-3 mb-4">Package Details</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-olive">Type</span>
                            <span className="font-bold text-brand-dark">{subscription.package_type === 'two_meals_daily' ? 'Two Meals Daily' : 'One Meal Daily'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-olive">Payment</span>
                            <span className={`font-bold ${subscription.payment_status === 'paid' ? 'text-success-dark' : 'text-yellow-600'}`}>{subscription.payment_status.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-olive">Start</span>
                            <span className="font-medium text-olive-dark">{startDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-olive">End</span>
                            <span className="font-medium text-olive-dark">{endDate.toLocaleDateString()}</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Right Col - History & Stats */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-border/50 text-center">
                          <div className="text-2xl font-bold text-brand-dark">{totalMealsIncluded}</div>
                          <div className="text-xs font-semibold text-olive uppercase tracking-wider mt-1">Total Meals</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-border/50 text-center">
                          <div className="text-2xl font-bold text-brand-olive">{mealsServed}</div>
                          <div className="text-xs font-semibold text-olive uppercase tracking-wider mt-1">Served</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-border/50 text-center">
                          <div className="text-2xl font-bold text-brand-gold">{mealsRemaining}</div>
                          <div className="text-xs font-semibold text-olive uppercase tracking-wider mt-1">Remaining</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-border/50 text-center">
                          <div className="text-2xl font-bold text-olive-dark">{daysRemaining}</div>
                          <div className="text-xs font-semibold text-olive uppercase tracking-wider mt-1">Days Left</div>
                      </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white p-4 rounded-xl border border-border/50 flex flex-wrap gap-2 items-center justify-between">
                      <div className="text-sm font-semibold text-olive-dark w-full sm:w-auto mb-2 sm:mb-0">Admin Actions:</div>
                      <div className="flex flex-wrap gap-2">
                        {subscription.payment_status !== 'paid' && (
                            <button onClick={() => handleAction('mark_paid')} disabled={actionLoading === 'mark_paid'} className="btn-outline bg-brand-olive/10 border-brand-olive text-brand-dark px-3 py-1.5 text-xs">
                                {actionLoading === 'mark_paid' ? 'Updating...' : 'Mark Paid'}
                            </button>
                        )}
                        <button onClick={() => { if(confirm('Extend 1 week?')) handleAction('extend') }} disabled={actionLoading === 'extend'} className="btn-outline bg-brand-gold/10 border-brand-gold text-brand-dark px-3 py-1.5 text-xs">
                            Extend 1 Week
                        </button>
                        <button onClick={() => { if(confirm('Extend 1 month?')) handleAction('extend_month') }} disabled={actionLoading === 'extend_month'} className="btn-outline bg-brand-gold/10 border-brand-gold text-brand-dark px-3 py-1.5 text-xs">
                            Extend 1 Month
                        </button>
                        {subscription.status === 'cancelled' || subscription.status === 'expired' ? (
                            <button onClick={() => { if(confirm('Reactivate?')) handleAction('reactivate') }} disabled={actionLoading === 'reactivate'} className="btn-outline bg-success/10 border-success text-success-dark px-3 py-1.5 text-xs">
                                Reactivate
                            </button>
                        ) : (
                            <button onClick={() => { if(confirm('Cancel?')) handleAction('cancel') }} disabled={actionLoading === 'cancel'} className="btn-outline bg-red-50 border-red-200 text-red-600 px-3 py-1.5 text-xs">
                                Cancel
                            </button>
                        )}
                      </div>
                  </div>

                  {/* History Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col h-[300px]">
                      <div className="p-4 border-b border-border/50 bg-cream-warm/30 flex justify-between items-center">
                          <h3 className="font-semibold text-olive-dark">Meal History</h3>
                          <span className="text-xs font-bold text-olive bg-white px-2 py-1 rounded shadow-sm border border-border/50">{todaysServed} / {subscription.meals_per_day} Served Today</span>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {loadingHistory ? (
                          <div className="flex items-center justify-center h-full text-olive">
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading history...
                          </div>
                        ) : history.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-olive p-6 text-center">
                              <Smartphone className="w-10 h-10 text-olive/30 mb-3" />
                              <p className="font-semibold">No meals checked in yet</p>
                              <p className="text-sm mt-1">Scan the QR code to log the first meal.</p>
                          </div>
                        ) : (
                          <table className="w-full text-left text-sm">
                              <thead className="bg-cream sticky top-0 border-b border-border/50">
                                  <tr>
                                      <th className="px-4 py-3 font-semibold text-olive-dark">Date</th>
                                      <th className="px-4 py-3 font-semibold text-olive-dark">Meal</th>
                                      <th className="px-4 py-3 font-semibold text-olive-dark">Time</th>
                                      <th className="px-4 py-3 font-semibold text-olive-dark">Staff</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-border/50">
                                  {history.map((checkin) => (
                                      <tr key={checkin.id} className="hover:bg-cream-warm/30 transition-colors">
                                          <td className="px-4 py-3 font-medium text-brand-dark">{new Date(checkin.checkin_date).toLocaleDateString()}</td>
                                          <td className="px-4 py-3 text-olive">
                                              <span className="inline-flex items-center gap-1 bg-brand-olive/10 text-brand-dark px-2 py-0.5 rounded font-bold text-xs">
                                                <UtensilsCrossed className="w-3 h-3" /> {checkin.meal_number}
                                              </span>
                                          </td>
                                          <td className="px-4 py-3 text-olive">{new Date(checkin.served_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                          <td className="px-4 py-3 text-olive truncate max-w-[100px]" title={checkin.served_by || 'Admin'}>{checkin.served_by || 'Admin'}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                        )}
                      </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

// Ensure UtensilsCrossed is imported for the icon above
import { UtensilsCrossed } from "lucide-react";


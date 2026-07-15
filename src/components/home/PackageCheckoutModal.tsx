"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, ShieldCheck, HelpCircle } from "lucide-react";
import CloverPaymentForm, { type CloverPaymentFormRef } from "@/components/checkout/CloverPaymentForm";
import type { MealPackage } from "@/data/packages";

interface PackageCheckoutModalProps {
  pkg: MealPackage | null;
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  publicKey: string;
  environment: "sandbox" | "production";
}

export function PackageCheckoutModal({
  pkg,
  isOpen,
  onClose,
  merchantId,
  publicKey,
  environment,
}: PackageCheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    subscriptionCode: string;
    qrToken: string;
    cloverOrderId: string;
  } | null>(null);

  const [isInquiryMode, setIsInquiryMode] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const paymentFormRef = useRef<CloverPaymentFormRef>(null);

  if (!isOpen || !pkg) return null;

  const handleOnlineCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail || !startDate) {
      setError("Please fill out all required contact and date fields.");
      return;
    }

    if (!paymentFormRef.current) {
      setError("Payment system is still initializing.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const token = await paymentFormRef.current.requestToken();
      if (!token) {
        setIsProcessing(false);
        return;
      }

      const checkoutRef = crypto.randomUUID();
      const res = await fetch("/api/clover/place-package-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutReference: checkoutRef,
          packageId: pkg.id,
          paymentToken: token,
          customerName,
          customerPhone,
          customerEmail,
          startDate,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process package purchase.");
      }

      setSuccessData({
        subscriptionCode: data.subscriptionCode,
        qrToken: data.qrToken,
        cloverOrderId: data.cloverOrderId,
      });
    } catch (err: unknown) {
      console.error("[Package Checkout Error]:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          type: "Package Inquiry",
          subject: `Inquiry: ${pkg.name}`,
          message: `Package: ${pkg.name} ($${pkg.price}/week)\nPreferred Start Date: ${startDate}\nNotes: ${notes}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to send inquiry.");
      setInquirySubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Inquiry submission failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
            <div>
              <h3 className="font-heading text-xl font-bold text-amber-400">
                {isInquiryMode ? `Inquire: ${pkg.name}` : `Activate: ${pkg.name}`}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pkg.priceLabel} — {pkg.duration} ({pkg.mealsPerDay * 7} Fresh Meals)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            {successData ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-heading text-2xl font-bold text-white">
                  Package Activated & Paid!
                </h4>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Your payment was successfully verified by Clover and your subscription is now active.
                </p>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-left max-w-md mx-auto">
                  <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Membership ID:</span>
                    <span className="font-mono font-bold text-amber-400 text-lg">{successData.subscriptionCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Clover Order Reference:</span>
                    <span className="font-mono text-xs text-slate-300">{successData.cloverOrderId}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Start Date:</span>
                    <span className="text-slate-200 font-medium">{startDate}</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/account/profile"
                    className="btn-primary py-2.5 px-6 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-black text-center"
                  >
                    View My Package & QR Code
                  </a>
                  <button
                    onClick={onClose}
                    className="py-2.5 px-6 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : inquirySubmitted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                <h4 className="font-heading text-2xl font-bold">Inquiry Sent!</h4>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you for your inquiry about the {pkg.name}. Our team will contact you to discuss details and complete activation.
                </p>
                <button
                  onClick={onClose}
                  className="btn-primary w-full max-w-xs mx-auto py-3 bg-amber-500 text-black rounded-xl font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-sm mb-6">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                {/* Contact & Date Fields */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(555) 555-5555"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                        Dietary Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. No onions, extra garlic"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {isInquiryMode ? (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-lg transition-all"
                    >
                      {isProcessing ? "Sending Inquiry..." : "Submit Inquiry to Staff"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInquiryMode(false)}
                      className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      ← Back to Online Instant Activation & Checkout
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOnlineCheckout} className="space-y-6">
                    {/* Clover Payment Form */}
                    <div className="border border-slate-800 rounded-2xl p-1 bg-slate-950/40">
                      <CloverPaymentForm
                        ref={paymentFormRef}
                        merchantId={merchantId}
                        publicKey={publicKey}
                        environment={environment}
                        onError={(errMsg) => setError(errMsg)}
                        isProcessing={isProcessing}
                      />
                    </div>

                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span>
                          {isProcessing ? "Processing Clover Payment..." : `Pay & Activate Online ($${pkg.price})`}
                        </span>
                      </button>

                      {/* Secondary Inquiry Link */}
                      <div className="text-center pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => setIsInquiryMode(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors py-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Prefer to pay in person or speak with staff? Inquire instead</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

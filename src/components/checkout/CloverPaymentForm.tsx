"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import Script from "next/script";
import { CreditCard, ShieldAlert } from "lucide-react";

export interface CloverPaymentFormRef {
  requestToken: () => Promise<string | null>;
}

interface CloverPaymentFormProps {
  merchantId: string;
  publicKey: string;
  environment: "sandbox" | "production";
  onError: (error: string) => void;
  isProcessing: boolean;
}

interface CloverInstance {
  elements: () => CloverElements;
  createToken: () => Promise<{ token?: string; error?: { message?: string } }>;
}

interface CloverElements {
  create: (type: string, options?: unknown) => CloverElement;
}

interface CloverElement {
  mount: (selector: string) => void;
  destroy: () => void;
  addEventListener: (event: string, handler: (event: CloverChangeEvent) => void) => void;
}

interface CloverChangeEvent {
  error?: {
    message: string;
  };
}

declare global {
  interface Window {
    Clover?: new (merchantId: string, options: { apiKey: string }) => CloverInstance;
  }
}

const CloverPaymentForm = forwardRef<CloverPaymentFormRef, CloverPaymentFormProps>(
  ({ merchantId, publicKey, environment, onError }, ref) => {
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [sdkError, setSdkError] = useState<string | null>(null);
    const [cardError, setCardError] = useState<string | null>(null);
    const cloverInstance = useRef<CloverInstance | null>(null);
    const cardElement = useRef<CloverElement | null>(null);

    const sdkUrl =
      environment === "sandbox"
        ? "https://checkout.sandbox.clover.com/sdk.js"
        : "https://checkout.clover.com/sdk.js";

    // Expose requestToken method to parent component via ref
    useImperativeHandle(ref, () => ({
      async requestToken() {
        if (!cloverInstance.current || !cardElement.current) {
          onError("Payment interface is not ready.");
          return null;
        }

        setCardError(null);
        try {
          const result = await cloverInstance.current.createToken();
          if (result.error) {
            const errMsg = result.error.message || "Failed to validate card.";
            setCardError(errMsg);
            onError(errMsg);
            return null;
          }
          if (result.token) {
            return result.token;
          }
          onError("Could not generate secure token.");
          return null;
        } catch (err) {
          console.error("[Clover Tokenization Exception]:", err);
          const errMsg = "Card validation timed out. Please try again.";
          setCardError(errMsg);
          onError(errMsg);
          return null;
        }
      },
    }));

    useEffect(() => {
      if (window.Clover) {
        setSdkLoaded(true);
      }
    }, []);

    useEffect(() => {
      if (!sdkLoaded || !merchantId || !publicKey) return;

      try {
        console.log(`[Clover SDK] Initializing Clover Elements for merchant: ${merchantId}`);

        if (!window.Clover) {
          onError("Clover SDK is not loaded.");
          return;
        }

        const clover = new window.Clover(merchantId, {
          apiKey: publicKey,
        });
        cloverInstance.current = clover;

        const styles = {
          body: {
            fontFamily: "Inter, system-ui, sans-serif",
            color: "#ffffff",
            backgroundColor: "transparent",
          },
          input: {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "transparent",
            "::placeholder": {
              color: "#9ca3af",
            },
          },
          "input:focus": {
            color: "#f59e0b",
          },
          invalid: {
            color: "#ef4444",
          },
        };

        const elements = clover.elements();
        const card = elements.create("card", { styles });
        cardElement.current = card;

        const targetEl = document.querySelector("#clover-card-element");
        if (!targetEl) {
          console.warn("[Clover SDK] Target container #clover-card-element not found in DOM yet.");
          return;
        }

        card.mount("#clover-card-element");

        card.addEventListener("change", (event: CloverChangeEvent) => {
          if (event.error) {
            setCardError(event.error.message);
            onError(event.error.message);
          } else {
            setCardError(null);
          }
        });
      } catch (err: unknown) {
        console.error("[Clover SDK Init Error]:", err);
        const errStr = err instanceof Error ? err.message : String(err);
        let userMsg = "Failed to load Clover payment fields.";
        if (errStr.toLowerCase().includes("key") || errStr.toLowerCase().includes("domain") || errStr.toLowerCase().includes("origin")) {
          userMsg = `Clover configuration error: ${errStr}. Please verify that this domain is whitelisted in Clover Merchant Dashboard (Setup -> Ecommerce -> Domain Whitelisting).`;
        } else if (errStr) {
          userMsg = `Failed to load Clover payment fields (${errStr}). Please refresh or verify domain setup.`;
        }
        setSdkError(userMsg);
        onError(userMsg);
      }

      return () => {
        if (cardElement.current) {
          try {
            cardElement.current.destroy();
            console.log("[Clover SDK] Secure elements destroyed successfully.");
          } catch (err) {
            console.error("[Clover SDK Cleanup Error]:", err);
          }
        }
      };
    }, [sdkLoaded, merchantId, publicKey, onError]);

    return (
      <div className="w-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/20">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

        <Script
          src={sdkUrl}
          strategy="afterInteractive"
          onLoad={() => setSdkLoaded(true)}
          onError={() => {
            setSdkError("Could not establish a secure connection to Clover.");
            onError("Could not establish a secure connection to Clover.");
          }}
        />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Payment Method</h3>
            <p className="text-xs text-slate-400">Transactions are encrypted and secure</p>
          </div>
        </div>

        {sdkError ? (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{sdkError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Card Information
              </label>
              <div className="w-full bg-slate-950/80 rounded-xl border border-slate-800 px-4 py-3.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all duration-200">
                <div id="clover-card-element" className="w-full min-h-[24px]" />
              </div>
            </div>

            {cardError && (
              <div className="flex items-start gap-2 text-red-500 text-xs mt-1 animate-pulse">
                <span className="font-semibold">•</span>
                <span>{cardError}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-500 text-center mt-2 leading-relaxed">
              Your payment card details are loaded directly from Clover secure servers. 
              We never store your card information on our servers.
            </p>
          </div>
        )}
      </div>
    );
  }
);

CloverPaymentForm.displayName = "CloverPaymentForm";

export default CloverPaymentForm;

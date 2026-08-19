"use client";

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
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
  createToken: () => Promise<{ token?: string; error?: { message?: string }; errors?: Record<string, string> }>;
}

interface CloverElements {
  create: (type: string, styles?: unknown) => CloverElement;
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
    Clover?: new (apiKey: string, options: { merchantId: string }) => CloverInstance;
  }
}

const CARD_CONTAINER_IDS = [
  "clover-card-number",
  "clover-card-date",
  "clover-card-cvv",
] as const;

/**
 * Clover injects each card iframe asynchronously, some time after mount()
 * returns. If a second initialise ever slips through, both injections land
 * and the container ends up holding two iframes stacked vertically.
 *
 * Keep the newest node - the one belonging to the live Clover instance that
 * createToken() reads from - and drop anything older.
 */
function enforceSingleCardIframe(): void {
  if (typeof document === "undefined") return;
  for (const id of CARD_CONTAINER_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    while (el.childElementCount > 1 && el.firstElementChild) {
      el.removeChild(el.firstElementChild);
    }
  }
}

const CloverPaymentForm = forwardRef<CloverPaymentFormRef, CloverPaymentFormProps>(
  ({ merchantId, publicKey, environment, onError }, ref) => {
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [sdkError, setSdkError] = useState<string | null>(null);
    const [cardError, setCardError] = useState<string | null>(null);
    const cloverInstance = useRef<CloverInstance | null>(null);
    const cardElementsRef = useRef<CloverElement[]>([]);
    // Which merchant/key the fields were built for. Deliberately NOT cleared
    // by effect cleanup: the previous guard reset itself there, so any
    // dependency change re-ran a full initialise and mount() injected a
    // second set of iframes on top of the in-flight first set.
    const mountedKeyRef = useRef<string | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    // The parent passes onError as an inline arrow, so its identity changes on
    // every render. Holding it in a ref keeps it out of the mount effect's
    // dependencies — otherwise each parent re-render re-ran the effect and
    // mounted another set of card iframes.
    const onErrorRef = useRef(onError);
    useEffect(() => {
      onErrorRef.current = onError;
    }, [onError]);

    const notifyError = useCallback((message: string) => {
      onErrorRef.current?.(message);
    }, []);

    // Safety net: whatever injects an extra iframe, prune it the moment it
    // lands rather than trusting that the mount path stayed single.
    const startDuplicateWatch = useCallback(() => {
      if (observerRef.current || typeof MutationObserver === "undefined") return;
      const observer = new MutationObserver(() => enforceSingleCardIframe());
      for (const id of CARD_CONTAINER_IDS) {
        const el = document.getElementById(id);
        if (el) observer.observe(el, { childList: true });
      }
      observerRef.current = observer;
    }, []);

    const sdkUrl =
      environment === "sandbox"
        ? "https://checkout.sandbox.clover.com/sdk.js"
        : "https://checkout.clover.com/sdk.js";

    // Expose requestToken method to parent component via ref
    useImperativeHandle(ref, () => ({
      async requestToken() {
        if (!cloverInstance.current || cardElementsRef.current.length === 0) {
          notifyError("Payment interface is not ready.");
          return null;
        }

        setCardError(null);
        try {
          const result = await cloverInstance.current.createToken();
          if (result.error && result.error.message) {
            const errMsg = result.error.message;
            setCardError(errMsg);
            notifyError(errMsg);
            return null;
          }
          if (result.errors) {
            const firstErr = Object.values(result.errors)[0] || "Failed to validate card fields.";
            setCardError(firstErr);
            notifyError(firstErr);
            return null;
          }
          if (result.token) {
            return result.token;
          }
          notifyError("Could not generate secure token from Clover.");
          return null;
        } catch (err) {
          console.error("[Clover Tokenization Exception]:", err);
          const errMsg = "Card validation timed out. Please try again.";
          setCardError(errMsg);
          notifyError(errMsg);
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

      // Build the card fields exactly once per merchant/key. This is the
      // only place permitted to call elements() / create() / mount().
      const mountKey = merchantId + '|' + publicKey;
      if (mountedKeyRef.current === mountKey) return;

      try {
        console.log(`[Clover SDK] Initializing Clover Elements for merchant: ${merchantId}`);

        if (!window.Clover) {
          notifyError("Clover SDK is not loaded.");
          return;
        }

        // Official signature: new Clover(apiKey, { merchantId })
        const clover = new window.Clover(publicKey, {
          merchantId: merchantId,
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
        const cardNumber = elements.create("CARD_NUMBER", styles);
        const cardDate = elements.create("CARD_DATE", styles);
        const cardCvv = elements.create("CARD_CVV", styles);

        cardElementsRef.current = [cardNumber, cardDate, cardCvv];

        const numEl = document.querySelector("#clover-card-number");
        const dateEl = document.querySelector("#clover-card-date");
        const cvvEl = document.querySelector("#clover-card-cvv");

        if (!numEl || !dateEl || !cvvEl) {
          console.warn("[Clover SDK] Target containers (#clover-card-number, #clover-card-date, #clover-card-cvv) not found in DOM yet.");
          // mountedKeyRef stays unset so a later pass can retry.
          return;
        }

        // Destroy anything a previous instance left behind, then guarantee
        // every container holds zero children before mounting into it.
        cardElementsRef.current.forEach((el) => {
          try {
            el.destroy();
          } catch {
            /* element already gone */
          }
        });
        for (const id of CARD_CONTAINER_IDS) {
          const el = document.getElementById(id);
          el?.replaceChildren();
          if (el && el.childElementCount !== 0) {
            console.warn("[Clover SDK] Container still had children:", id);
          }
        }

        cardNumber.mount("#clover-card-number");
        cardDate.mount("#clover-card-date");
        cardCvv.mount("#clover-card-cvv");

        // Committed: no later pass re-initialises for this merchant/key.
        mountedKeyRef.current = mountKey;

        // The iframes arrive asynchronously, so sweep once they land and
        // keep watching for late arrivals.
        startDuplicateWatch();
        requestAnimationFrame(enforceSingleCardIframe);
        setTimeout(enforceSingleCardIframe, 400);
        setTimeout(enforceSingleCardIframe, 1500);

        [cardNumber, cardDate, cardCvv].forEach((el) => {
          el.addEventListener("change", (event: CloverChangeEvent) => {
            if (event.error && event.error.message) {
              setCardError(event.error.message);
              notifyError(event.error.message);
            } else {
              setCardError(null);
            }
          });
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
        notifyError(userMsg);
      }

      // No cleanup here, on purpose. Tearing the fields down whenever a
      // dependency changed is what produced the duplicates: cleanup cleared
      // a container the previous mount() had not filled yet, the next pass
      // mounted again, and both async injections then landed.
    }, [sdkLoaded, merchantId, publicKey, notifyError, startDuplicateWatch]);

    // Teardown belongs to the real unmount, nothing else.
    useEffect(() => {
      return () => {
        observerRef.current?.disconnect();
        observerRef.current = null;

        cardElementsRef.current.forEach((el) => {
          try {
            el.destroy();
          } catch (err) {
            console.error("[Clover SDK Cleanup Error]:", err);
          }
        });
        cardElementsRef.current = [];
        cloverInstance.current = null;

        for (const id of CARD_CONTAINER_IDS) {
          document.getElementById(id)?.replaceChildren();
        }
        mountedKeyRef.current = null;
      };
    }, []);

    return (
      <div className="w-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/20">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

        <Script
          src={sdkUrl}
          strategy="afterInteractive"
          onLoad={() => setSdkLoaded(true)}
          onError={() => {
            setSdkError("Could not establish a secure connection to Clover.");
            notifyError("Could not establish a secure connection to Clover.");
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
            {/* Card Number */}
            <div className="space-y-1.5">
              <label htmlFor="clover-card-number" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Card Number
              </label>
              <div className="w-full bg-slate-950/80 rounded-xl border border-slate-800 px-4 py-3.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all duration-200">
                <div id="clover-card-number" className="w-full min-h-[24px]" />
              </div>
            </div>

            {/* Expiry Date & CVV Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="clover-card-date" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Expiration Date
                </label>
                <div className="w-full bg-slate-950/80 rounded-xl border border-slate-800 px-4 py-3.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all duration-200">
                  <div id="clover-card-date" className="w-full min-h-[24px]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="clover-card-cvv" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  CVV
                </label>
                <div className="w-full bg-slate-950/80 rounded-xl border border-slate-800 px-4 py-3.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all duration-200">
                  <div id="clover-card-cvv" className="w-full min-h-[24px]" />
                </div>
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

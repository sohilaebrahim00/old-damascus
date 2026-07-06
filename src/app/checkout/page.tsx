"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { restaurant } from "@/config/restaurant";
import {
  ArrowLeft,
  ShoppingBag,
  AlertTriangle,
  ExternalLink,
  Phone,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CloverPaymentForm, {
  CloverPaymentFormRef,
} from "@/components/checkout/CloverPaymentForm";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  orderType: z.enum(["pickup", "delivery"]),
  pickupTime: z.string().optional(),
  street: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  
  // State Management
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<
    | "idle"
    | "calculating"
    | "securing_payment"
    | "placing_order"
    | "declined"
    | "success"
  >("idle");

  // Client-generated UUID for idempotency
  const [checkoutReference] = useState(() => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });

  // Clover Integration State
  const [cloverConfig, setCloverConfig] = useState<{
    merchantId: string;
    publicKey: string;
    environment: "sandbox" | "production";
    directOrderingEnabled: boolean;
  } | null>(null);

  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      // eslint-disable-next-line
      setIsTestMode(params.get("test") === "true");
    }
  }, []);

  const isCheckoutEnabled =
    !!cloverConfig?.directOrderingEnabled &&
    (isTestMode || process.env.NEXT_PUBLIC_ENABLE_LIVE_CHECKOUT === "true");

  // Tip options
  const [tipOption, setTipOption] = useState<string>("15");
  const [customTip, setCustomTip] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Clover Calculated Totals
  const [previewTotals, setPreviewTotals] = useState<{
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
  } | null>(null);
  const [priceChanged, setPriceChanged] = useState(false);

  const paymentFormRef = useRef<CloverPaymentFormRef>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      orderType: "pickup",
      pickupTime: "asap",
      street: "",
      apartment: "",
      city: "Richardson",
      zip: "75080",
      notes: "",
    },
  });

  const orderType = useWatch({
    control,
    name: "orderType",
  });
  const subtotal = getSubtotal();

  // 1. Fetch Clover Configurations
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);

    async function loadCloverConfig() {
      try {
        const res = await fetch("/api/clover/config");
        if (res.ok) {
          const data = await res.json();
          setCloverConfig(data);
        }
      } catch (err) {
        console.error("Failed to load Clover configuration:", err);
      }
    }

    loadCloverConfig();
  }, []);

  // 2. Recalculate Tip Amount when subtotal, option, or custom tip changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (tipOption === "custom") {
        const val = parseFloat(customTip);
        setTipAmount(isNaN(val) || val < 0 ? 0 : val);
      } else if (tipOption === "none") {
        setTipAmount(0);
      } else {
        const pct = parseFloat(tipOption) / 100;
        setTipAmount(parseFloat((subtotal * pct).toFixed(2)));
      }
    }, 0);
    return () => clearTimeout(t);
  }, [subtotal, tipOption, customTip]);

  // 3. Fetch Clover calculated totals (Preview)
  useEffect(() => {
    if (items.length === 0 || !cloverConfig?.directOrderingEnabled) return;

    let active = true;

    async function calculateTotals() {
      setCheckoutStatus("calculating");
      try {
        const res = await fetch("/api/clover/checkout-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              selectedModifiers: i.selectedModifiers.map((m) => ({
                modifierId: m.modifierId,
              })),
            })),
            orderType,
            tipAmount,
          }),
        });

        if (!active) return;

        const data = await res.json();
        if (res.ok && data.success) {
          setPreviewTotals(data.summary);
          setPriceChanged(data.priceChanged);
          setError(null);
        } else {
          throw new Error(data.error || "Failed to calculate totals.");
        }
      } catch (err: unknown) {
        if (active) {
          console.error("[Clover Preview Error]:", err);
          const errorMsg = err instanceof Error ? err.message : "Could not calculate taxes. Offline fallback.";
          setError(errorMsg);
        }
      } finally {
        if (active) setCheckoutStatus("idle");
      }
    }

    // Debounce preview request slightly
    const timer = setTimeout(() => {
      calculateTotals();
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [items, orderType, tipAmount, cloverConfig]);

  // 4. Unified Checkout Form Submit
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!isCheckoutEnabled) {
      setError("Online checkout is currently being finalized. Please order via DoorDash or Uber Eats.");
      return;
    }

    setLoading(true);
    setError(null);
    setCheckoutStatus("securing_payment");

    try {
      // Step A: Trigger tokenization on Clover card iframe
      console.log("[Checkout] Requesting payment token...");
      const token = await paymentFormRef.current?.requestToken();

      if (!token) {
        setCheckoutStatus("idle");
        setLoading(false);
        return; // error is handled and displayed in CloverPaymentForm
      }

      setCheckoutStatus("placing_order");

      // Step B: Submit order to Place Order API
      console.log("[Checkout] Submitting order payload...");
      const res = await fetch("/api/clover/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutReference,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            selectedModifiers: i.selectedModifiers.map((m) => ({
              modifierId: m.modifierId,
            })),
          })),
          orderType: data.orderType,
          customer: {
            firstName: data.name.split(" ")[0] || "Guest",
            lastName: data.name.split(" ").slice(1).join(" ") || "Customer",
            email: data.email,
            phone: data.phone,
          },
          deliveryAddress:
            data.orderType === "delivery"
              ? {
                  street: data.street || "",
                  apartment: data.apartment || "",
                  city: data.city || "",
                  state: "TX",
                  zip: data.zip || "",
                }
              : undefined,
          notes: data.notes,
          tipAmount,
          paymentToken: token,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setCheckoutStatus("declined");
        throw new Error(body.error || "Payment declined or order creation failed.");
      }

      // Success
      setCheckoutStatus("success");
      clearCart();
      router.push(`/order-confirmation/${checkoutReference}`);
    } catch (err: unknown) {
      console.error("[Checkout Submission Error]:", err);
      const errorMsg = err instanceof Error ? err.message : "Order processing failed. Please check card details.";
      setError(errorMsg);
      setLoading(false);
      if (checkoutStatus !== "declined") {
        setCheckoutStatus("idle");
      }
    }
  };

  // Helper to determine button text based on status
  const getButtonText = () => {
    if (!isCheckoutEnabled) return "Online checkout is being finalized.";
    if (checkoutStatus === "calculating") return "Calculating with Clover...";
    if (checkoutStatus === "securing_payment") return "Verifying Secure Card...";
    if (checkoutStatus === "placing_order") return "Submitting Transaction...";
    if (checkoutStatus === "success") return "Payment Approved!";
    if (checkoutStatus === "declined") return "Card Declined — Try Again";
    return "Pay Securely with Clover";
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream py-16 flex items-center justify-center text-center">
        <div className="max-w-md p-6 space-y-4">
          <ShoppingBag className="w-16 h-16 text-border mx-auto" />
          <h1 className="font-heading text-2xl font-bold text-olive-dark">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-olive">
            Add some delicious items from our menu before proceeding to checkout.
          </p>
          <Link href="/menu" className="btn-primary">
            View Our Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container-site max-w-5xl">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark hover:text-brand-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1 className="font-heading text-3xl font-bold text-olive-dark mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-2 card p-6 sm:p-8 bg-white space-y-6">
            <h2 className="font-heading text-xl font-semibold text-olive-dark border-b pb-3">
              Customer Information
            </h2>

            {/* eslint-disable-next-line */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {!isCheckoutEnabled && (
                <div className="p-5 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-2xl space-y-4">
                  <div className="flex items-start gap-3.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-olive-dark">Online Checkout Finalizing</p>
                      <p className="text-xs mt-1 leading-relaxed">
                        Online checkout is being finalized. You can browse the menu and add items to your cart, but submissions are currently disabled. Please place your order through our delivery partners or call the restaurant directly.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-500/20">
                    <a
                      href={restaurant.doordashUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline btn-sm bg-white hover:bg-red-50 flex-1 text-center animate-pulse"
                    >
                      Order on DoorDash <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                    <a
                      href={restaurant.uberEatsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline btn-sm bg-white hover:bg-gray-50 flex-1 text-center animate-pulse"
                    >
                      Order on Uber Eats <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                    <a
                      href={restaurant.phoneUrl}
                      className="btn-primary btn-sm flex-1 justify-center"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" /> Call Restaurant
                    </a>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-error/20 text-error rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Online Ordering Notice</p>
                      <p className="text-xs mt-1 leading-relaxed">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Changed Banner */}
              {priceChanged && (
                <div className="p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">
                    Your order total has been updated using the restaurant’s current Clover pricing.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <input id="name" type="text" {...register("name")} className="input" placeholder="Your Name" />
                  {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input id="email" type="email" {...register("email")} className="input" placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <input id="phone" type="tel" {...register("phone")} className="input" placeholder="Phone Number" />
                {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
              </div>

              <div className="divider" />

              <h2 className="font-heading text-xl font-semibold text-olive-dark border-b pb-3">
                Fulfillment Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${orderType === "pickup" ? "bg-amber-50 border-amber-500" : "bg-cream border-border hover:border-brand"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" value="pickup" {...register("orderType")} className="accent-brand-dark" />
                    <span className="text-sm font-semibold text-olive-dark">Pickup</span>
                  </div>
                  <span className="text-xs text-olive font-medium">Free</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${orderType === "delivery" ? "bg-amber-50 border-amber-500" : "bg-cream border-border hover:border-brand"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" value="delivery" {...register("orderType")} className="accent-brand-dark" />
                    <span className="text-sm font-semibold text-olive-dark">Delivery</span>
                  </div>
                  <span className="text-xs text-olive font-medium">Calculated</span>
                </label>
              </div>

              {orderType === "pickup" && (
                <div>
                  <label htmlFor="pickupTime" className="label">Pickup Time</label>
                  <select id="pickupTime" {...register("pickupTime")} className="input bg-white">
                    <option value="asap">As Soon As Possible (ASAP)</option>
                    <option value="30m">In 30 Minutes</option>
                    <option value="1h">In 1 Hour</option>
                    <option value="2h">In 2 Hours</option>
                  </select>
                </div>
              )}

              {orderType === "delivery" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="street" className="label">Street Address</label>
                      <input id="street" type="text" {...register("street")} className="input" placeholder="123 Main St" />
                    </div>
                    <div>
                      <label htmlFor="apartment" className="label">Apartment / Suite</label>
                      <input id="apartment" type="text" {...register("apartment")} className="input" placeholder="Apt 4B" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="label">City</label>
                      <input id="city" type="text" {...register("city")} className="input" placeholder="Richardson" />
                    </div>
                    <div>
                      <label htmlFor="zip" className="label">ZIP Code</label>
                      <input id="zip" type="text" {...register("zip")} className="input" placeholder="75080" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="notes" className="label">Order Notes / Kitchen Instructions</label>
                <textarea id="notes" rows={3} {...register("notes")} className="input resize-none" placeholder="Utensils request, gate code, allergy notes..." />
              </div>

              {/* Secure Payment Section */}
              {isCheckoutEnabled && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h2 className="font-heading text-xl font-semibold text-olive-dark">
                    Payment details
                  </h2>
                  <CloverPaymentForm
                    ref={paymentFormRef}
                    merchantId={cloverConfig.merchantId}
                    publicKey={cloverConfig.publicKey}
                    environment={cloverConfig.environment}
                    onError={(err) => setError(err)}
                    isProcessing={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isCheckoutEnabled}
                className="btn-primary w-full justify-center btn-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {getButtonText()}
              </button>
            </form>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="card p-6 bg-white space-y-6 border border-border shadow-xl">
            <h2 className="font-heading text-xl font-semibold text-olive-dark border-b pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              Order Summary
            </h2>

            <ul className="divide-y divide-border max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.cartItemId} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-olive-dark line-clamp-1">
                      {item.name} <span className="text-xs text-olive font-normal">x{item.quantity}</span>
                    </p>
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-xs text-olive line-clamp-1 mt-0.5">
                        {item.selectedModifiers.map((m) => m.modifierName).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-brand-dark flex-shrink-0">
                    {formatPrice((item.price + item.selectedModifiers.reduce((s, m) => s + m.additionalPrice, 0)) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Tip Selection Section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-olive-dark mb-2">Add a Tip</h3>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: "15%", value: "15" },
                  { label: "18%", value: "18" },
                  { label: "20%", value: "20" },
                  { label: "None", value: "none" },
                  { label: "Custom", value: "custom" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTipOption(opt.value)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${tipOption === opt.value ? "bg-amber-500 border-amber-500 text-white" : "bg-cream border-border text-olive-dark hover:border-amber-400"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {tipOption === "custom" && (
                <div className="mt-3 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="input pl-8 py-1.5 text-sm"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Calculation details */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-olive">Subtotal</span>
                <span className="font-semibold text-olive-dark">{formatPrice(previewTotals?.subtotal ?? subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-olive">Taxes (calculated by Clover)</span>
                <span className="font-semibold text-olive-dark">
                  {previewTotals ? formatPrice(previewTotals.tax) : "$0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-olive">Driver Tip</span>
                <span className="font-semibold text-olive-dark">{formatPrice(tipAmount)}</span>
              </div>
              <div className="divider pt-2" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-olive-dark">Total</span>
                <span className="text-amber-600">
                  {formatPrice(previewTotals ? previewTotals.total : subtotal + tipAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

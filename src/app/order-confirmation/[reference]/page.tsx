import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { restaurant } from "@/config/restaurant";
import {
  CheckCircle,
  Phone,
  Clock,
  MapPin,
  User,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface Props {
  params: Promise<{ reference: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const resolvedParams = await params;
  const reference = resolvedParams.reference;

  // Retrieve order details from database
  const order = await getOrder(reference);

  // If order is not found, return 404
  if (!order) {
    notFound();
  }

  // If order payment is not approved, show pending/failed transaction view
  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-cream py-16 flex items-center justify-center">
      <div className="container-site max-w-2xl w-full px-4">
        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden transition-all duration-300">
          
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
            {/* Elegant Pattern Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

            {isPaid ? (
              <div className="relative z-10 space-y-3">
                <div className="inline-flex p-3.5 bg-emerald-500/10 rounded-full text-emerald-400 mb-2 border border-emerald-500/20">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="font-heading text-3xl font-bold tracking-tight">
                  Thank You for Your Order!
                </h1>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Your payment has been approved and your order has been sent directly to the kitchen.
                </p>
              </div>
            ) : (
              <div className="relative z-10 space-y-3">
                <div className="inline-flex p-3.5 bg-amber-500/10 rounded-full text-amber-400 mb-2 border border-amber-500/20">
                  <Clock className="w-10 h-10" />
                </div>
                <h1 className="font-heading text-3xl font-bold tracking-tight">
                  Order Status: {order.status}
                </h1>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  We are currently verifying the payment. If you have any questions, please contact us.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Order Reference Details */}
            <div className="grid grid-cols-2 gap-4 bg-cream/50 rounded-2xl p-4 border border-border/50 text-sm">
              <div>
                <span className="text-xs text-olive font-medium block">Order Number</span>
                <span className="font-bold text-olive-dark text-base">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-xs text-olive font-medium block">Payment Status</span>
                <span className={`inline-flex items-center gap-1 font-bold text-sm mt-1 px-2.5 py-0.5 rounded-full ${isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Fulfillment Estimate */}
            <div className="flex items-start gap-4 p-4 border border-border rounded-2xl bg-white shadow-sm">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-olive-dark text-sm">Fulfillment Estimate</h3>
                <p className="text-xs text-olive">
                  {order.orderType === "delivery"
                    ? "Estimated Delivery: 45 - 60 Minutes"
                    : "Estimated Pickup: 20 - 25 Minutes"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Prep times may vary depending on kitchen load.
                </p>
              </div>
            </div>

            {/* Delivery details if applicable */}
            {order.orderType === "delivery" && order.deliveryAddress && (
              <div className="flex items-start gap-4 p-4 border border-border rounded-2xl bg-white shadow-sm">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-olive-dark text-sm">Delivery Address</h3>
                  <p className="text-xs text-olive leading-relaxed">
                    {order.deliveryAddress.street}
                    {order.deliveryAddress.apartment && `, ${order.deliveryAddress.apartment}`}
                    <br />
                    {order.deliveryAddress.city}, TX {order.deliveryAddress.zip}
                  </p>
                </div>
              </div>
            )}

            {/* Ordered Items Summary */}
            <div className="space-y-3">
              <h3 className="font-heading text-lg font-bold text-olive-dark flex items-center gap-2 border-b pb-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                Items Ordered
              </h3>
              <ul className="divide-y divide-border/60">
                {order.items.map((item) => {
                  const itemPriceSum =
                    item.price +
                    (item.modifiers ?? []).reduce((s, m) => s + m.additionalPrice, 0);

                  return (
                    <li key={item.id} className="py-3 flex justify-between gap-4 text-sm">
                      <div className="min-w-0">
                        <p className="font-bold text-olive-dark">
                          {item.name} <span className="text-xs text-olive font-normal">x{item.quantity}</span>
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <p className="text-xs text-olive/80 mt-1 leading-relaxed">
                            Modifiers: {item.modifiers.map((m) => `${m.name} (+${formatPrice(m.additionalPrice)})`).join(", ")}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-700 italic mt-1">
                            Note: &quot;{item.specialInstructions}&quot;
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-brand-dark flex-shrink-0">
                        {formatPrice(itemPriceSum * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Totals Table */}
              <div className="bg-cream/40 rounded-2xl p-4 border border-border/40 text-sm space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-olive">Subtotal</span>
                  <span className="font-semibold text-olive-dark">{formatPrice(order.subtotalCents / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Sales Tax</span>
                  <span className="font-semibold text-olive-dark">{formatPrice(order.taxCents / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Driver Tip</span>
                  <span className="font-semibold text-olive-dark">{formatPrice(order.tipCents / 100)}</span>
                </div>
                <div className="divider my-2 border-border/80" />
                <div className="flex justify-between font-bold text-base">
                  <span className="text-olive-dark font-heading">Total Paid</span>
                  <span className="text-amber-600">{formatPrice(order.totalCents / 100)}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="font-heading text-lg font-bold text-olive-dark flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-amber-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-olive">
                <div>
                  <span className="font-semibold block text-olive-dark">Customer Name</span>
                  {order.customerName}
                </div>
                <div>
                  <span className="font-semibold block text-olive-dark">Email Address</span>
                  {order.customerEmail}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold block text-olive-dark">Phone Number</span>
                  {order.customerPhone}
                </div>
              </div>
            </div>

            {/* Restaurant support banner */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex items-start gap-3.5 text-xs text-amber-800 mt-6">
              <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Need to modify or cancel your order?</p>
                <p className="mt-1 leading-relaxed">
                  Please call the restaurant directly at{" "}
                  <a href={restaurant.phoneUrl} className="font-bold underline hover:text-amber-900">
                    {restaurant.phone}
                  </a>{" "}
                  with your order number <span className="font-mono font-bold">{order.orderNumber}</span>.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between items-center">
              <Link href="/" className="btn-outline w-full sm:w-auto justify-center text-xs">
                Back to Home
              </Link>
              <Link href="/menu" className="btn-primary w-full sm:w-auto justify-center text-xs flex items-center gap-1.5">
                Order Something Else <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

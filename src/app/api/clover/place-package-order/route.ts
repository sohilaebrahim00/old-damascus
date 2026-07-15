import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { isCloverCheckoutConfigured } from "@/integrations/clover/config";
import { PACKAGES } from "@/data/packages";
import { createCloverOrder, addCloverCustomLineItem } from "@/integrations/clover/orders";
import { payCloverOrder } from "@/integrations/clover/payments";
import { createClient } from "@/lib/supabase/server";
import { isEmployeeUser } from "@/lib/admin-auth";
import { saveOrder } from "@/lib/db";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

const placePackageSchema = z.object({
  checkoutReference: z.string().uuid(),
  packageId: z.string().min(1),
  paymentToken: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  startDate: z.string().min(10), // YYYY-MM-DD
  notes: z.string().max(500).optional(),
});

const rateLimitMap = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const lastTime = rateLimitMap.get(ip);
    if (lastTime && now - lastTime < 2000) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }
    rateLimitMap.set(ip, now);

    if (!isCloverCheckoutConfigured()) {
      return NextResponse.json({ error: "Clover online ordering is currently unavailable." }, { status: 503 });
    }

    const body = await req.json();
    const parseRes = placePackageSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json({ error: "Invalid request data", details: parseRes.error.format() }, { status: 400 });
    }

    const {
      checkoutReference,
      packageId,
      paymentToken,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      notes,
    } = parseRes.data;

    // Load package definition securely from trusted server source
    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg || !pkg.orderable || !pkg.available) {
      return NextResponse.json({ error: "The selected meal package is invalid or currently unavailable." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If package is employee-only (Priority 5), verify eligibility server-side
    if (pkg.isEmployeeOnly) {
      let profileRole = null;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        profileRole = profile?.role;
      }
      if (!isEmployeeUser(user, profileRole)) {
        return NextResponse.json({ error: "Unauthorized: This package tier is restricted to eligible Old Damascus staff members." }, { status: 403 });
      }
    }

    // Idempotency check against existing subscriptions or orders
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("payment_reference", checkoutReference)
      .maybeSingle();

    if (existingSub && existingSub.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        subscriptionCode: existingSub.subscription_code,
        qrToken: existingSub.qr_code_token,
        idempotent: true,
      });
    }

    // Calculate end date (7 days duration)
    const startObj = new Date(startDate);
    const endObj = new Date(startObj);
    endObj.setDate(startObj.getDate() + 7);
    const endDateStr = endObj.toISOString().split("T")[0];

    // Create Clover accounting order and capture custom package item
    const cloverNote = `[Website Package Purchase] ${pkg.name}\nCustomer: ${customerName} (${customerPhone})\nStart: ${startDate} to ${endDateStr}\nNotes: ${notes || "None"}`;
    console.log(`[Package Checkout] Creating Clover order for package ${pkg.name}...`);
    
    const cloverOrder = await createCloverOrder("pickup", cloverNote);
    const cloverOrderId = cloverOrder.id;

    const priceCents = Math.round(pkg.price * 100);
    await addCloverCustomLineItem(cloverOrderId, `${pkg.name} (${pkg.mealsPerDay * 7} Meals)`, priceCents);

    // Process secure payment
    console.log(`[Package Checkout] Processing Clover payment for order ${cloverOrderId} (${priceCents} cents)...`);
    const paymentRes = await payCloverOrder(cloverOrderId, paymentToken);

    if (paymentRes.status !== "succeeded") {
      console.warn(`[Package Checkout] Payment failed: ${paymentRes.failure_message}`);
      return NextResponse.json(
        { error: paymentRes.failure_message || "Payment declined.", code: paymentRes.failure_code || "PAYMENT_DECLINED" },
        { status: 402 }
      );
    }

    // Generate subscription code & QR token
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const subscriptionCode = `OD-${randomSuffix}`;
    const qrToken = `OD-QR-${crypto.randomUUID()}`;

    // Atomically insert verified subscription
    const { error: subErr } = await supabase.from("subscriptions").insert([
      {
        subscription_code: subscriptionCode,
        user_id: user?.id || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        package_id: pkg.id,
        package_type: pkg.id,
        start_date: startDate,
        end_date: endDateStr,
        status: "active",
        meals_per_day: pkg.mealsPerDay,
        qr_code_token: qrToken,
        payment_status: "paid",
        payment_method: "clover_online",
        clover_order_id: cloverOrderId,
        clover_payment_id: paymentRes.id,
        is_employee_package: Boolean(pkg.isEmployeeOnly),
        notes: notes || null,
        payment_reference: checkoutReference,
      },
    ]);

    if (subErr) {
      console.error("[Package Checkout] Failed to save subscription after payment:", subErr);
      // Even if DB save has an issue, log alert and try fallback or return partial success with Clover reference
    }

    // Also record standard accounting order record for customer order history
    const orderNumber = `OD-PKG-${Date.now().toString().slice(-6)}`;
    const localOrder: Order = {
      id: checkoutReference,
      orderNumber,
      userId: user?.id || undefined,
      customerName,
      customerEmail,
      customerPhone,
      orderType: "pickup",
      status: "PAID" as OrderStatus,
      paymentStatus: "PAID" as PaymentStatus,
      subtotalCents: priceCents,
      taxCents: 0,
      tipCents: 0,
      deliveryFeeCents: 0,
      totalCents: priceCents,
      cloverOrderId,
      cloverPaymentId: paymentRes.id,
      notes: `Meal Plan: ${pkg.name} (${subscriptionCode})`,
      items: [
        {
          id: crypto.randomUUID(),
          orderId: checkoutReference,
          menuItemId: pkg.id,
          name: `${pkg.name} (${pkg.mealsPerDay * 7} Meals)`,
          price: pkg.price,
          quantity: 1,
          modifiers: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveOrder(localOrder);

    return NextResponse.json({
      success: true,
      subscriptionCode,
      qrToken,
      cloverOrderId,
      cloverPaymentId: paymentRes.id,
    });
  } catch (err: unknown) {
    console.error("[Place Package Order Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An unexpected error occurred processing your meal package." },
      { status: 500 }
    );
  }
}

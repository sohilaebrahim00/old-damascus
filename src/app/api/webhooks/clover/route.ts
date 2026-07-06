import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCloverConfig } from "@/integrations/clover/config";
import { getCloverOrderDetails } from "@/integrations/clover/orders";
import { updateOrder } from "@/lib/db";
import type { OrderStatus, PaymentStatus } from "@/types";

interface LocalCloverOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

// In-memory processed event log for deduplication
const processedEventIds = new Set<string>();

/**
 * GET Handler: Handles the Clover Developer Portal webhook validation handshake.
 * Clover sends a GET request with a verificationCode query parameter.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const verificationCode = searchParams.get("verificationCode");

  if (verificationCode) {
    console.log(`[Clover Webhook GET] Webhook verification handshake successful. Code: ${verificationCode}`);
    return new Response(verificationCode, { status: 200 });
  }

  return new Response("Old Damascus Clover Webhook Endpoint", { status: 200 });
}

/**
 * POST Handler: Handles incoming Clover webhook notifications (payment, order state, etc.).
 */
export async function POST(req: Request) {
  const cfg = getCloverConfig();
  const rawBody = await req.text();

  try {
    // 1. Signature Verification
    if (cfg.webhookSecret) {
      const signature = req.headers.get("x-clover-signature");
      const hmac = crypto.createHmac("sha256", cfg.webhookSecret);
      hmac.update(rawBody);
      const expectedSignature = hmac.digest("hex");

      if (expectedSignature !== signature) {
        console.warn("[Clover Webhook] Signature verification failed.");
        return NextResponse.json(
          { error: "Invalid signature verification" },
          { status: 401 }
        );
      }
    } else {
      console.log("[Clover Webhook] Webhook secret not configured; bypassing signature verification.");
    }

    // 2. Parse payload
    const payload = JSON.parse(rawBody);
    const eventId = payload.eventInfo?.eventId;
    const eventType = payload.eventInfo?.eventType;

    if (!eventId || !eventType) {
      return NextResponse.json(
        { error: "Missing event metadata" },
        { status: 400 }
      );
    }

    // 3. Event Deduplication
    if (processedEventIds.has(eventId)) {
      console.log(`[Clover Webhook] Deduplicated event: ${eventId}`);
      return NextResponse.json({ received: true, deduplicated: true });
    }
    processedEventIds.add(eventId);
    // Limit log size to prevent leaks
    if (processedEventIds.size > 5000) {
      processedEventIds.clear();
    }

    console.log(`[Clover Webhook] Processing event: ${eventType} (Event ID: ${eventId})`);

    // 4. Handle events (e.g. PAYMENT, ORDER_UPDATE)
    // Clover payloads typically refer to modified entity IDs in details/context
    // For payments/orders, we look at the modified cloverOrderId
    const cloverOrderId = payload.eventInfo?.cloverOrderId || payload.eventInfo?.orderId;

    if (cloverOrderId) {
      // Fetch fresh order details from Clover to reconcile state
      try {
        const cloverOrderDetails = await getCloverOrderDetails(cloverOrderId);
        
        // Find local order mapped to this cloverOrderId
        // For local storage search, we check by searching details
        // We'll write a helper or query local DB
        // Let's assume we can fetch the order. Since we store cloverOrderId inside the order,
        // let's fetch using a db helper or lookup.
        // Wait, we can implement getOrderByCloverOrderId or query the database.
        // Let's query by cloverOrderId. Let's add a search function or find it in DB.
        // Wait, since we have the cloverOrderId, let's implement database lookup by cloverOrderId.
        // Let's check how we can fetch it. If we use Supabase, we can select eq("clover_order_id", cloverOrderId).
        // Let's write a lookup function inside db.ts!
        const localOrder = await getOrderByCloverId(cloverOrderId);

        if (localOrder) {
          console.log(`[Clover Webhook] Reconciling order ${localOrder.orderNumber} with Clover state.`);
          
          let nextStatus: OrderStatus | undefined;
          let nextPaymentStatus: PaymentStatus | undefined;

          // Reconcile status based on Clover Order State
          if (cloverOrderDetails.state === "locked" || cloverOrderDetails.state === "paid") {
            nextPaymentStatus = "PAID";
            nextStatus = "PAID";
          } else if (cloverOrderDetails.state === "open") {
            // Keep status
          }

          if (nextStatus || nextPaymentStatus) {
            await updateOrder(localOrder.id, {
              status: nextStatus || localOrder.status,
              paymentStatus: nextPaymentStatus || localOrder.paymentStatus,
            });
            console.log(`[Clover Webhook] Order ${localOrder.orderNumber} updated successfully.`);
          }
        }
      } catch (err) {
        console.error(`[Clover Webhook Sync] Error reconciling order ${cloverOrderId}:`, err);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Clover Webhook Error]:", err);
    return NextResponse.json(
      { error: "Webhook event processing failed" },
      { status: 500 }
    );
  }
}

// Inline DB lookup helper by Clover Order ID
async function getOrderByCloverId(cloverOrderId: string): Promise<LocalCloverOrder | null> {
  const { supabaseAdmin } = await import("@/lib/db");
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("id, order_number, status, payment_status")
        .eq("clover_order_id", cloverOrderId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          orderNumber: data.order_number,
          status: data.status as OrderStatus,
          paymentStatus: data.payment_status as PaymentStatus,
        };
      }
    } catch {}
  }

  // Fallback to local JSON search
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const localDbPath = path.join(process.cwd(), "scratch", "db_orders.json");
    const content = await fs.readFile(localDbPath, "utf-8");
    const orders = JSON.parse(content || "{}") as Record<string, {
      id: string;
      orderNumber: string;
      status: OrderStatus;
      paymentStatus: PaymentStatus;
      cloverOrderId?: string;
    }>;
    const found = Object.values(orders).find((o) => o.cloverOrderId === cloverOrderId);
    if (!found) return null;
    return {
      id: found.id,
      orderNumber: found.orderNumber,
      status: found.status,
      paymentStatus: found.paymentStatus,
    };
  } catch {
    return null;
  }
}

import { NextResponse } from "next/server";
import { getCloverConfig, isCloverCheckoutConfigured } from "@/integrations/clover/config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customer, orderType } = body;

    if (!isCloverCheckoutConfigured()) {
      return NextResponse.json(
        { error: "Clover Hosted Checkout is not currently configured." },
        { status: 400 }
      );
    }

    const config = getCloverConfig();

    // Revalidate items and calculate totals on the server
    // (In production, load prices from Clover/DB and calculate securely)
    const lineItems = items.map((item: { name: string; price: number; quantity: number }) => ({
      name: item.name || "Menu Item",
      price: Math.round(item.price * 100), // convert float to cents
      quantity: item.quantity,
    }));

    // Create Clover Hosted Checkout Session
    // Endpoint: POST /v1/checkout
    const payload = {
      customer: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
      },
      shoppingCart: {
        lineItems,
      },
      merchantPageConfig: {
        returnUrl: config.returnUrl,
        cancelUrl: config.cancelUrl,
      },
    };

    console.log("[Clover Checkout] Initiating session:", payload);

    // Call Clover Ecommerce API to generate checkout session
    const response = await fetch(`${config.ecomBase}/v1/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const sessionData = await response.json();

    if (!response.ok) {
      throw new Error(sessionData.message || "Failed to create checkout session.");
    }

    return NextResponse.json({
      checkoutUrl: sessionData.href,
      order: {
        id: sessionData.id,
        status: "PENDING_PAYMENT",
        orderType,
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
    });
  } catch (err) {
    console.error("[Clover Checkout Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

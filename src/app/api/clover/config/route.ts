import { NextResponse } from "next/server";
import { getCloverConfig, isCloverCheckoutConfigured } from "@/integrations/clover/config";

export async function GET() {
  try {
    const cfg = getCloverConfig();
    return NextResponse.json({
      merchantId: cfg.merchantId || null,
      publicKey: cfg.ecomPublicKey || null,
      environment: cfg.environment || "sandbox",
      directOrderingEnabled: isCloverCheckoutConfigured(),
    });
  } catch (err: unknown) {
    console.error("[Clover Public Config API Error]:", err);
    return NextResponse.json(
      { error: "Failed to retrieve Clover configurations." },
      { status: 500 }
    );
  }
}

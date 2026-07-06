// ============================================================
// Clover Payment Operations (Ecommerce API)
// Server-side only.
// ============================================================

import { cloverEcomFetch } from "./client";

export interface CloverPaymentResponse {
  id: string;
  status: "succeeded" | "failed" | "pending";
  amount: number; // cents
  currency: string;
  charge?: string;
  outcome?: {
    network_status?: string;
    type?: string;
    seller_message?: string;
  };
  failure_message?: string;
  failure_code?: string;
}

/**
 * Pay for an existing Clover V3 order using a card token from the hosted iframe.
 * Endpoint: POST /v1/orders/{orderId}/pay
 */
export async function payCloverOrder(
  orderId: string,
  sourceToken: string
): Promise<CloverPaymentResponse> {
  return cloverEcomFetch<CloverPaymentResponse>(`/v1/orders/${orderId}/pay`, {
    method: "POST",
    body: JSON.stringify({
      source: sourceToken,
    }),
  });
}

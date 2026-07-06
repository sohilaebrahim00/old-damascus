// ============================================================
// Clover Order Operations
// Server-side only.
// ============================================================

import { cloverFetch, cloverPost, cloverDelete } from "./client";
import { getCloverConfig } from "./config";
import type { CloverOrder } from "./types";

/**
 * Creates an empty open order on Clover
 */
export async function createCloverOrder(
  orderType: "pickup" | "delivery",
  note?: string
): Promise<CloverOrder> {
  const cfg = getCloverConfig();
  const typeId =
    orderType === "pickup" ? cfg.pickupOrderTypeId : cfg.deliveryOrderTypeId;

  const payload: Record<string, unknown> = {
    state: "open",
  };

  if (typeId) {
    payload.orderType = { id: typeId };
  }

  if (note) {
    payload.note = note;
  }

  return cloverPost<CloverOrder>("/orders", payload);
}

/**
 * Adds a single line item to a Clover order
 */
export async function addCloverLineItem(
  orderId: string,
  itemId: string
): Promise<{ id: string; name: string; price: number }> {
  return cloverPost<{ id: string; name: string; price: number }>(
    `/orders/${orderId}/line_items`,
    {
      item: { id: itemId },
    }
  );
}

/**
 * Adds a modifier/modification to a specific line item in a Clover order
 */
export async function addCloverModification(
  orderId: string,
  lineItemId: string,
  modifierId: string
): Promise<unknown> {
  return cloverPost<unknown>(
    `/orders/${orderId}/line_items/${lineItemId}/modifications`,
    {
      modifier: { id: modifierId },
    }
  );
}

/**
 * Retrieves the full Clover order details with expansions
 */
export async function getCloverOrderDetails(
  orderId: string
): Promise<CloverOrder> {
  return cloverFetch<CloverOrder>(
    `/orders/${orderId}?expand=lineItems,lineItems.modifications,lineItems.taxRates,customers`
  );
}

/**
 * Deletes a Clover order (used for clean up after a preview session)
 */
export async function deleteCloverOrder(orderId: string): Promise<void> {
  return cloverDelete<void>(`/orders/${orderId}`);
}

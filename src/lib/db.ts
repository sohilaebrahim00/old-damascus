import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

interface DbOrderItemModifier {
  modifier_id: string;
  clover_modifier_id?: string;
  name: string;
  additional_price_cents: number;
}

interface DbOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  clover_item_id?: string;
  name: string;
  price_cents: number;
  quantity: number;
  special_instructions?: string;
  modifiers?: DbOrderItemModifier[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Create server-side Supabase client with admin/service capabilities if key is available
export const supabaseAdmin =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

const LOCAL_DB_PATH = path.join(process.cwd(), "scratch", "db_orders.json");

// Helper to ensure local database folder and file exist
async function ensureLocalDb() {
  try {
    await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
    try {
      await fs.access(LOCAL_DB_PATH);
    } catch {
      await fs.writeFile(LOCAL_DB_PATH, JSON.stringify({}, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[Local DB Helper] Failed to ensure database file:", err);
  }
}

// Read all orders from local database file
async function readLocalOrders(): Promise<Record<string, Order>> {
  await ensureLocalDb();
  try {
    const content = await fs.readFile(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("[Local DB Helper] Failed to read database:", err);
    return {};
  }
}

// Write orders to local database file
async function writeLocalOrders(orders: Record<string, Order>): Promise<void> {
  await ensureLocalDb();
  try {
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("[Local DB Helper] Failed to write database:", err);
  }
}

/**
 * Save an order to the active database (Supabase or local JSON file fallback).
 */
export async function saveOrder(order: Order): Promise<void> {
  console.log(`[DB] Saving order ${order.orderNumber} (ID: ${order.id})`);

  if (supabaseAdmin) {
    try {
      // 1. Insert order metadata
      const { error: orderError } = await supabaseAdmin.from("orders").insert({
        id: order.id,
        order_number: order.orderNumber,
        user_id: order.userId || null,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        order_type: order.orderType,
        status: order.status,
        payment_status: order.paymentStatus,
        subtotal_cents: order.subtotalCents,
        tax_cents: order.taxCents,
        tip_cents: order.tipCents,
        delivery_fee_cents: order.deliveryFeeCents,
        total_cents: order.totalCents,
        clover_order_id: order.cloverOrderId || null,
        clover_payment_id: order.cloverPaymentId || null,
        pickup_time: order.pickupTime || null,
        delivery_address: order.deliveryAddress || null,
        notes: order.notes || null,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      });

      if (orderError) throw orderError;

      // 2. Insert order items and modifiers
      for (const item of order.items) {
        const { data: itemData, error: itemError } = await supabaseAdmin
          .from("order_items")
          .insert({
            order_id: order.id,
            menu_item_id: item.menuItemId || null,
            clover_item_id: item.cloverItemId || null,
            name: item.name,
            price_cents: Math.round(item.price * 100),
            quantity: item.quantity,
            special_instructions: item.specialInstructions || null,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        if (item.modifiers && item.modifiers.length > 0) {
          const modInserts = item.modifiers.map((mod) => ({
            order_item_id: itemData.id,
            modifier_id: mod.modifierId || null,
            clover_modifier_id: mod.cloverModifierId || null,
            name: mod.name,
            additional_price_cents: Math.round(mod.additionalPrice * 100),
          }));

          const { error: modError } = await supabaseAdmin
            .from("order_item_modifiers")
            .insert(modInserts);

          if (modError) throw modError;
        }
      }

      console.log(`[DB] Order ${order.orderNumber} successfully saved to Supabase.`);
      return;
    } catch (err) {
      console.error("[DB] Supabase save failed, falling back to local storage:", err);
    }
  }

  // Local JSON store fallback
  const orders = await readLocalOrders();
  orders[order.id] = order;
  await writeLocalOrders(orders);
  console.log(`[DB] Order ${order.orderNumber} successfully saved to local file.`);
}

/**
 * Retrieve an order by its ID or secure reference.
 */
export async function getOrder(id: string): Promise<Order | null> {
  console.log(`[DB] Fetching order with ID: ${id}`);

  if (supabaseAdmin) {
    try {
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            modifiers:order_item_modifiers(*)
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (orderError) throw orderError;

      if (orderData) {
        // Map database fields to the clean internal Order interface
        return {
          id: orderData.id,
          orderNumber: orderData.order_number,
          userId: orderData.user_id,
          customerName: orderData.customer_name,
          customerEmail: orderData.customer_email,
          customerPhone: orderData.customer_phone,
          orderType: orderData.order_type,
          status: orderData.status as OrderStatus,
          paymentStatus: orderData.payment_status as PaymentStatus,
          subtotalCents: orderData.subtotal_cents,
          taxCents: orderData.tax_cents,
          tipCents: orderData.tip_cents,
          deliveryFeeCents: orderData.delivery_fee_cents,
          totalCents: orderData.total_cents,
          cloverOrderId: orderData.clover_order_id,
          cloverPaymentId: orderData.clover_payment_id,
          pickupTime: orderData.pickup_time,
          deliveryAddress: orderData.delivery_address,
          notes: orderData.notes,
          createdAt: orderData.created_at,
          updatedAt: orderData.updated_at,
          items: ((orderData.items as unknown as DbOrderItem[]) ?? []).map((item) => ({
            id: item.id,
            orderId: item.order_id,
            menuItemId: item.menu_item_id,
            cloverItemId: item.clover_item_id,
            name: item.name,
            price: item.price_cents / 100,
            quantity: item.quantity,
            specialInstructions: item.special_instructions,
            modifiers: (item.modifiers ?? []).map((mod) => ({
              modifierId: mod.modifier_id,
              cloverModifierId: mod.clover_modifier_id,
              name: mod.name,
              additionalPrice: mod.additional_price_cents / 100,
            })),
          })),
        };
      }
    } catch (err) {
      console.error("[DB] Supabase query failed, checking local storage:", err);
    }
  }

  // Check local database fallback
  const orders = await readLocalOrders();
  return orders[id] || null;
}

/**
 * Retrieve an order by its customer-facing Order Number.
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  console.log(`[DB] Fetching order by Number: ${orderNumber}`);

  if (supabaseAdmin) {
    try {
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .select(`
          *,
          items:order_items(
            *,
            modifiers:order_item_modifiers(*)
          )
        `)
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (orderError) throw orderError;

      if (orderData) {
        return {
          id: orderData.id,
          orderNumber: orderData.order_number,
          userId: orderData.user_id,
          customerName: orderData.customer_name,
          customerEmail: orderData.customer_email,
          customerPhone: orderData.customer_phone,
          orderType: orderData.order_type,
          status: orderData.status as OrderStatus,
          paymentStatus: orderData.payment_status as PaymentStatus,
          subtotalCents: orderData.subtotal_cents,
          taxCents: orderData.tax_cents,
          tipCents: orderData.tip_cents,
          deliveryFeeCents: orderData.delivery_fee_cents,
          totalCents: orderData.total_cents,
          cloverOrderId: orderData.clover_order_id,
          cloverPaymentId: orderData.clover_payment_id,
          pickupTime: orderData.pickup_time,
          deliveryAddress: orderData.delivery_address,
          notes: orderData.notes,
          createdAt: orderData.created_at,
          updatedAt: orderData.updated_at,
          items: ((orderData.items as unknown as DbOrderItem[]) ?? []).map((item) => ({
            id: item.id,
            orderId: item.order_id,
            menuItemId: item.menu_item_id,
            cloverItemId: item.clover_item_id,
            name: item.name,
            price: item.price_cents / 100,
            quantity: item.quantity,
            specialInstructions: item.special_instructions,
            modifiers: (item.modifiers ?? []).map((mod) => ({
              modifierId: mod.modifier_id,
              cloverModifierId: mod.clover_modifier_id,
              name: mod.name,
              additionalPrice: mod.additional_price_cents / 100,
            })),
          })),
        };
      }
    } catch (err) {
      console.error("[DB] Supabase query by number failed, checking local storage:", err);
    }
  }

  const orders = await readLocalOrders();
  const found = Object.values(orders).find((o) => o.orderNumber === orderNumber);
  return found || null;
}

/**
 * Update an order's state or attributes.
 */
export async function updateOrder(
  id: string,
  updates: Partial<Order>
): Promise<void> {
  console.log(`[DB] Updating order ${id}:`, updates);

  if (supabaseAdmin) {
    try {
      const dbUpdates: Record<string, string | undefined> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.cloverOrderId) dbUpdates.clover_order_id = updates.cloverOrderId;
      if (updates.cloverPaymentId) dbUpdates.clover_payment_id = updates.cloverPaymentId;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabaseAdmin
        .from("orders")
        .update(dbUpdates)
        .eq("id", id);

      if (!error) {
        console.log(`[DB] Order ${id} updated in Supabase.`);
        return;
      }
      throw error;
    } catch (err) {
      console.error("[DB] Supabase update failed, updating local database:", err);
    }
  }

  // Local JSON store fallback
  const orders = await readLocalOrders();
  if (orders[id]) {
    orders[id] = {
      ...orders[id],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeLocalOrders(orders);
    console.log(`[DB] Order ${id} updated in local database.`);
  }
}

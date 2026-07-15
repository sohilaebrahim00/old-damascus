/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isAdmin = isAdminUser(user);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
        customer_name, customer_phone, customer_email, 
        items, order_type, subtotal_cents, tax_cents, total_cents,
        subscription_id, apply_meal_credit
    } = body;

    // Generate Order Number
    const order_number = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number,
        customer_name: customer_name || "Walk-in Guest",
        customer_email: customer_email || "guest@olddamascus.com",
        customer_phone: customer_phone || "000-000-0000",
        order_type: order_type || "dine_in",
        status: "ACCEPTED", // POS orders go straight to accepted
        payment_status: apply_meal_credit ? "PAID" : "UNPAID",
        subtotal_cents: apply_meal_credit ? 0 : subtotal_cents,
        tax_cents: apply_meal_credit ? 0 : tax_cents,
        total_cents: apply_meal_credit ? 0 : total_cents,
        order_source: subscription_id ? 'subscription' : 'walk_in',
        accepted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError || !order) throw orderError || new Error("Failed to create order");

    // 2. Create Order Items
    const orderItemsToInsert = items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      price_cents: item.price_cents,
      quantity: item.quantity,
      special_instructions: item.notes || null,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert)
      .select();

    if (itemsError) throw itemsError;

    // We skip modifiers insertion here for simplicity in the POS MVP, 
    // but structure is ready.

    // 3. Deduct meal if requested
    if (subscription_id && apply_meal_credit) {
        // Insert a meal checkin
        await supabase.from("meal_checkins").insert({
            subscription_id: subscription_id,
            checkin_date: new Date().toISOString().split('T')[0],
            meal_number: 1, // simplified assumption for POS
            served_at: new Date().toISOString(),
            served_by: 'POS',
            notes: `Order #${order_number}`
        });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("POS Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process POS order" },
      { status: 500 }
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isAdmin = isAdminUser(user);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, action } = body;

    const updateData: any = {};
    const now = new Date().toISOString();

    if (action === 'status') {
      updateData.status = status;
      if (status === 'ACCEPTED') updateData.accepted_at = now;
      if (status === 'PREPARING') updateData.preparing_at = now;
      if (status === 'READY') updateData.ready_at = now;
      if (status === 'COMPLETED') updateData.completed_at = now;
      if (status === 'CANCELLED') updateData.cancelled_at = now;
    } else if (action === 'delay') {
        const { delayMinutes } = body;
        
        // Fetch current order to get existing estimated_ready_time or use now
        const { data: order } = await supabase.from("orders").select("estimated_ready_time").eq("id", id).single();
        const baseTime = order?.estimated_ready_time ? new Date(order.estimated_ready_time) : new Date();
        baseTime.setMinutes(baseTime.getMinutes() + delayMinutes);
        
        updateData.estimated_ready_time = baseTime.toISOString();
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

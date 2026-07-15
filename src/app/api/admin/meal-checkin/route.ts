import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminUser, isEmployeeUser } from "@/lib/admin-auth";
import { createCloverOrder, addCloverCustomLineItem } from "@/integrations/clover/orders";
import { isCloverCheckoutConfigured } from "@/integrations/clover/config";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profileRole = null;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      profileRole = profile?.role;
    }

    if (!isAdminUser(user) && !isEmployeeUser(user, profileRole)) {
      return NextResponse.json({ error: "Unauthorized: Admin or Staff role required." }, { status: 401 });
    }

    const formData = await request.formData();
    const subscription_id = formData.get("subscription_id") as string;
    const meal_number = parseInt(formData.get("meal_number") as string, 10);
    const token = formData.get("token") as string;
    const query = formData.get("query") as string;

    if (!subscription_id || !meal_number || isNaN(meal_number)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Lookup subscription details to verify active state and get customer info for POS ticket
    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .single();

    if (subErr || !sub) {
      return NextResponse.json({ error: "Subscription record not found." }, { status: 404 });
    }

    if (sub.status !== "active") {
      return NextResponse.json({ error: `Cannot check in: Subscription status is '${sub.status}'.` }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Create a $0.00 Pre-Paid Redemption accounting ticket in Clover POS (if configured)
    let cloverOrderId: string | null = null;
    if (isCloverCheckoutConfigured()) {
      try {
        const ticketNote = `[Meal Redemption] Code #${sub.subscription_code}\nCustomer: ${sub.customer_name} (${sub.customer_phone})\nCheck-in Date: ${today} (Meal #${meal_number})\nLogged by: ${user?.email || "Staff"}`;
        console.log(`[Meal Check-in] Creating $0.00 Clover POS ticket for ${sub.subscription_code}...`);
        const orderRes = await createCloverOrder("pickup", ticketNote);
        cloverOrderId = orderRes.id;

        await addCloverCustomLineItem(
          cloverOrderId,
          `Pre-Paid Meal #${meal_number} Redemption (${sub.package_type})`,
          0 // $0.00 price so total remains $0 and avoids double revenue accounting
        );
        console.log(`[Meal Check-in] Clover POS accounting ticket created: ${cloverOrderId}`);
      } catch (cloverErr) {
        console.error(`[Meal Check-in] Warning: Could not create Clover POS ticket:`, cloverErr);
        // Continue with database check-in even if Clover connection glitches, preserving customer service speed
      }
    }

    // 2. Insert check-in record into Supabase linked to Clover order ID
    const { error } = await supabase
      .from("meal_checkins")
      .insert([
        {
          subscription_id,
          checkin_date: today,
          meal_number,
          served_by: user?.email || "Staff",
          clover_order_id: cloverOrderId,
        }
      ]);

    if (error) {
        if (error.code === '23505') {
            // Unique violation (meal already checked in today)
        } else {
            console.error("Check-in error:", error);
            throw error;
        }
    }

    // Redirect back to the checkin page with the same search params to refresh the UI
    let url = `/admin/meal-checkin`;
    if (token) {
        url += `?token=${encodeURIComponent(token)}`;
    } else if (query) {
        url += `?query=${encodeURIComponent(query)}`;
    }

    return NextResponse.redirect(new URL(url, request.url), 303);
    
  } catch (error) {
    console.error("Meal check-in error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}

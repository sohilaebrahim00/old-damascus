import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isAdmin = user?.email === process.env.ADMIN_NOTIFICATION_EMAIL || user?.app_metadata?.role === 'admin' || user;
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;
    
    if (action === "create") {
      const customer_name = formData.get("customer_name") as string;
      const customer_phone = formData.get("customer_phone") as string;
      const customer_email = formData.get("customer_email") as string;
      const package_type = formData.get("package_type") as string;
      const payment_status = formData.get("payment_status") as string;
      const payment_method = formData.get("payment_method") as string;
      const start_date = formData.get("start_date") as string;
      const notes = formData.get("notes") as string;

      if (!customer_name || !customer_phone || !package_type || !start_date) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Generate a simple secure token for the QR code
      const qr_code_token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      // Calculate end date based on package (assume 7 days)
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + 6); // 7 days inclusive
      const end_date = endDateObj.toISOString().split('T')[0];

      // Get next OD- sequence
      let subscription_code = "OD-1000";
      const { data: latest } = await supabase.from("subscriptions").select("subscription_code").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (latest && latest.subscription_code && latest.subscription_code.startsWith("OD-")) {
          const num = parseInt(latest.subscription_code.replace("OD-", ""), 10);
          if (!isNaN(num)) {
              subscription_code = `OD-${num + 1}`;
          }
      }

      const { error } = await supabase.from("subscriptions").insert([{
          subscription_code,
          customer_name,
          customer_phone,
          customer_email: customer_email || null,
          package_type,
          start_date,
          end_date,
          status: 'active',
          meals_per_day: package_type === 'two_meals_daily' ? 2 : 1,
          qr_code_token,
          payment_status,
          payment_method,
          notes: notes || null
      }]);

      if (error) throw error;
      return NextResponse.redirect(new URL("/admin/subscriptions", request.url), 303);
    }

    const subscription_id = formData.get("subscription_id") as string;

    if (!action || !subscription_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "mark_paid") {
      const { error } = await supabase
        .from("subscriptions")
        .update({ payment_status: "paid" })
        .eq("id", subscription_id);
      
      if (error) throw error;
    } else if (action === "cancel") {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscription_id);
      
      if (error) throw error;
    } else if (action === "reactivate") {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("id", subscription_id);
      
      if (error) throw error;
    } else if (action === "extend") {
        // Fetch current end_date
        const { data: sub, error: fetchErr } = await supabase
            .from("subscriptions")
            .select("end_date")
            .eq("id", subscription_id)
            .single();
            
        if (fetchErr || !sub) throw fetchErr || new Error("Not found");
        
        // Add 7 days
        const endDate = new Date(sub.end_date);
        endDate.setDate(endDate.getDate() + 7);
        const newEndDate = endDate.toISOString().split('T')[0];

        const { error } = await supabase
            .from("subscriptions")
            .update({ end_date: newEndDate, status: 'active' }) // Ensure active if they extend
            .eq("id", subscription_id);
      
        if (error) throw error;
    } else if (action === "extend_month") {
        // Fetch current end_date
        const { data: sub, error: fetchErr } = await supabase
            .from("subscriptions")
            .select("end_date")
            .eq("id", subscription_id)
            .single();
            
        if (fetchErr || !sub) throw fetchErr || new Error("Not found");
        
        // Add 30 days
        const endDate = new Date(sub.end_date);
        endDate.setDate(endDate.getDate() + 30);
        const newEndDate = endDate.toISOString().split('T')[0];

        const { error } = await supabase
            .from("subscriptions")
            .update({ end_date: newEndDate, status: 'active' })
            .eq("id", subscription_id);
      
        if (error) throw error;
    }

    return NextResponse.redirect(new URL("/admin/subscriptions", request.url), 303);
    
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Failed to process update" },
      { status: 500 }
    );
  }
}

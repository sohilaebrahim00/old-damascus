import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type LeadType = "contact" | "package_inquiry" | "catering";

export interface LeadData {
  type: LeadType;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  notes?: string;
  packageId?: string;
  startDate?: string;
  eventDate?: string;
  guestCount?: string;
  subject?: string;
}

export async function processLead(data: LeadData) {
  let supabaseSuccess = false;
  let resendSuccess = false;

  // 1. Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("leads").insert({
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message || data.notes,
        package_id: data.packageId,
        event_date: data.eventDate || data.startDate,
        guest_count: data.guestCount,
        subject: data.subject,
        source: "website",
      });
      if (!error) {
        supabaseSuccess = true;
      } else {
        console.error("[LeadManager] Supabase insert error:", error);
      }
    } catch (e) {
      console.error("[LeadManager] Supabase lead insert failed:", e);
    }
  }

  // 2. Try Resend Email (Fallback/Notification)
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  
  if (resendApiKey && adminEmail) {
    try {
      const displayType = data.type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Old Damascus <onboarding@resend.dev>", // Using testing domain for safety unless verified
          to: adminEmail,
          subject: `New Lead: ${displayType} from ${data.name}`,
          html: `
            <h2>New ${displayType} Form Submission</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ""}
            ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ""}
            ${data.message || data.notes ? `<p><strong>Message:</strong> ${data.message || data.notes}</p>` : ""}
            ${data.packageId ? `<p><strong>Package:</strong> ${data.packageId}</p>` : ""}
            ${data.startDate ? `<p><strong>Start Date:</strong> ${data.startDate}</p>` : ""}
            ${data.eventDate ? `<p><strong>Event Date:</strong> ${data.eventDate}</p>` : ""}
            ${data.guestCount ? `<p><strong>Guests:</strong> ${data.guestCount}</p>` : ""}
          `,
        }),
      });
      
      if (res.ok) {
        resendSuccess = true;
      } else {
        console.error("[LeadManager] Resend API error:", await res.text());
      }
    } catch (e) {
      console.error("[LeadManager] Resend email failed:", e);
    }
  }

  if (supabaseSuccess || resendSuccess) {
    return { success: true };
  } else {
    return { 
      success: false, 
      error: "Message delivery is not configured yet. Please call us directly." 
    };
  }
}

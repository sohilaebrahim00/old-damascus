import { NextResponse } from "next/server";
import { processLead, LeadData } from "@/lib/lead-manager";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Check honeypot field (bot block)
    if (data.honeypot) {
      return NextResponse.json({ error: "Spam detected." }, { status: 400 });
    }

    const leadData: LeadData = {
      type: "catering",
      name: data.name,
      email: data.email,
      phone: data.phone,
      eventDate: data.eventDate,
      guestCount: data.guestCount,
      message: data.notes,
    };

    const result = await processLead(leadData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Catering request recorded successfully.",
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

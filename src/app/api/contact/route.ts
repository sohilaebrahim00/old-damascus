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
      type: data.type === "Package Inquiry" ? "package_inquiry" : "contact",
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      notes: data.notes,
      packageId: data.packageId,
      startDate: data.startDate,
    };

    const result = await processLead(leadData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Message recorded successfully.",
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

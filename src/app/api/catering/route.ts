import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Check honeypot field (bot block)
    if (data.honeypot) {
      return NextResponse.json({ error: "Spam detected." }, { status: 400 });
    }

    // Since Supabase might not be fully configured yet in development,
    // let's log the catering request and return success.
    console.log("[Catering API] Received request:", data);

    return NextResponse.json({
      success: true,
      message: "Catering request recorded successfully.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

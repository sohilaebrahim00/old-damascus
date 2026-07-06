import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Check honeypot field (bot block)
    if (data.honeypot) {
      return NextResponse.json({ error: "Spam detected." }, { status: 400 });
    }

    console.log("[Contact API] Received contact message:", data);

    return NextResponse.json({
      success: true,
      message: "Message recorded successfully.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

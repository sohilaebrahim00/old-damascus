import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isCloverConfigured } from "@/integrations/clover/config";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    supabaseConfigured: isSupabaseConfigured(),
    cloverConfigured: isCloverConfigured(),
    liveCheckoutEnabled: process.env.NEXT_PUBLIC_ENABLE_LIVE_CHECKOUT === "true"
  });
}

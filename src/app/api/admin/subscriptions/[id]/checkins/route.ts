import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";

export async function GET(
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

    const { data: checkins, error } = await supabase
      .from("meal_checkins")
      .select("*")
      .eq("subscription_id", id)
      .order("served_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ checkins: checkins || [] });
  } catch (error) {
    console.error("Fetch checkins error:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkins" },
      { status: 500 }
    );
  }
}

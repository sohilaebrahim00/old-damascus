import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isAdmin = isAdminUser(user);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const subscription_id = formData.get("subscription_id") as string;
    const meal_number = parseInt(formData.get("meal_number") as string, 10);
    const token = formData.get("token") as string;
    const query = formData.get("query") as string;

    if (!subscription_id || !meal_number || isNaN(meal_number)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from("meal_checkins")
      .insert([
        {
          subscription_id,
          checkin_date: today,
          meal_number,
          served_by: user?.email || "Admin",
        }
      ]);

    if (error) {
        if (error.code === '23505') {
            // Unique violation
            // Do not throw an error, redirect back with success/already checked in notice
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

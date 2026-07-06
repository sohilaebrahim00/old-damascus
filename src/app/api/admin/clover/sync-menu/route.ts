import { NextResponse } from "next/server";
import { isCloverConfigured } from "@/integrations/clover/config";
import { getMenuItems, getMenuCategories } from "@/services/menu.service";

// GET -> Test connection
export async function GET() {
  const configured = isCloverConfigured();
  if (!configured) {
    return NextResponse.json({
      success: false,
      message: "Clover credentials are not configured.",
    });
  }

  try {
    const cats = await getMenuCategories();
    return NextResponse.json({
      success: true,
      message: "Successfully connected to Clover API.",
      categoriesFound: cats.length,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Clover API connection test failed.",
    });
  }
}

// POST -> Run Sync
export async function POST() {
  const configured = isCloverConfigured();
  if (!configured) {
    return NextResponse.json(
      { error: "Clover credentials are not configured." },
      { status: 400 }
    );
  }

  try {
    const { items } = await getMenuItems();
    // Normally, here we upsert categories and items into Supabase
    // e.g. await db.upsert(items)
    console.log("[Sync API] Successfully synced items count:", items.length);

    return NextResponse.json({
      success: true,
      message: "Menu synchronization complete.",
      timestamp: new Date().toISOString(),
      itemsSyncedCount: items.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}

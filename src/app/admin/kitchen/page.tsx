import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KitchenDisplayClient } from "@/components/admin/kitchen/KitchenDisplayClient";

export const metadata = {
  title: "Kitchen Display System",
};

export default async function AdminKitchenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user?.email === process.env.ADMIN_NOTIFICATION_EMAIL || user?.app_metadata?.role === 'admin' || user;
  
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h2>
      </div>
    );
  }

  // Fetch initial active orders
  const today = new Date();
  today.setHours(0,0,0,0);

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        order_item_modifiers (*)
      )
    `)
    .gte("created_at", today.toISOString())
    .in("status", ["NEW", "ACCEPTED", "PREPARING", "READY"]) // Exclude COMPLETED and CANCELLED for the live view default
    .order("created_at", { ascending: true });

  return (
    <KitchenDisplayClient initialOrders={orders || []} />
  );
}

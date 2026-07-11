import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { POSClient } from "@/components/admin/pos/POSClient";

export const metadata = {
  title: "Admin - POS",
};

export default async function AdminPOSPage() {
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

  // Fetch full menu for POS
  const { data: menuCategories } = await supabase.from('menu_categories').select('*').order('sort_order');
  const { data: menuItems } = await supabase.from('menu_items').select('*, menu_item_modifier_groups(menu_modifier_groups(*, menu_modifiers(*)))');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col h-screen overflow-hidden">
        <POSClient categories={menuCategories || []} items={menuItems || []} />
    </div>
  );
}

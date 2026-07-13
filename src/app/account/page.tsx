import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  await supabase.auth.getUser(); // Verify session, ignore user since we don't display it here yet

  // In a real app, you would fetch the user's orders from your database.
  // We'll show an empty state since we're setting this up.
  const orders: unknown[] = [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-olive-dark mb-6">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-brand-sand rounded-xl">
          <p className="text-olive mb-4">You haven&apos;t placed any orders yet.</p>
          <a
            href="/order"
            className="inline-flex items-center justify-center rounded-xl bg-brand-dark px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-lime hover:text-brand-dark transition-all"
          >
            Start an Order
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order items would map here */}
        </div>
      )}
    </div>
  );
}

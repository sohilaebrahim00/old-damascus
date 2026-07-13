import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShoppingBag, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order History & Favorites - Old Damascus",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // In a full implementation, we would fetch real orders and favorites here.
  // For now, we prepare the structure as requested.

  return (
    <div className="space-y-8">
      {/* Active Orders / Recent Orders */}
      <section className="bg-white rounded-2xl shadow-sm border border-brand-sand overflow-hidden">
        <div className="p-6 border-b border-border bg-cream/50">
          <h3 className="font-heading text-xl font-bold text-olive-dark flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-gold" />
            Recent Orders
          </h3>
          <p className="text-sm text-olive mt-1">View your past orders and reorder your favorites.</p>
        </div>
        
        {/* Empty State */}
        <div className="p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-olive/30" />
          </div>
          <h4 className="font-heading text-lg font-semibold text-olive-dark mb-2">No orders yet</h4>
          <p className="text-olive text-sm max-w-sm mb-6">
            Looks like you haven&apos;t placed an order with us yet. Explore our menu to find your new favorite dish!
          </p>
          <Link href="/menu" className="btn-primary">
            Browse Menu
          </Link>
        </div>
      </section>

      {/* Favorites */}
      <section className="bg-white rounded-2xl shadow-sm border border-brand-sand overflow-hidden">
        <div className="p-6 border-b border-border bg-cream/50">
          <h3 className="font-heading text-xl font-bold text-olive-dark flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-gold" />
            My Favorites
          </h3>
          <p className="text-sm text-olive mt-1">Quickly access your most-loved dishes.</p>
        </div>
        
        {/* Empty State */}
        <div className="p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-olive/30" />
          </div>
          <h4 className="font-heading text-lg font-semibold text-olive-dark mb-2">No favorites saved</h4>
          <p className="text-olive text-sm max-w-sm mb-6">
            You can save items to your favorites by clicking the heart icon on any menu item.
          </p>
          <Link href="/menu" className="btn-outline-primary inline-flex items-center gap-2">
            Explore Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

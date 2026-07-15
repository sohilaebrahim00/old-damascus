import { createClient } from "@/lib/supabase/server";
import { QrCode, Utensils } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch active subscriptions for this user
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // For each subscription, fetch meal checkins count to calculate remaining meals
  const subsWithBalance = await Promise.all(
    (subscriptions || []).map(async (sub) => {
      const { count } = await supabase
        .from("meal_checkins")
        .select("*", { count: "exact", head: true })
        .eq("subscription_id", sub.id);

      const totalMeals = (sub.meals_per_day || 1) * 7;
      const usedMeals = count || 0;
      const remainingMeals = Math.max(0, totalMeals - usedMeals);

      return {
        ...sub,
        totalMeals,
        usedMeals,
        remainingMeals,
      };
    })
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-olive-dark mb-6">Profile Details</h1>
        
        <div className="space-y-6 max-w-lg bg-white p-6 rounded-2xl border border-border/60 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-olive-dark">Email</label>
            <div className="mt-1">
              <input
                type="text"
                disabled
                value={user.email || ""}
                className="block w-full rounded-xl border-brand-sand bg-gray-50 py-2.5 px-4 text-olive-dark shadow-sm sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-olive-dark">First Name</label>
            <div className="mt-1">
              <input
                type="text"
                disabled
                value={user.user_metadata?.first_name || ""}
                className="block w-full rounded-xl border-brand-sand bg-gray-50 py-2.5 px-4 text-olive-dark shadow-sm sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-olive-dark">Last Name</label>
            <div className="mt-1">
              <input
                type="text"
                disabled
                value={user.user_metadata?.last_name || ""}
                className="block w-full rounded-xl border-brand-sand bg-gray-50 py-2.5 px-4 text-olive-dark shadow-sm sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <p className="text-sm text-olive-light">
            Profile editing will be available soon.
          </p>
        </div>
      </div>

      {/* Active Meal Packages & QR Pass Section */}
      <div>
        <h2 className="text-2xl font-bold text-olive-dark mb-4 flex items-center gap-2.5">
          <QrCode className="w-6 h-6 text-brand-dark" />
          My Active Meal Plans &amp; QR Pass
        </h2>

        {subsWithBalance.length === 0 ? (
          <div className="bg-cream/50 border border-border rounded-2xl p-6 text-center max-w-lg">
            <p className="text-olive text-sm mb-3">You do not have any active meal packages yet.</p>
            <a href="/packages" className="btn-primary text-xs py-2 px-4 inline-block">
              Explore Meal Packages
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subsWithBalance.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 ${sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                      {sub.status.toUpperCase()}
                    </span>
                    <h3 className="font-heading text-xl font-bold text-amber-400">
                      {sub.package_type || "Weekly Meal Plan"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Start: {sub.start_date} &bull; End: {sub.end_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Membership ID</p>
                    <p className="font-mono font-bold text-lg text-white">{sub.subscription_code}</p>
                  </div>
                </div>

                {/* Remaining Meals Balance */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Remaining Balance</p>
                      <p className="text-lg font-bold text-white">
                        {sub.remainingMeals} <span className="text-xs font-normal text-slate-400">/ {sub.totalMeals} meals</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Redeemed</span>
                    <span className="font-semibold text-slate-200">{sub.usedMeals} meals</span>
                  </div>
                </div>

                {/* QR Token Counter Check-in Reference */}
                <div className="bg-white text-slate-900 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-slate-900 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Counter QR Pass Token</p>
                      <p className="font-mono text-xs font-bold break-all text-slate-900">{sub.qr_code_token}</p>
                    </div>
                  </div>
                </div>

                {sub.clover_order_id && (
                  <p className="text-[11px] text-slate-500 font-mono text-right">
                    Clover Ref: {sub.clover_order_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

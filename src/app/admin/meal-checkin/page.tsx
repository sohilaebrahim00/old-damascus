import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertCircle, QrCode, Search, CheckCircle, Clock, XCircle, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Subscription, MealCheckin } from "@/lib/supabase/types";

export const metadata = {
  title: "Admin - Meal Check-in",
};

export default async function AdminMealCheckinPage({
  searchParams,
}: {
  searchParams?: { query?: string; token?: string };
}) {
  const query = searchParams?.query || "";
  const token = searchParams?.token || "";

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-cream/30 p-8 sm:p-12 flex items-center justify-center">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-border/50">
          <div className="w-20 h-20 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-brand-olive" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-olive-dark mb-3">Database Not Configured</h2>
          <p className="text-olive mb-8 leading-relaxed">
            Subscription storage is currently offline. You cannot check in meals at this time.
          </p>
          <Link href="/admin/subscriptions" className="btn-primary w-full text-center">
            Go to Subscriptions Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  let subscription: Subscription | null = null;
  let checkinsToday: MealCheckin[] = [];
  let errorMsg = null;

  try {
    if (token || query) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let error: any = null;
      
      if (token) {
        const result = await supabase.from("subscriptions").select("*").eq("qr_code_token", token).single();
        data = result.data;
        error = result.error;
      } else if (query) {
        // If query looks like an exact OD- code, match it, else search broadly
        if (query.toUpperCase().startsWith("OD-")) {
            const result = await supabase.from("subscriptions").select("*").eq("subscription_code", query.toUpperCase()).single();
            data = result.data;
            error = result.error;
        } else {
            // Broad search, get first match for check-in ease
            const result = await supabase.from("subscriptions").select("*").or(`customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%`).limit(1).single();
            data = result.data;
            error = result.error;
        }
      }

      if (error && error.code !== "PGRST116") { // Ignore "no rows returned"
        throw error;
      }
      
      subscription = data as Subscription | null;

      if (subscription) {
        // Get today's checkins
        const today = new Date().toISOString().split('T')[0];
        const { data: checkinsData, error: checkinsError } = await supabase
          .from("meal_checkins")
          .select("*")
          .eq("subscription_id", subscription.id)
          .eq("checkin_date", today);
          
        if (checkinsError) throw checkinsError;
        checkinsToday = (checkinsData as MealCheckin[]) || [];
      }
    }
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load subscription";
  }

  return (
    <div className="min-h-screen bg-cream/30 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-olive-dark flex items-center gap-3">
              <QrCode className="w-8 h-8 text-brand-dark" />
              Meal Check-in
            </h1>
            <p className="text-olive mt-1">Scan a customer&apos;s QR code or search to log a meal.</p>
          </div>
          <Link href="/admin/subscriptions" className="btn-outline bg-white flex items-center gap-2">
            Back to Dashboard
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 mb-8">
            <form method="GET" className="relative max-w-xl mx-auto">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-olive/50" />
                <input 
                type="text" 
                name="query"
                defaultValue={query}
                autoFocus
                placeholder="Search by ID (OD-1001), Phone, or Name..." 
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-brand-gold bg-cream-warm/30 text-lg font-medium"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4">
                    Lookup
                </button>
            </form>
            <p className="text-center text-sm text-olive mt-4">
                Tip: If you use a camera to scan the QR code, it will automatically look up the subscription.
            </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl mb-8">
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        {(query || token) && !subscription && !errorMsg && (
             <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-border/50">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-olive-dark mb-2">Subscription Not Found</h3>
                <p className="text-olive">No active subscription matched that search.</p>
             </div>
        )}

        {subscription && (
            <div className="bg-white rounded-3xl shadow-sm border border-border/50 overflow-hidden">
                <div className="p-8 border-b border-border/50 bg-gradient-to-br from-cream-warm to-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-brand-dark text-brand-gold rounded-full text-xs font-bold tracking-wider mb-3">
                                {subscription.subscription_code}
                            </span>
                            <h2 className="font-heading text-3xl font-bold text-olive-dark mb-1">{subscription.customer_name}</h2>
                            <a href={`tel:${subscription.customer_phone}`} className="text-lg text-olive hover:text-brand-gold transition-colors">{subscription.customer_phone}</a>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-olive-dark text-xl mb-1">
                                {subscription.package_type === 'two_meals_daily' ? 'Two Meals / Day' : 'One Meal / Day'}
                            </div>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              subscription.status === 'active' ? 'bg-success/20 text-success-dark' :
                              subscription.status === 'expired' ? 'bg-red-100 text-red-700' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              STATUS: {subscription.status}
                            </div>
                        </div>
                    </div>

                    {(subscription.payment_status === 'pending' || subscription.payment_status === 'unpaid') && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 mt-4">
                            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-yellow-800 text-sm">Payment Not Confirmed</p>
                                <p className="text-yellow-700 text-xs mt-1">This subscription&apos;s payment status is &apos;{subscription.payment_status}&apos;. You may still check them in, but please verify payment.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8">
                    <h3 className="font-heading text-xl font-bold text-olive-dark mb-6 flex items-center gap-2">
                        <UtensilsCrossed className="w-6 h-6 text-brand-gold" />
                        Today&apos;s Meals
                    </h3>

                    {subscription.status !== 'active' ? (
                        <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                            <p className="font-bold text-red-800 text-lg">Subscription {subscription.status}</p>
                            <p className="text-red-600 text-sm mt-1">Cannot check in meals for non-active subscriptions.</p>
                        </div>
                    ) : checkinsToday.length >= subscription.meals_per_day ? (
                        <div className="p-8 bg-success/10 border border-success/30 rounded-2xl text-center shadow-sm">
                            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                            <h3 className="text-2xl font-bold text-success-dark">All meals served for today</h3>
                            <p className="text-success-dark/80 mt-2">The daily limit of {subscription.meals_per_day} meal(s) has been reached.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Meal 1 */}
                            <div className={`p-6 rounded-2xl border-2 ${checkinsToday.some(c => c.meal_number === 1) ? 'bg-success/5 border-success/30' : 'bg-white border-border shadow-sm hover:shadow-md transition-shadow'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-olive-dark text-lg">Meal 1</h4>
                                    {checkinsToday.some(c => c.meal_number === 1) && <CheckCircle className="w-6 h-6 text-success" />}
                                </div>
                                {checkinsToday.some(c => c.meal_number === 1) ? (
                                    <div className="text-success-dark font-medium flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Served at {new Date(checkinsToday.find(c => c.meal_number === 1)!.served_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                ) : (
                                    <form action="/api/admin/meal-checkin" method="POST">
                                        <input type="hidden" name="subscription_id" value={subscription.id} />
                                        <input type="hidden" name="meal_number" value="1" />
                                        <input type="hidden" name="token" value={token || ""} />
                                        <input type="hidden" name="query" value={query || ""} />
                                        <button type="submit" className="btn-primary w-full py-4 text-lg justify-center shadow-md hover:-translate-y-0.5 transition-all">
                                            Mark as Served
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Meal 2 (only if applicable) */}
                            {subscription.package_type === 'two_meals_daily' && (
                                <div className={`p-6 rounded-2xl border-2 ${checkinsToday.some(c => c.meal_number === 2) ? 'bg-success/5 border-success/30' : 'bg-white border-border shadow-sm hover:shadow-md transition-shadow'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-olive-dark text-lg">Meal 2</h4>
                                    {checkinsToday.some(c => c.meal_number === 2) && <CheckCircle className="w-6 h-6 text-success" />}
                                </div>
                                {checkinsToday.some(c => c.meal_number === 2) ? (
                                    <div className="text-success-dark font-medium flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Served at {new Date(checkinsToday.find(c => c.meal_number === 2)!.served_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                ) : (
                                    <form action="/api/admin/meal-checkin" method="POST">
                                        <input type="hidden" name="subscription_id" value={subscription.id} />
                                        <input type="hidden" name="meal_number" value="2" />
                                        <input type="hidden" name="token" value={token || ""} />
                                        <input type="hidden" name="query" value={query || ""} />
                                        <button type="submit" className="btn-primary w-full py-4 text-lg justify-center shadow-md hover:-translate-y-0.5 transition-all">
                                            Mark as Served
                                        </button>
                                    </form>
                                )}
                            </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

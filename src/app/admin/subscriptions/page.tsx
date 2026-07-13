import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertCircle, CalendarDays, CheckCircle, Package, Clock, QrCode, Search } from "lucide-react";
import Link from "next/link";
import { Subscription } from "@/lib/supabase/types";
import { SubscriptionActions } from "@/components/admin/SubscriptionActions";
import { SubscriptionsPageClient } from "@/components/admin/SubscriptionsPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin - Subscriptions",
};

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams?: { query?: string; status?: string };
}) {
  const query = searchParams?.query || "";
  const statusFilter = searchParams?.status || "all";

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-cream/30 p-8 sm:p-12 flex items-center justify-center">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-border/50">
          <div className="w-20 h-20 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-brand-olive" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-olive-dark mb-3">Database Not Configured</h2>
          <p className="text-olive mb-8 leading-relaxed">
            Subscription storage is currently offline. Please set up your database to manage weekly meal plans.
          </p>
          <div className="p-4 bg-cream-warm rounded-xl text-left border border-border/50">
            <h4 className="font-semibold text-olive-dark text-sm mb-1">To enable subscription tracking:</h4>
            <ul className="text-sm text-olive space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">•</span>
                Set up a Supabase project
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">•</span>
                Run the <code>meal-subscriptions.sql</code> schema
              </li>
            </ul>
          </div>
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

  let subscriptions: Subscription[] = [];
  let errorMsg = null;

  try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let error: any = null;
      
      if (statusFilter !== "all" && query) {
        const result = await supabase.from("subscriptions").select("*").eq("status", statusFilter).or(`customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%,subscription_code.ilike.%${query}%`).order("created_at", { ascending: false });
        data = result.data;
        error = result.error;
      } else if (statusFilter !== "all") {
        const result = await supabase.from("subscriptions").select("*").eq("status", statusFilter).order("created_at", { ascending: false });
        data = result.data;
        error = result.error;
      } else if (query) {
        const result = await supabase.from("subscriptions").select("*").or(`customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%,subscription_code.ilike.%${query}%`).order("created_at", { ascending: false });
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
        data = result.data;
        error = result.error;
      }

      if (error) {
        throw error;
      }
      subscriptions = data || [];
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load subscriptions";
  }

  // Calculate real stats from all subscriptions (not just filtered)
  let allSubs: Subscription[] = [];
  try {
    const { data } = await supabase.from("subscriptions").select("status, package_type");
    allSubs = (data as Subscription[]) || [];
  } catch (e: unknown) {
    // Ignore error here, we already caught it above
    void e;
  }

  const totalActive = allSubs.filter((s) => s.status === 'active').length;
  const oneMealActive = allSubs.filter((s) => s.status === 'active' && s.package_type === 'one_meal_daily').length;
  const twoMealsActive = allSubs.filter((s) => s.status === 'active' && s.package_type === 'two_meals_daily').length;

  return (
    <div className="min-h-screen bg-cream/30 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-olive-dark flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-brand-dark" />
              Meal Subscriptions
            </h1>
            <p className="text-olive mt-1">Manage weekly meal plans and generate check-in codes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/meal-checkin" className="btn-outline bg-white flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Check-in Scanner
            </Link>
            <SubscriptionsPageClient />
          </div>
        </div>

        {!errorMsg && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-olive/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-brand-olive" />
                </div>
                <h3 className="font-semibold text-olive-dark">Active Subscriptions</h3>
              </div>
              <p className="text-3xl font-bold text-brand-dark">{totalActive}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-brand-dark" />
                </div>
                <h3 className="font-semibold text-olive-dark">One Meal Daily</h3>
              </div>
              <p className="text-3xl font-bold text-brand-dark">{oneMealActive}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-brand-gold" />
                </div>
                <h3 className="font-semibold text-olive-dark">Two Meals Daily</h3>
              </div>
              <p className="text-3xl font-bold text-brand-dark">{twoMealsActive}</p>
            </div>
          </div>
        )}

        {errorMsg ? (
          <div className="bg-white border border-red-200 text-red-800 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="font-bold text-lg">Database Table Missing</p>
            </div>
            <p className="mb-4 text-red-700/80">The connection was successful, but the subscriptions table could not be found.</p>
            <code className="text-sm block p-4 bg-red-50 rounded-xl mb-6">{errorMsg}</code>
            <div className="text-sm bg-gray-50 text-gray-800 p-6 rounded-xl border border-gray-200">
              <strong className="block mb-2 text-base">Run the SQL in supabase/meal-subscriptions.sql</strong>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-border/50 overflow-hidden">
            
            {/* Filters Bar */}
            <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-cream-warm/30">
              <div className="relative w-full sm:w-96">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-olive/50" />
                <form method="GET">
                  {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
                  <input 
                    type="text" 
                    name="query"
                    defaultValue={query}
                    placeholder="Search by ID, name, or phone..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                  />
                </form>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link href={`?status=all${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${statusFilter === 'all' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>All</Link>
                <Link href={`?status=active${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${statusFilter === 'active' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>Active</Link>
                <Link href={`?status=expired${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${statusFilter === 'expired' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>Expired</Link>
              </div>
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDays className="w-8 h-8 text-olive/40" />
                </div>
                <h3 className="text-xl font-bold text-olive-dark mb-2">No subscriptions found</h3>
                <p className="text-olive">Adjust your filters or add a new subscription.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream-warm/50 border-b border-border/50 text-sm text-olive-dark">
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">ID / Dates</th>
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Customer</th>
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Package</th>
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Status</th>
                      <th className="px-6 py-5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {subscriptions.map((sub: Subscription) => (
                      <tr key={sub.id} className="hover:bg-cream/20 transition-colors group">
                        <td className="px-6 py-5 align-top">
                          <div className="font-bold text-brand-dark mb-1 font-mono">{sub.subscription_code}</div>
                          <div className="text-xs text-olive flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="font-bold text-olive-dark mb-1">{sub.customer_name}</div>
                          <a href={`tel:${sub.customer_phone}`} className="text-sm text-olive hover:text-brand-gold transition-colors">{sub.customer_phone}</a>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="font-medium text-olive-dark mb-1">
                            {sub.package_type === 'two_meals_daily' ? 'Two Meals Daily' : 'One Meal Daily'}
                          </div>
                          <div className="text-xs text-olive">{sub.meals_per_day} meals / day</div>
                        </td>
                        <td className="px-6 py-5 align-top space-y-2">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              sub.status === 'active' ? 'bg-success/20 text-success-dark' :
                              sub.status === 'expired' ? 'bg-red-100 text-red-700' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              sub.payment_status === 'paid' ? 'bg-brand-olive/20 text-brand-dark' :
                              'bg-brand-gold/30 text-brand-dark'
                            }`}>
                              PAY: {sub.payment_status}
                            </span>
                          </div>
                          {(() => {
                            const daysLeft = Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                            if (sub.status === 'active' && daysLeft <= 3 && daysLeft >= 0) {
                              return (
                                <div>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                                    Expiring Soon
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </td>
                        <td className="px-6 py-5 align-top text-right">
                           <SubscriptionActions sub={sub} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

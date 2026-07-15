import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertCircle, FileText, Search, ChefHat, Clock } from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/supabase/types";
import { isAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin - Orders",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { query?: string; status?: string; filter?: string };
}) {
  const query = searchParams?.query || "";
  const statusFilter = searchParams?.status || "all";
  const timeFilter = searchParams?.filter || "today"; // today, yesterday, all

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-cream/30 p-8 sm:p-12 flex items-center justify-center">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-border/50">
          <div className="w-20 h-20 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-brand-olive" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-olive-dark mb-3">Database Not Configured</h2>
          <p className="text-olive mb-8">Please set up your database to manage orders.</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = isAdminUser(user);
  
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h2>
      </div>
    );
  }

  let orders: Order[] = [];
  let errorMsg = null;
  let allTodayOrders: Order[] = [];

  try {
      let supabaseQuery = supabase.from("orders").select("*");
      
      if (statusFilter !== "all") {
        supabaseQuery = supabaseQuery.eq("status", statusFilter);
      }
      
      if (query) {
        supabaseQuery = supabaseQuery.or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%`);
      }

      if (timeFilter === "today") {
          const today = new Date();
          today.setHours(0,0,0,0);
          supabaseQuery = supabaseQuery.gte("created_at", today.toISOString());
      } else if (timeFilter === "yesterday") {
          const today = new Date();
          today.setHours(0,0,0,0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          supabaseQuery = supabaseQuery.gte("created_at", yesterday.toISOString()).lt("created_at", today.toISOString());
      }

      const result = await supabaseQuery.order("created_at", { ascending: false });

      if (result.error) {
        throw result.error;
      }
      orders = result.data || [];

      // Fetch all today's orders for stats
      const today = new Date();
      today.setHours(0,0,0,0);
      const statsRes = await supabase.from("orders").select("*").gte("created_at", today.toISOString());
      if (statsRes.data) {
          allTodayOrders = statsRes.data;
      }

  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load orders";
  }

  const totalOrders = allTodayOrders.length;
  const totalRevenue = allTodayOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;
  const preparingCount = allTodayOrders.filter(o => o.status === 'PREPARING').length;
  const completedCount = allTodayOrders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-cream/30 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-olive-dark flex items-center gap-3">
              <FileText className="w-8 h-8 text-brand-dark" />
              Orders Dashboard
            </h1>
            <p className="text-olive mt-1">Manage restaurant orders and track revenue.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/kitchen" className="btn-primary flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> KDS
            </Link>
            <Link href="/admin/pos" className="btn-outline bg-white flex items-center gap-2">
              <Clock className="w-4 h-4" /> POS
            </Link>
          </div>
        </div>

        {!errorMsg && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <h3 className="font-semibold text-olive-dark text-sm mb-1">Revenue Today</h3>
              <p className="text-3xl font-bold text-brand-dark">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <h3 className="font-semibold text-olive-dark text-sm mb-1">Orders Today</h3>
              <p className="text-3xl font-bold text-brand-dark">{totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <h3 className="font-semibold text-olive-dark text-sm mb-1">Preparing</h3>
              <p className="text-3xl font-bold text-brand-olive">{preparingCount}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <h3 className="font-semibold text-olive-dark text-sm mb-1">Completed</h3>
              <p className="text-3xl font-bold text-success-dark">{completedCount}</p>
            </div>
          </div>
        )}

        {errorMsg ? (
          <div className="bg-white border border-red-200 text-red-800 p-8 rounded-3xl shadow-sm">
            <p className="mb-4 text-red-700/80">{errorMsg}</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-border/50 overflow-hidden">
            {/* Filters Bar */}
            <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-cream-warm/30">
              <div className="relative w-full sm:w-96">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-olive/50" />
                <form method="GET">
                  {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
                  {timeFilter !== "today" && <input type="hidden" name="filter" value={timeFilter} />}
                  <input 
                    type="text" 
                    name="query"
                    defaultValue={query}
                    placeholder="Search order #, customer, phone..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                  />
                </form>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link href={`?filter=today&status=${statusFilter}${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${timeFilter === 'today' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>Today</Link>
                <Link href={`?filter=yesterday&status=${statusFilter}${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${timeFilter === 'yesterday' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>Yesterday</Link>
                <Link href={`?filter=all&status=${statusFilter}${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${timeFilter === 'all' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>All Time</Link>
                <div className="w-px h-6 bg-border mx-2"></div>
                <Link href={`?status=all&filter=${timeFilter}${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${statusFilter === 'all' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>All Status</Link>
                <Link href={`?status=NEW&filter=${timeFilter}${query ? `&query=${query}` : ''}`} className={`px-4 py-2 rounded-xl text-sm font-medium ${statusFilter === 'NEW' ? 'bg-brand-dark text-brand-gold' : 'bg-white text-olive border border-border/50 hover:bg-cream'}`}>New</Link>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-olive/40" />
                </div>
                <h3 className="text-xl font-bold text-olive-dark mb-2">No orders found</h3>
                <p className="text-olive">Adjust your filters or wait for new orders.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream-warm/50 border-b border-border/50 text-sm text-olive-dark">
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Order #</th>
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Customer</th>
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Type / Source</th>
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Status</th>
                      <th className="px-6 py-5 font-semibold whitespace-nowrap">Total</th>
                      <th className="px-6 py-5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {orders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-cream/20 transition-colors group">
                        <td className="px-6 py-5 align-top">
                          <div className="font-bold text-brand-dark mb-1 font-mono">{order.order_number}</div>
                          <div className="text-xs text-olive flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="font-bold text-olive-dark mb-1 flex items-center gap-2">
                              {order.customer_name}
                              {order.order_source === 'subscription' && <span className="bg-brand-gold/20 text-brand-dark px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Member</span>}
                          </div>
                          <a href={`tel:${order.customer_phone}`} className="text-sm text-olive hover:text-brand-gold transition-colors">{order.customer_phone}</a>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="font-medium text-olive-dark mb-1 uppercase text-sm">
                            {order.order_type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-olive uppercase">{order.order_source}</div>
                        </td>
                        <td className="px-6 py-5 align-top space-y-2">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              order.status === 'COMPLETED' ? 'bg-success/20 text-success-dark' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'READY' ? 'bg-brand-olive/20 text-brand-dark' :
                              'bg-brand-gold/30 text-brand-dark'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              order.payment_status === 'PAID' ? 'bg-brand-olive/20 text-brand-dark' :
                              'bg-brand-gold/30 text-brand-dark'
                            }`}>
                              PAY: {order.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                           <div className="font-bold text-brand-dark">${(order.total_cents / 100).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-5 align-top text-right">
                           <Link href={`/admin/kitchen`} className="text-brand-gold hover:text-brand-dark text-sm font-semibold transition-colors">
                               View in KDS
                           </Link>
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

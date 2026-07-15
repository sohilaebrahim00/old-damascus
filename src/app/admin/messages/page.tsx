import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertCircle, Inbox, Mail, UtensilsCrossed, Calendar } from "lucide-react";
import { isAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin - Messages",
};

interface LeadMessage {
  id: string;
  type: string;
  name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  message?: string | null;
  package_id?: string | null;
  event_date?: string | null;
  created_at: string;
}

export default async function AdminMessagesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-cream/30 p-8 sm:p-12 flex items-center justify-center">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-border/50">
          <div className="w-20 h-20 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-brand-olive" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-olive-dark mb-3">Database Not Configured</h2>
          <p className="text-olive mb-8 leading-relaxed">
            Message storage is currently offline. If you have email notifications configured, leads will be forwarded directly to your inbox.
          </p>
          <div className="p-4 bg-cream-warm rounded-xl text-left border border-border/50">
            <h4 className="font-semibold text-olive-dark text-sm mb-1">To enable message storage:</h4>
            <ul className="text-sm text-olive space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">•</span>
                Set up a Supabase project
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">•</span>
                Add your API keys to the environment variables
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">•</span>
                Run the provided SQL schema to create the leads table
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

  const isAdmin = isAdminUser(user);
  
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  let messages: LeadMessage[] = [];
  let errorMsg = null;

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    messages = data || [];
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load messages";
  }

  // Calculate real stats
  const totalMessages = messages.length;
  const packageInquiries = messages.filter(m => m.type === 'package_inquiry').length;
  const cateringRequests = messages.filter(m => m.type === 'catering').length;
  const generalContact = messages.filter(m => m.type === 'contact').length;

  return (
    <div className="min-h-screen bg-cream/30 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-olive-dark flex items-center gap-3">
              <Inbox className="w-8 h-8 text-brand-dark" />
              Lead Dashboard
            </h1>
            <p className="text-olive mt-1">Manage and respond to customer inquiries.</p>
          </div>
        </div>

        {!errorMsg && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-brand-gold" />
                </div>
                <h3 className="font-semibold text-olive-dark">Total</h3>
              </div>
              <p className="text-3xl font-bold text-brand-dark">{totalMessages}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-olive/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-brand-olive" />
                </div>
                <h3 className="font-semibold text-olive-dark">Meal Plans</h3>
              </div>
              <p className="text-3xl font-bold text-brand-dark">{packageInquiries}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-brand-dark" />
                </div>
                <h3 className="font-semibold text-olive-dark">Catering</h3>
              </div>
              <p className="text-3xl font-bold text-brand-dark">{cateringRequests}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cream-warm rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-olive" />
                </div>
                <h3 className="font-semibold text-olive-dark">General</h3>
              </div>
              <p className="text-3xl font-bold text-brand-dark">{generalContact}</p>
            </div>
          </div>
        )}

        {errorMsg ? (
          <div className="bg-white border border-red-200 text-red-800 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="font-bold text-lg">Database Table Missing</p>
            </div>
            <p className="mb-4 text-red-700/80">The connection was successful, but the leads table could not be found.</p>
            <code className="text-sm block p-4 bg-red-50 rounded-xl mb-6">{errorMsg}</code>
            <div className="text-sm bg-gray-50 text-gray-800 p-6 rounded-xl border border-gray-200">
              <strong className="block mb-2 text-base">Run this SQL in your Supabase dashboard:</strong>
              <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  subject text,
  message text,
  package_id text,
  event_date text,
  guest_count text,
  source text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`}
              </pre>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-border/50">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-8 h-8 text-olive/40" />
            </div>
            <h3 className="text-xl font-bold text-olive-dark mb-2">No messages yet</h3>
            <p className="text-olive">When customers submit inquiries, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-warm/50 border-b border-border/50 text-sm text-olive-dark">
                    <th className="px-6 py-5 font-semibold whitespace-nowrap w-40">Date</th>
                    <th className="px-6 py-5 font-semibold whitespace-nowrap w-32">Type</th>
                    <th className="px-6 py-5 font-semibold whitespace-nowrap w-48">Contact</th>
                    <th className="px-6 py-5 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {messages.map((msg: LeadMessage) => (
                    <tr key={msg.id} className="hover:bg-cream/20 transition-colors group">
                      <td className="px-6 py-5 text-sm text-olive whitespace-nowrap align-top">
                        <div className="font-medium text-olive-dark">{new Date(msg.created_at).toLocaleDateString()}</div>
                        <div className="text-xs mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          msg.type === 'catering' ? 'bg-brand-gold text-brand-dark' :
                          msg.type === 'package_inquiry' ? 'bg-brand-olive/20 text-brand-dark' :
                          'bg-cream-warm text-olive-dark'
                        }`}>
                          {msg.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-olive-dark mb-1">{msg.name}</div>
                        <a href={`tel:${msg.phone}`} className="text-sm text-olive hover:text-brand-gold transition-colors block mb-0.5">{msg.phone}</a>
                        {msg.email && <a href={`mailto:${msg.email}`} className="text-sm text-olive/80 hover:text-brand-gold transition-colors block">{msg.email}</a>}
                      </td>
                      <td className="px-6 py-5 text-sm text-olive-dark align-top">
                        {msg.subject && <div className="font-bold text-brand-dark mb-2 text-base">{msg.subject}</div>}
                        
                        <div className="bg-cream-warm/30 p-3 rounded-xl border border-border/30 space-y-1">
                          {msg.package_id && <div className="text-brand-dark font-medium"><span className="text-olive mr-2">Plan:</span>{msg.package_id}</div>}
                          {msg.event_date && <div><span className="text-olive mr-2">Event Date:</span>{msg.event_date}</div>}
                          {msg.message && <div className="text-olive whitespace-pre-wrap mt-2">{msg.message}</div>}
                        </div>
                        {msg.type === 'package_inquiry' && (
                          <div className="mt-3 text-right">
                             <a href={`/admin/subscriptions?action=new&name=${encodeURIComponent(msg.name)}&phone=${encodeURIComponent(msg.phone)}&email=${encodeURIComponent(msg.email || '')}&package=${encodeURIComponent(msg.package_id || '')}`} className="btn-outline bg-white px-3 py-1.5 text-xs h-auto border-brand-olive text-brand-dark hover:bg-brand-olive/10">
                                Convert to Subscription
                             </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

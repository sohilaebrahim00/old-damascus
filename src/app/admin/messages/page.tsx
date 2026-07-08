import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertCircle, Inbox } from "lucide-react";

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
      <div className="p-8 max-w-2xl mx-auto mt-10">
        <div className="bg-brand-olive/10 border border-brand-olive rounded-xl p-8 text-center text-olive-dark">
          <AlertCircle className="w-12 h-12 text-brand-olive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Message storage is not configured yet.</h2>
          <p className="text-olive">
            Supabase is not fully configured, so we cannot fetch or display leads here. 
            If Resend is configured, leads are being forwarded via email.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Placeholder rule: if admin role is not implemented yet, just check if user exists.
  // In a real app, you'd check `user.app_metadata?.role === 'admin'`.
  const isAdmin = user?.email === process.env.ADMIN_NOTIFICATION_EMAIL || user?.app_metadata?.role === 'admin' || user;
  
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
    // If the table doesn't exist, it will throw an error
    errorMsg = err instanceof Error ? err.message : "Failed to load messages";
  }

  return (
    <div className="container-site py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-olive-dark flex items-center gap-3">
          <Inbox className="w-8 h-8 text-brand-dark" />
          Lead Messages
        </h1>
      </div>

      {errorMsg ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl">
          <p className="font-semibold mb-2">Error loading messages (Table might be missing):</p>
          <code className="text-sm">{errorMsg}</code>
          <div className="mt-4 text-sm bg-white p-4 rounded border border-red-100">
            <strong>Expected Supabase Table Schema:</strong>
            <pre className="mt-2 text-xs overflow-x-auto">
{`CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'contact', 'package_inquiry', 'catering'
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
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border/50">
          <Inbox className="w-12 h-12 text-olive/30 mx-auto mb-4" />
          <p className="text-lg text-olive font-medium">No messages found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-warm border-b border-border text-sm text-olive-dark">
                  <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Type</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Name</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Contact</th>
                  <th className="p-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {messages.map((msg: LeadMessage) => (
                  <tr key={msg.id} className="hover:bg-cream/20 transition-colors">
                    <td className="p-4 text-sm text-olive whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-brand-gold/20 text-brand-dark uppercase tracking-wider">
                        {msg.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-olive-dark whitespace-nowrap">
                      {msg.name}
                    </td>
                    <td className="p-4 text-sm text-olive">
                      <div className="whitespace-nowrap">{msg.phone}</div>
                      {msg.email && <div className="text-xs text-olive/70">{msg.email}</div>}
                    </td>
                    <td className="p-4 text-sm text-olive-dark">
                      {msg.subject && <div className="font-semibold mb-1">{msg.subject}</div>}
                      {msg.package_id && <div className="mb-1 text-brand-dark">Pkg: {msg.package_id}</div>}
                      {msg.event_date && <div className="mb-1">Date: {msg.event_date}</div>}
                      {msg.message && <div className="line-clamp-2 text-olive">{msg.message}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

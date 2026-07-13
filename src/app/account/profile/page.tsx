import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-olive-dark mb-6">Profile Details</h1>
      
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-olive-dark">Email</label>
          <div className="mt-1">
            <input
              type="text"
              disabled
              value={user?.email || ""}
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
              value={user?.user_metadata?.first_name || ""}
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
              value={user?.user_metadata?.last_name || ""}
              className="block w-full rounded-xl border-brand-sand bg-gray-50 py-2.5 px-4 text-olive-dark shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <p className="text-sm text-olive-light">
          Profile editing will be available soon.
        </p>
      </div>
    </div>
  );
}

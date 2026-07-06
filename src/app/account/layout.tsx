import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User, ShoppingBag, LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "My Account - Old Damascus",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 bg-cream py-10 sm:py-16">
      <div className="container-site max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-brand-sand p-6">
              <h2 className="text-xl font-heading font-bold text-olive-dark mb-6">
                My Account
              </h2>
              <nav className="space-y-1">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-olive hover:text-brand-dark hover:bg-cream transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-olive hover:text-brand-dark hover:bg-cream transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Orders
                </Link>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-olive hover:text-brand-dark hover:bg-cream transition-colors"
                >
                  <User className="w-5 h-5" />
                  Profile Details
                </Link>
                <form action="/auth/sign-out" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </form>
              </nav>
            </div>
          </aside>
          <main className="flex-1 bg-white rounded-2xl shadow-sm border border-brand-sand p-6 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

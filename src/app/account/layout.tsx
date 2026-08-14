import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ShoppingBag, LayoutDashboard, Settings2 } from "lucide-react";
import { AccountIdentity } from "@/components/account/AccountIdentity";
import { BrandPattern } from "@/components/brand/BrandPattern";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account - Old Damascus",
};

const NAV = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/profile", label: "Profile Details", icon: Settings2 },
];

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
    <div className="flex-1 bg-cream">
      {/* Editorial page head */}
      <div className="relative overflow-hidden bg-cream-warm border-b border-border">
        <BrandPattern className="text-brand-gold" scale={88} opacity={0.06} />
        <div className="relative z-10 container-site max-w-5xl py-16 sm:py-20">
          <span className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
            <span className="w-10 h-px bg-brand-gold/60" aria-hidden="true" />
            Your Account
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold text-olive-dark tracking-tight mt-6">
            Welcome back
          </h1>
        </div>
      </div>

      <div className="container-site max-w-5xl py-12 sm:py-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <aside className="w-full md:w-72 shrink-0 space-y-6">
            <AccountIdentity user={user} />

            <nav className="space-y-1" aria-label="Account">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold
                             text-olive hover:text-brand-dark hover:bg-white transition-colors
                             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
                >
                  <Icon
                    className="w-[18px] h-[18px] text-brand-gold"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              ))}

              <form action="/auth/sign-out" method="post" className="pt-3">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold
                             text-olive/70 hover:text-error hover:bg-white transition-colors cursor-pointer
                             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-gold outline-none"
                >
                  <LogOut
                    className="w-[18px] h-[18px]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Sign Out
                </button>
              </form>
            </nav>
          </aside>

          <main className="flex-1 bg-white rounded-2xl border border-border shadow-card p-6 sm:p-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

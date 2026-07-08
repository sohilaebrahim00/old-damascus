import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { StickyMobileCart } from "@/components/cart/StickyMobileCart";
import { Toaster } from "@/components/ui/Toaster";
import { restaurant } from "@/config/restaurant";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MotionProvider } from "@/components/providers/MotionProvider";

// ---- Fonts ----
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});



// ---- Metadata ----
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: restaurant.seo.defaultTitle,
    template: restaurant.seo.titleTemplate,
  },
  description: restaurant.seo.defaultDescription,
  keywords: [...restaurant.seo.keywords],
  authors: [{ name: restaurant.shortName }],
  creator: restaurant.shortName,
  publisher: restaurant.shortName,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: restaurant.name,
    title: restaurant.seo.defaultTitle,
    description: restaurant.seo.defaultDescription,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${restaurant.name} — Authentic Mediterranean Cuisine in Richardson, TX`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: restaurant.seo.defaultTitle,
    description: restaurant.seo.defaultDescription,
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<unknown>((_, reject) =>
          setTimeout(() => reject(new Error("Supabase auth timeout")), 2500)
        ),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user = (result as any)?.data?.user ?? null;
    } catch {
      user = null;
    }
  }

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-olive-dark">
        <MotionProvider>
          <CartProvider>
            <Header isAuthenticated={!!user} />
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
            <Footer />
            <StickyMobileCart />
            <Toaster />
          </CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

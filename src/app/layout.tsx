import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { StickyMobileCart } from "@/components/cart/StickyMobileCart";
import { MobileOrderFAB } from "@/components/layout/MobileOrderFAB";
import { Toaster } from "@/components/ui/Toaster";
import { restaurant } from "@/config/restaurant";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { OfferBanner } from "@/components/layout/OfferBanner";
import Script from "next/script";

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
      <head>
        <Script
          id="local-business-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: restaurant.name,
              image: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
              "@id": process.env.NEXT_PUBLIC_SITE_URL,
              url: process.env.NEXT_PUBLIC_SITE_URL,
              telephone: restaurant.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: restaurant.address.street,
                addressLocality: restaurant.address.city,
                addressRegion: restaurant.address.state,
                postalCode: restaurant.address.zip,
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 32.9733,
                longitude: -96.7399,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
                  opens: "11:00",
                  closes: "21:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Friday", "Saturday"],
                  opens: "11:00",
                  closes: "22:00",
                },
              ],
              sameAs: [
                restaurant.googleReviewUrl,
                restaurant.doordashUrl,
                restaurant.uberEatsUrl,
              ],
              servesCuisine: "Mediterranean",
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-olive-dark">
        <MotionProvider>
          <CartProvider>
            <OfferBanner />
            <Header isAuthenticated={!!user} />
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
            <Footer />
            <StickyMobileCart />
            <MobileOrderFAB />
            <Toaster />
          </CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

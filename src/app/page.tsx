import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { OrderingOptions } from "@/components/home/OrderingOptions";
import { FeaturedMenu } from "@/components/home/FeaturedMenu";
import { CategoryPreview } from "@/components/home/CategoryPreview";
import { PackagesSection } from "@/components/home/PackagesSection";
import { AboutPreview } from "@/components/home/AboutPreview";
import { CateringBanner } from "@/components/home/CateringBanner";
import { RestaurantInfo } from "@/components/home/RestaurantInfo";
import { GoogleReviewCTA } from "@/components/home/GoogleReviewCTA";
import { FinalCTA } from "@/components/home/FinalCTA";
import { getMenuItems } from "@/services/menu.service";
import { FEATURED_ITEM_IDS } from "@/data/menu.seed";
import { restaurant } from "@/config/restaurant";

export const metadata: Metadata = {
  title: restaurant.seo.defaultTitle,
  description: restaurant.seo.defaultDescription,
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const { items } = await getMenuItems();

  const featuredItems = FEATURED_ITEM_IDS.map(
    (id) => items.find((item) => item.id === id)
  ).filter(Boolean) as typeof items;

  // Priority: seed featured IDs → items with featured/popular flags → first 8 available items
  const displayItems =
    featuredItems.length >= 4
      ? featuredItems
      : items.filter((i) => i.featured || i.popular).length >= 4
        ? items.filter((i) => i.featured || i.popular).slice(0, 8)
        : items.filter((i) => i.available).slice(0, 8);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: restaurant.name,
            description: restaurant.description,
            url: process.env.NEXT_PUBLIC_SITE_URL,
            telephone: restaurant.phoneRaw,
            email: restaurant.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: restaurant.address.street,
              addressLocality: restaurant.address.city,
              addressRegion: restaurant.address.state,
              postalCode: restaurant.address.zip,
              addressCountry: "US",
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
            servesCuisine: restaurant.seo.cuisineTypes,
            priceRange: "$$",
            hasMap: restaurant.address.googleMapsUrl,
            menu: `${process.env.NEXT_PUBLIC_SITE_URL}/menu`,
            acceptsReservations: false,
            currenciesAccepted: "USD",
            paymentAccepted: "Cash, Credit Card",
          }),
        }}
      />

      <HeroSection />
      <OrderingOptions />
      <FeaturedMenu items={displayItems} />
      {/* Packages / Deals Section */}
      <PackagesSection />

      {/* Categories Preview */}
      <CategoryPreview />
      <AboutPreview />
      <CateringBanner />
      <RestaurantInfo />
      <GoogleReviewCTA />
      <FinalCTA />
    </>
  );
}

import type { Metadata } from "next";
import { MenuPageClient } from "@/components/menu/MenuPageClient";
import { getMenu } from "@/services/menu.service";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the full Old Damascus menu — grilled meats, shawarma, mandi, mezze, salads, sandwiches, desserts, and traditional drinks. All halal.",
  alternates: { canonical: "/menu" },
};

export const revalidate = 300; // 5 minutes

export default async function MenuPage() {
  // Single atomic read: items and categories must originate from the same
  // source or category filtering silently matches nothing.
  const { items, categories, source } = await getMenu();

  return <MenuPageClient items={items} categories={categories} source={source} />;
}

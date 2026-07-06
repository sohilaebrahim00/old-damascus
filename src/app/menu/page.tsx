import type { Metadata } from "next";
import { MenuPageClient } from "@/components/menu/MenuPageClient";
import { getMenuItems, getMenuCategories } from "@/services/menu.service";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the full Old Damascus menu — grilled meats, shawarma, mandi, mezze, salads, sandwiches, desserts, and traditional drinks. All halal.",
  alternates: { canonical: "/menu" },
};

export const revalidate = 300; // 5 minutes

export default async function MenuPage() {
  const [{ items, source }, categories] = await Promise.all([
    getMenuItems(),
    getMenuCategories(),
  ]);

  return <MenuPageClient items={items} categories={categories} source={source} />;
}

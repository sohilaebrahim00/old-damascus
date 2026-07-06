// ============================================================
// Clover Inventory — Categories, Items, Modifiers
// Server-side only.
// ============================================================

import { cloverFetch } from "./client";
import {
  mapCloverCategory,
  mapCloverItem,
  mapCloverModifierGroup,
} from "./mapper";
import type {
  CloverApiResponse,
  CloverCategory,
  CloverItem,
  CloverModifierGroup,
} from "./types";
import type { MenuCategory, MenuItem, ModifierGroup } from "@/types";

export async function fetchCloverCategories(): Promise<MenuCategory[]> {
  const data = await cloverFetch<CloverApiResponse<CloverCategory>>(
    "/categories?limit=200"
  );
  return (data.elements ?? [])
    .filter((c) => !c.deleted)
    .map(mapCloverCategory);
}

export async function fetchCloverModifierGroups(): Promise<
  Record<string, ModifierGroup>
> {
  const data = await cloverFetch<CloverApiResponse<CloverModifierGroup>>(
    "/modifier_groups?expand=modifiers&limit=200"
  );
  const groups: Record<string, ModifierGroup> = {};
  for (const g of data.elements ?? []) {
    groups[g.id] = mapCloverModifierGroup(g);
  }
  return groups;
}

export async function fetchCloverItems(
  cloverCategories: CloverCategory[]
): Promise<MenuItem[]> {
  const modGroupMap = await fetchCloverModifierGroups();

  const data = await cloverFetch<CloverApiResponse<CloverItem>>(
    "/items?expand=categories,modifierGroups,taxRates,itemStock&limit=500"
  );

  return (data.elements ?? [])
    .filter((item) => !item.hidden)
    .map((item) => {
      const itemModGroups = (item.modifierGroups?.elements ?? [])
        .map((ref) => modGroupMap[ref.id])
        .filter(Boolean) as ModifierGroup[];

      return mapCloverItem(item, cloverCategories, itemModGroups);
    });
}

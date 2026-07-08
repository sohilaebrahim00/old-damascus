// ============================================================
// Meal Packages Configuration
// TODO: Replace with confirmed real data from client.
// See PACKAGES_SETUP.md for the template and instructions.
// ============================================================

export interface MealPackage {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  mealsPerDay: number;
  duration: string;
  available: boolean;
  orderable: boolean;
  ctaText: string;
}

// ============================================================
// PACKAGE DATA
// ============================================================
export const PACKAGES: MealPackage[] = [
  {
    id: "one-meal-daily",
    name: "One Meal Daily Package",
    price: 129,
    priceLabel: "$129 / week",
    description: "One freshly prepared meal every day for the full week.",
    mealsPerDay: 1,
    duration: "Full week",
    available: true,
    orderable: false,
    ctaText: "Subscribe Now"
  },
  {
    id: "two-meals-daily",
    name: "Two Meals Daily Package",
    price: 229,
    priceLabel: "$229 / week",
    description: "Two freshly prepared meals every day for the full week.",
    mealsPerDay: 2,
    duration: "Full week",
    available: true,
    orderable: false,
    ctaText: "Subscribe Now"
  }
];

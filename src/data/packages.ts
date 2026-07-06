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
    price: 699,
    priceLabel: "$699 / month",
    description: "Enjoy one freshly prepared meal every day for the full month.",
    mealsPerDay: 1,
    duration: "Full month",
    available: true,
    orderable: false,
    ctaText: "Subscribe Now"
  },
  {
    id: "two-meals-daily",
    name: "Two Meals Daily Package",
    price: 999,
    priceLabel: "$999 / month",
    description: "Enjoy two freshly prepared meals every day for the full month.",
    mealsPerDay: 2,
    duration: "Full month",
    available: true,
    orderable: false,
    ctaText: "Subscribe Now"
  }
];

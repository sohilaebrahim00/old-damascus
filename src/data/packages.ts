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
  isEmployeeOnly?: boolean;
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
    orderable: true,
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
    orderable: true,
    ctaText: "Subscribe Now"
  },
  {
    id: "employee-meal-plan",
    name: "Employee Daily Meal Package",
    price: 69,
    priceLabel: "$69 / week (Staff Tier)",
    description: "Staff discounted weekly meal package with daily check-in access.",
    mealsPerDay: 1,
    duration: "Full week",
    available: true,
    orderable: true,
    isEmployeeOnly: true,
    ctaText: "Staff Subscribe"
  }
];

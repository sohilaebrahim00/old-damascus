# Packages Setup Guide

## Overview

Meal packages are managed through the file:
**`src/data/packages.ts`**

The PackagesSection on the homepage reads from this file and automatically
displays packages when they have `available: true`.

## How to Add a Package

Add an entry to the `PACKAGES` array in `src/data/packages.ts`.

### Template

```typescript
{
  id: "pkg-unique-id",           // Unique identifier
  name: "Package Name",          // Display name
  price: 0.00,                   // Price in USD (null if TBD)
  description: "Short description of the package",
  includedItems: [
    "Item 1",
    "Item 2",
    "Item 3",
  ],
  badge: "Best Value",           // Optional badge text
  image: "/menu/packages/image.jpg", // Optional image path
  available: true,               // Set to true when ready to display
  cloverItemId: "CLOVER_ID",     // Required for checkout
  featured: true,                // Optional: prominently display
}
```

### Required Information Per Package

| Field | Description | Required |
|---|---|---|
| Package Name | Display name | Yes |
| Price | USD price | Yes (for checkout) |
| Description | Short description | Yes |
| Included Items | List of what is included | Yes |
| Badge | Optional label (e.g. "Best Value") | No |
| Image | Photo of the package | No |
| Clover Item ID | Clover inventory ID | Yes (for checkout) |
| Available | Whether to show the package | Yes |

### Data Collection Template

```
Package Name:
Price:
Description:
Included Items:
  1.
  2.
  3.
  4.
  5.
Badge:
Image:
Clover Item ID:
Available: true/false
```

## Important Notes

1. **Do NOT publish prices** until confirmed by the restaurant owner.
2. **Do NOT enable package checkout** until each package is mapped to a
   real Clover item or verified ordering configuration.
3. The `NEXT_PUBLIC_ENABLE_LIVE_CHECKOUT` flag must remain `false`
   until the controlled payment test is completed.
4. When no packages are available, the homepage shows a polished
   "Packages Coming Soon" state automatically.

## Clover Integration

Each package that supports online ordering must have a valid
`cloverItemId` that corresponds to an item in the Clover inventory.
Without this ID, the "Order This Package" button will be disabled.

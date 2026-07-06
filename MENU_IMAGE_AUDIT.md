# Menu Image Audit

## Overview
This audit ensures that all real client photos are prioritized and that duplicate images are not improperly reused across unrelated items.

## Image Sources & Decisions

| Menu Item | Primary Image | Secondary Images | Source | Duplicate Status | Corrective Action / Decision |
|---|---|---|---|---|---|
| **Mix Grill** | `/menu/grilled-dishes/mix-grill-client.jpeg` | `/menu/grilled-dishes/mixed-platter-client.jpeg` | Real Client | Original | Set primary and secondary gallery. |
| **Shish Tawook Plate** | `/menu/grilled-dishes/519df48a-9516-4f65-9fdc-44b0fdddfa2c-retina-large.avif` | - | Real Client | Original | Use genuine photo. |
| **Hummus** | `/menu/appetizers/hummus-client.jpeg` | - | Real Client | Original | Use genuine photo. |
| **Baba Ghanoush** | `/menu/appetizers/hummus-client.jpeg` | - | Real Client | Duplicate | **Removed.** Baba Ghanoush will use a unique generated image. |
| **Cheese Rolls** | `/menu/appetizers/cheese-rolls-client.jpeg` | - | Real Client | Original | Use genuine photo. |
| **Fried Kubbeh** | `/menu/appetizers/fried-kubbeh-alt.png` | `/menu/appetizers/fried-kubbeh.png` | Real Client / DoorDash | Original | Combined real photo + DoorDash crop into gallery. |
| **Grape Leaves** | `/menu/appetizers/grape-leaves.avif` | `/menu/grilled-dishes/db36a796-d752-4a75-b29c-ef6aa860f08d-retina-large.avif` | Real Client | Original | Use genuine photo. |
| **Baklawa** | `/menu/desserts/baklawa-client.jpeg` | `/menu/desserts/Desserts.png` | Real Client | Original | Use genuine photo and DoorDash category image. |
| **Fattoush Salad** | `/menu/salads/fattoush-salad.png` | - | Real Client / DoorDash | Original | Kept as is. |
| **Greek Salad** | `/menu/salads/fattoush-salad.png` | - | Real Client | Duplicate | **Removed.** Will use a unique generated image. |
| **Lamb Cubes** | `/menu/grilled-dishes/mix-grill.jpeg` | - | Real Client | Duplicate | **Removed.** Will use a unique generated image. |
| **Chicken Shawarma Platter** | `/menu/main-dishes/chicken-shawarma-plate.png` | - | Generated | Original | Keep generated as no client photo exists. |
| **Arabic Shawarma Platter** | `/menu/specialties/arabic-shawarma-plate.png` | - | Real Client / DoorDash | Original | Kept as is. |
| **Stuffed Grilled Pita** | `/menu/specialties/specialties-cover.png` | - | DoorDash | Duplicate | **Removed.** Will generate unique image. |

*Note: For all DoorDash screenshots that are unsuitable for programmatic cropping (e.g., text overlays, UI elements covering food), unique generated images are used instead of uploading low-quality screenshots to production.*

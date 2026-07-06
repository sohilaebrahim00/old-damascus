// ============================================================
// Menu Image Map
// Maps menu item IDs, Clover IDs, slugs, and names to their image paths.
// Real client photos are used where available.
// Generated placeholder images are used where no real photo exists.
// Upload food images to public/menu/ and update this file.
// ============================================================

export interface ImageMapping {
  primary: string;
  gallery: string[];
}

export const MENU_IMAGE_MAP: Record<string, string | ImageMapping> = {
  // ── Grilled Dishes ──────────────────────────────────────────
  "item-shish-tawook-plate": "/menu/grilled-dishes/shish-tawook-plate.avif",
  "ITEM_SHISH_TAWOOK_PLATE_ID": "/menu/grilled-dishes/shish-tawook-plate.avif",
  "shish-tawook-plate": "/menu/grilled-dishes/shish-tawook-plate.avif",
  "shish tawook plate": "/menu/grilled-dishes/shish-tawook-plate.avif",

  "item-mix-grill": {
    primary: "/menu/grilled-dishes/mix-grill-client.jpeg",
    gallery: ["/menu/grilled-dishes/mix-grill-client.jpeg", "/menu/grilled-dishes/mixed-platter-client.jpeg"],
  },
  "ITEM_MIX_GRILL_ID": {
    primary: "/menu/grilled-dishes/mix-grill-client.jpeg",
    gallery: ["/menu/grilled-dishes/mix-grill-client.jpeg", "/menu/grilled-dishes/mixed-platter-client.jpeg"],
  },
  "mix-grill": {
    primary: "/menu/grilled-dishes/mix-grill-client.jpeg",
    gallery: ["/menu/grilled-dishes/mix-grill-client.jpeg", "/menu/grilled-dishes/mixed-platter-client.jpeg"],
  },
  "mix grill": {
    primary: "/menu/grilled-dishes/mix-grill-client.jpeg",
    gallery: ["/menu/grilled-dishes/mix-grill-client.jpeg", "/menu/grilled-dishes/mixed-platter-client.jpeg"],
  },

  "item-lamb-cubes": "/menu/grilled-dishes/lamb-cubes.png",
  "lamb-cubes": "/menu/grilled-dishes/lamb-cubes.png",
  "lamb cubes": "/menu/grilled-dishes/lamb-cubes.png",

  // ── Main Dishes ──────────────────────────────────────────────
  "item-chicken-mandi": "/menu/main-dishes/main-dishes-cover.png",
  "chicken-mandi": "/menu/main-dishes/main-dishes-cover.png",

  "item-chicken-shawarma-plate": "/menu/main-dishes/chicken-shawarma-plate.png",
  "chicken-shawarma-plate": "/menu/main-dishes/chicken-shawarma-plate.png",

  "item-lamb-mandi": "/menu/main-dishes/lamb-mandi.png",
  "ITEM_LAMB_MANDI_ID": "/menu/main-dishes/lamb-mandi.png",
  "lamb-mandi": "/menu/main-dishes/lamb-mandi.png",
  "lamb over rice (mandi)": "/menu/main-dishes/lamb-mandi.png",
  "lamb over rice mandi": "/menu/main-dishes/lamb-mandi.png",

  // ── Specialties ─────────────────────────────────────────────
  "item-arabic-shawarma-plate": "/menu/specialties/arabic-shawarma-plate.png",
  "ITEM_ARABIC_SHAWARMA_PLATE_ID": "/menu/specialties/arabic-shawarma-plate.png",
  "arabic-shawarma-plate": "/menu/specialties/arabic-shawarma-plate.png",
  "arabic-shawarma-platter": "/menu/specialties/arabic-shawarma-plate.png",
  "arabic shawarma platter": "/menu/specialties/arabic-shawarma-plate.png",

  "item-stuffed-grilled-pita": "/menu/specialties/stuffed-grilled-pita.png",
  "stuffed-grilled-pita": "/menu/specialties/stuffed-grilled-pita.png",

  // ── Appetizers ──────────────────────────────────────────────
  "item-hummus": "/menu/appetizers/hummus-client.jpeg",
  "ITEM_HUMMUS_ID": "/menu/appetizers/hummus-client.jpeg",
  "hummus": "/menu/appetizers/hummus-client.jpeg",

  "item-grape-leaves": "/menu/appetizers/grape-leaves.avif",
  "ITEM_GRAPE_LEAVES_ID": "/menu/appetizers/grape-leaves.avif",
  "grape-leaves": "/menu/appetizers/grape-leaves.avif",
  "grape leaves  8 pieces": "/menu/appetizers/grape-leaves.avif",
  "grape leaves - 8 pieces": "/menu/appetizers/grape-leaves.avif",

  "item-fried-kubbeh": {
    primary: "/menu/appetizers/fried-kubbeh-alt.png",
    gallery: ["/menu/appetizers/fried-kubbeh-alt.png", "/menu/appetizers/fried-kubbeh.png"],
  },
  "ITEM_FRIED_KUBBEH_ID": {
    primary: "/menu/appetizers/fried-kubbeh-alt.png",
    gallery: ["/menu/appetizers/fried-kubbeh-alt.png", "/menu/appetizers/fried-kubbeh.png"],
  },
  "fried-kubbeh": {
    primary: "/menu/appetizers/fried-kubbeh-alt.png",
    gallery: ["/menu/appetizers/fried-kubbeh-alt.png", "/menu/appetizers/fried-kubbeh.png"],
  },
  "fried kubbeh  3 pieces": {
    primary: "/menu/appetizers/fried-kubbeh-alt.png",
    gallery: ["/menu/appetizers/fried-kubbeh-alt.png", "/menu/appetizers/fried-kubbeh.png"],
  },
  "fried kubbeh - 3 pieces": {
    primary: "/menu/appetizers/fried-kubbeh-alt.png",
    gallery: ["/menu/appetizers/fried-kubbeh-alt.png", "/menu/appetizers/fried-kubbeh.png"],
  },

  "item-baba-ghanoush": "/menu/appetizers/baba-ghanoush.png",
  "baba-ghanoush": "/menu/appetizers/baba-ghanoush.png",

  "item-cheese-rolls": "/menu/appetizers/cheese-rolls-client.jpeg",
  "ITEM_CHEESE_ROLLS_ID": "/menu/appetizers/cheese-rolls-client.jpeg",
  "cheese-rolls": "/menu/appetizers/cheese-rolls-client.jpeg",
  "cheese rolls": "/menu/appetizers/cheese-rolls-client.jpeg",

  // ── Salads ──────────────────────────────────────────────────
  "item-greek-salad": "/menu/salads/greek-salad.png",
  "greek-salad": "/menu/salads/greek-salad.png",

  "item-fattoush-salad": "/menu/salads/fattoush-salad.png",
  "ITEM_FATTOUSH_SALAD_ID": "/menu/salads/fattoush-salad.png",
  "fattoush-salad": "/menu/salads/fattoush-salad.png",
  "fattoush salad": "/menu/salads/fattoush-salad.png",

  // ── Sandwiches ──────────────────────────────────────────────
  "item-chicken-shawarma-sandwich": "/menu/sandwiches/chicken-shawarma-sandwich.png",
  "71T948RMM7VC8": "/menu/sandwiches/chicken-shawarma-sandwich.png",
  "chicken-shawarma-sandwich": "/menu/sandwiches/chicken-shawarma-sandwich.png",
  "chicken-shawarma-wrap": "/menu/sandwiches/chicken-shawarma-sandwich.png",
  "chicken shawarma wrap": "/menu/sandwiches/chicken-shawarma-sandwich.png",

  "item-beef-kabob-sandwich": "/menu/sandwiches/beef-kofta-sandwich.png",
  "YGPAR9058VGW2": "/menu/sandwiches/beef-kofta-sandwich.png",
  "beef-kabob-sandwich": "/menu/sandwiches/beef-kofta-sandwich.png",
  "beef-kabab-sandwich": "/menu/sandwiches/beef-kofta-sandwich.png",
  "beef kabab sandwich": "/menu/sandwiches/beef-kofta-sandwich.png",
  "beef kabob sandwich": "/menu/sandwiches/beef-kofta-sandwich.png",

  "item-shish-tawook-wrap": "/menu/sandwiches/shish-tawook-sandwich.png",
  "T9DVYZY8V7396": "/menu/sandwiches/shish-tawook-sandwich.png",
  "shish-tawook-wrap": "/menu/sandwiches/shish-tawook-sandwich.png",
  "shish tawook wrap": "/menu/sandwiches/shish-tawook-sandwich.png",

  "item-falafel-sandwich": "/menu/sandwiches/falafel-sandwich.png",
  "X7J8DGH1S2SWT": "/menu/sandwiches/falafel-sandwich.png",
  "falafel-sandwich": "/menu/sandwiches/falafel-sandwich.png",
  "falafel-wrap": "/menu/sandwiches/falafel-sandwich.png",
  "falafel sandwich": "/menu/sandwiches/falafel-sandwich.png",
  "falafel wrap": "/menu/sandwiches/falafel-sandwich.png",

  "item-adana-kebab-sandwich": "/menu/sandwiches/adana-kabob-sandwich.png",
  "6B6EXEM4TA9SA": "/menu/sandwiches/adana-kabob-sandwich.png",
  "adana-kebab-sandwich": "/menu/sandwiches/adana-kabob-sandwich.png",
  "adana-kabob-sandwich": "/menu/sandwiches/adana-kabob-sandwich.png",
  "adana kebab sandwich": "/menu/sandwiches/adana-kabob-sandwich.png",

  // ── Kids Menu ────────────────────────────────────────────────
  "item-chicken-nuggets": "/menu/kids-menu/chicken-nuggets.png",
  "E5QRFFKK6B0WP": "/menu/kids-menu/chicken-nuggets.png",
  "chicken-nuggets": "/menu/kids-menu/chicken-nuggets.png",
  "chicken-nuggets-6-pcs": "/menu/kids-menu/chicken-nuggets.png",
  "chicken nuggets 6 pcs": "/menu/kids-menu/chicken-nuggets.png",
  "chicken nuggets (6) pcs": "/menu/kids-menu/chicken-nuggets.png",

  "item-chicken-tenders": "/menu/kids-menu/chicken-tenders.png",
  "8JTN1BY4469JG": "/menu/kids-menu/chicken-tenders.png",
  "chicken-tenders": "/menu/kids-menu/chicken-tenders.png",
  "chicken-tenders-3-pcs": "/menu/kids-menu/chicken-tenders.png",
  "chicken tenders 3 pcs": "/menu/kids-menu/chicken-tenders.png",
  "chicken tenders (3) pcs": "/menu/kids-menu/chicken-tenders.png",

  // ── Desserts ─────────────────────────────────────────────────
  "item-chocolate-cake": "/menu/desserts/chocolate-cake.png",
  "ITEM_CHOCOLATE_CAKE_ID": "/menu/desserts/chocolate-cake.png",
  "chocolate-cake": "/menu/desserts/chocolate-cake.png",
  "chocolate cake": "/menu/desserts/chocolate-cake.png",

  "item-baklawa": {
    primary: "/menu/desserts/baklawa-client.jpeg",
    gallery: ["/menu/desserts/baklawa-client.jpeg", "/menu/desserts/Desserts.png"],
  },
  "ITEM_BAKLAWA_ID": {
    primary: "/menu/desserts/baklawa-client.jpeg",
    gallery: ["/menu/desserts/baklawa-client.jpeg", "/menu/desserts/Desserts.png"],
  },
  "baklawa": {
    primary: "/menu/desserts/baklawa-client.jpeg",
    gallery: ["/menu/desserts/baklawa-client.jpeg", "/menu/desserts/Desserts.png"],
  },
  "baklawa  4 pieces": {
    primary: "/menu/desserts/baklawa-client.jpeg",
    gallery: ["/menu/desserts/baklawa-client.jpeg", "/menu/desserts/Desserts.png"],
  },
  "baklawa - 4 pieces": {
    primary: "/menu/desserts/baklawa-client.jpeg",
    gallery: ["/menu/desserts/baklawa-client.jpeg", "/menu/desserts/Desserts.png"],
  },

  // ── Drinks ──────────────────────────────────────────────────
  "item-turkish-coffee": "/menu/drinks/turkish-coffee.png",
  "ITEM_TURKISH_COFFEE_ID": "/menu/drinks/turkish-coffee.png",
  "turkish-coffee": "/menu/drinks/turkish-coffee.png",
  "turkish coffee": "/menu/drinks/turkish-coffee.png",

  "item-soft-drinks": "/menu/drinks/soft-drinks.png",
  "ITEM_SOFT_DRINKS_ID": "/menu/drinks/soft-drinks.png",
  "soft-drinks": "/menu/drinks/soft-drinks.png",
  "soft-drink": "/menu/drinks/soft-drinks.png",
  "soft drink": "/menu/drinks/soft-drinks.png",

  "item-lemon-mint": "/menu/drinks/lemon-mint.png",
  "lemon-mint": "/menu/drinks/lemon-mint.png",
  "lemon mint": "/menu/drinks/lemon-mint.png",
};

/** Returns mapping or null if not found to allow fallbacks */
export function getMenuItemMapping(key: string): ImageMapping | null {
  // Normalize key by lowercasing to handle casing mismatches
  const normalizedKey = key.toLowerCase();
  
  // Try exact match, normalized match, or fallback
  const map = MENU_IMAGE_MAP[key] || MENU_IMAGE_MAP[normalizedKey];
  
  if (!map) {
    return null;
  }
  if (typeof map === "string") {
    return { primary: map, gallery: [map] };
  }
  return map;
}

export function getMenuItemImage(slug: string): string {
  const mapping = getMenuItemMapping(slug);
  return mapping ? mapping.primary : "";
}

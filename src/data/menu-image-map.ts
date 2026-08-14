// ============================================================
// Menu Image Map
// Maps menu item IDs, Clover IDs, slugs, and names to photography.
//
// All entries point at /photos/*.webp — the optimised real
// photography set. Lookups are case-insensitive, so keys are
// written lowercase (slug and/or dish name).
// ============================================================

export interface ImageMapping {
  primary: string;
  gallery: string[];
}

const P = (slug: string) => `/photos/${slug}.webp`;

/** Build a mapping from a primary photo plus optional extra gallery shots. */
function shot(primary: string, ...gallery: string[]): ImageMapping {
  return { primary: P(primary), gallery: [P(primary), ...gallery.map(P)] };
}

export const MENU_IMAGE_MAP: Record<string, string | ImageMapping> = {
  // ── Grilled Dishes ──────────────────────────────────────────
  "item-mix-grill": shot("mix-grill-plate", "mixed-grill-table"),
  "mix-grill": shot("mix-grill-plate", "mixed-grill-table"),
  "mix grill": shot("mix-grill-plate", "mixed-grill-table"),
  "mix grill plate": shot("mix-grill-plate", "mixed-grill-table"),
  "mixed grill": shot("mix-grill-plate", "mixed-grill-table"),

  "item-shish-tawook-plate": shot("shish-tawook-plate"),
  "shish-tawook-plate": shot("shish-tawook-plate"),
  "shish tawook plate": shot("shish-tawook-plate"),
  "shish tawook skewers": shot("shish-tawook-skewers", "shish-tawook-plate"),
  "shish-tawook-skewers": shot("shish-tawook-skewers", "shish-tawook-plate"),

  "kofta kabab plate": shot("kofta-kabab-plate"),
  "kofta-kabab-plate": shot("kofta-kabab-plate"),
  // Real in-restaurant frame of kofta skewers on the board.
  "kofta kabab skewers": shot("mixed-grill-table", "kofta-kabab-plate"),
  "kofta-kabab-skewers": shot("mixed-grill-table", "kofta-kabab-plate"),

  "adana kabob plate": shot("grill-board", "beef-kebab-skewers"),
  "adana-kabob-plate": shot("grill-board", "beef-kebab-skewers"),
  "adana kabab skewers": shot("beef-kebab-skewers"),
  "adana-kabab-skewers": shot("beef-kebab-skewers"),
  "beef kebab skewers": shot("beef-kebab-skewers"),

  "lamb cubes skewers": shot("lamb-cubes-skewers", "lamb-cubes"),
  "lamb-cubes-skewers": shot("lamb-cubes-skewers", "lamb-cubes"),
  "lamb cubes": shot("lamb-cubes"),

  "arayes plate 2 pcs": shot("mixed-grill-table"),
  "arayes-plate-2-pcs": shot("mixed-grill-table"),
  "item-stuffed-grilled-pita": shot("mixed-grill-table"),

  // ── Main Dishes ─────────────────────────────────────────────
  "item-chicken-shawarma-plate": shot("chicken-shawarma-plate"),
  "chicken-shawarma-plate": shot("chicken-shawarma-plate"),
  "chicken shawarma plate": shot("chicken-shawarma-plate"),
  "arabic chicken shawarma": shot("chicken-shawarma-plate"),

  "item-lamb-mandi": shot("mandi-lamb"),
  "mandi lamb": shot("mandi-lamb"),
  "mandi-lamb": shot("mandi-lamb"),
  // Chicken mandi gets the chicken-over-rice frame rather than the lamb one.
  "mandi chicken": shot("kabsa-chicken", "mandi-lamb"),
  "mandi-chicken": shot("kabsa-chicken", "mandi-lamb"),

  "kabsa lamb": shot("kabsa-lamb"),
  "kabsa-lamb": shot("kabsa-lamb"),
  "kabsa chicken": shot("kabsa-chicken"),
  "kabsa-chicken": shot("kabsa-chicken"),

  "falafel plate with rice": shot("falafel-plate-rice", "falafel-plate"),
  "falafel-plate-with-rice": shot("falafel-plate-rice", "falafel-plate"),

  "wings 8pc": shot("wings-8pc"),
  "wings-8pc": shot("wings-8pc"),
  rice: shot("mandi-lamb"),

  // ── Family Platters ─────────────────────────────────────────
  "family plate": shot("family-plate"),
  "family-plate": shot("family-plate"),
  "family plate medium 2-3 people": shot("family-plate"),
  "family-plate-medium-2-3-people": shot("family-plate"),
  "family plate (large) 4-6 people": shot("family-plate"),
  "family-plate-large-4-6-people": shot("family-plate"),
  "family plate xl 6-10 people": shot("family-plate"),
  "family-plate-xl-6-10-people": shot("family-plate"),

  // ── Sandwiches ──────────────────────────────────────────────
  "item-chicken-shawarma-sandwich": shot("shawarma-sandwich"),
  "chicken-shawarma-sandwich": shot("shawarma-sandwich"),
  "chicken shawarma wrap": shot("shawarma-sandwich"),
  "shawarma sandwich": shot("shawarma-sandwich"),

  "item-falafel-sandwich": shot("falafel-sandwich"),
  "falafel-sandwich": shot("falafel-sandwich"),
  "falafel sandwich": shot("falafel-sandwich"),

  "item-shish-tawook-wrap": shot("shish-tawook-skewers"),
  "shish-tawook-wrap": shot("shish-tawook-skewers"),
  "shish tawook sandwich": shot("shish-tawook-skewers"),
  "shish-tawook-sandwich": shot("shish-tawook-skewers"),
  "item-beef-kabob-sandwich": shot("beef-kebab-skewers"),
  "beef-kabob-sandwich": shot("beef-kebab-skewers"),
  "item-adana-kebab-sandwich": shot("beef-kebab-skewers"),
  "adana-kebab-sandwich": shot("beef-kebab-skewers"),
  "adana kabob sandwich": shot("beef-kebab-skewers"),
  "adana-kabob-sandwich": shot("beef-kebab-skewers"),
  "kofta kabab sandwich": shot("kofta-kabab-plate"),
  "kofta-kabab-sandwich": shot("kofta-kabab-plate"),

  // ── Appetizers ──────────────────────────────────────────────
  "item-hummus": shot("hummus", "hummus-client"),
  hummus: shot("hummus", "hummus-client"),

  "item-baba-ghanoush": shot("baba-ghanoush"),
  "baba-ghanoush": shot("baba-ghanoush"),
  "baba ghanoush": shot("baba-ghanoush"),
  "baba ghanouj": shot("baba-ghanoush"),

  "item-fried-kubbeh": shot("fried-kibbeh"),
  "fried-kubbeh": shot("fried-kibbeh"),
  "kubbeh 3pcs": shot("fried-kibbeh"),
  "kubbeh-3pcs": shot("fried-kibbeh"),

  "item-cheese-rolls": shot("cheese-rolls", "cheese-rolls-client"),
  "cheese-rolls": shot("cheese-rolls", "cheese-rolls-client"),
  "cheese rolls 4pcs": shot("cheese-rolls", "cheese-rolls-client"),
  "cheese-rolls-4pcs": shot("cheese-rolls", "cheese-rolls-client"),

  "item-grape-leaves": shot("grape-leaves"),
  "grape-leaves": shot("grape-leaves"),
  "grape leaves 8 pcs": shot("grape-leaves"),
  "grape-leaves-8-pcs": shot("grape-leaves"),

  "falafel 8pc": shot("falafel-8pc"),
  "falafel-8pc": shot("falafel-8pc"),
  labneh: shot("labneh"),
  "french fries": shot("french-fries"),
  "french-fries": shot("french-fries"),

  // ── Salads ──────────────────────────────────────────────────
  "item-fattoush": shot("fattoush-salad"),
  fattoush: shot("fattoush-salad"),
  "fattoush-salad": shot("fattoush-salad"),
  "item-greek-salad": shot("greek-salad"),
  "greek-salad": shot("greek-salad"),
  "greek salad": shot("greek-salad"),
  "caesar salad": shot("caesar-salad"),
  "caesar-salad": shot("caesar-salad"),
  "turkish salad": shot("greek-salad"),
  "turkish-salad": shot("greek-salad"),
  tabouleh: shot("fattoush-salad"),

  // ── Desserts ────────────────────────────────────────────────
  "item-baklawa": shot("baklava", "baklawa-client"),
  baklawa: shot("baklava", "baklawa-client"),
  "baklawa 4pcs": shot("baklava", "baklawa-client"),
  "baklawa-4pcs": shot("baklava", "baklawa-client"),
  baklava: shot("baklava", "baklawa-client"),

  "booza (arabic ice cream)": shot("booza"),
  "booza-arabic-ice-cream": shot("booza"),
  booza: shot("booza"),
  "cheese cake": shot("cheese-cake"),
  "cheese-cake": shot("cheese-cake"),
  "carrot cake": shot("carrot-cake"),
  "carrot-cake": shot("carrot-cake"),
  "chocolate cake": shot("chocolate-cake"),
  "chocolate-cake": shot("chocolate-cake"),

  // ── Kids Menu ───────────────────────────────────────────────
  "item-chicken-nuggets": shot("chicken-nuggets", "french-fries"),
  "chicken-nuggets": shot("chicken-nuggets", "french-fries"),
  "chicken nuggets (6) pcs": shot("chicken-nuggets", "french-fries"),
  "item-chicken-tenders": shot("chicken-nuggets", "french-fries"),
  "chicken-tenders": shot("chicken-nuggets", "french-fries"),
  "tender chicken 3pc": shot("chicken-tenders", "french-fries"),
  "tender-chicken-3pc": shot("chicken-tenders", "french-fries"),
  "nuggets chicken 6pc": shot("chicken-nuggets", "french-fries"),
  "nuggets-chicken-6pc": shot("chicken-nuggets", "french-fries"),

  // ── Drinks ──────────────────────────────────────────────────
  "fresh lemonade": shot("fresh-juices"),
  "fresh-lemonade": shot("fresh-juices"),
  "lemon-mint": shot("lemon-mint"),
  "lemon mint": shot("lemon-mint"),
  "virgin mojito": shot("virgin-mojito"),
  "virgin-mojito": shot("virgin-mojito"),

  "mango smoothie": shot("mango-smoothie", "fresh-juices"),
  "mango-smoothie": shot("mango-smoothie", "fresh-juices"),
  "strawberry smoothie": shot("strawberry-smoothie", "fresh-juices"),
  "strawberry-smoothie": shot("strawberry-smoothie", "fresh-juices"),
  "banana strawberry": shot("banana-strawberry", "fresh-juices"),
  "banana-strawberry": shot("banana-strawberry", "fresh-juices"),
  "pineapple juice": shot("pineapple-juice", "fresh-juices"),
  "pineapple-juice": shot("pineapple-juice", "fresh-juices"),

  "oreo milkshake": shot("oreo-milkshake"),
  "oreo-milkshake": shot("oreo-milkshake"),
  "nuttella milkshake": shot("nutella-milkshake"),
  "nuttella-milkshake": shot("nutella-milkshake"),
  "strawberry milkshake": shot("strawberry-smoothie"),
  "strawberry-milkshake": shot("strawberry-smoothie"),

  "ice tea": shot("ice-tea"),
  "ice-tea": shot("ice-tea"),
  cocacola: shot("coca-cola"),
  "coca-cola": shot("coca-cola"),
  "coke zero": shot("coca-cola"),
  "coke-zero": shot("coca-cola"),
  "diet cocacola": shot("diet-coke"),
  "diet-cocacola": shot("diet-coke"),
  sprite: shot("sprite"),
  fanta: shot("fanta"),
  redbull: shot("redbull"),
  "dr pepper": shot("dr-pepper"),
  "dr-pepper": shot("dr-pepper"),
  vimto: shot("pineapple-juice"),
  laziza: shot("laziza"),
  "yougrt drink": shot("labneh"),
  "yougrt-drink": shot("labneh"),
  water: shot("water"),
  "sparkling water": shot("water"),
  "sparkling-water": shot("water"),
  // Hot drinks get a hot-drink frame; iced tea keeps the cold one.
  tea: shot("turkish-coffee"),
  "american coffee": shot("turkish-coffee"),
  "american-coffee": shot("turkish-coffee"),
  "item-turkish-coffee": shot("turkish-coffee"),
  "turkish coffee": shot("turkish-coffee"),
  "turkish-coffee": shot("turkish-coffee"),
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

/** Editorial / storytelling photography used outside the menu grid. */
export const BRAND_PHOTOS = {
  hero: "/images/hero/hero-4k.webp",
  signature: [P("mix-grill-plate"), P("mandi-lamb"), P("chicken-shawarma-plate")],
  heritage: P("family-plate"),
  ingredients: P("hummus"),
  recipes: P("fried-kibbeh"),
  finale: P("booza"),
  placeholder: P("placeholder"),
} as const;

export const CATEGORY_PHOTOS: Record<string, string> = {
  appetizers: P("hummus"),
  salads: P("fattoush-salad"),
  "main-dishes": P("mandi-lamb"),
  "grilled-dishes": P("shish-tawook-plate"),
  specialties: P("mix-grill-plate"),
  "family-platters": P("family-plate"),
  sandwiches: P("shawarma-sandwich"),
  desserts: P("booza"),
  drinks: P("fresh-juices"),
  "soft-drinks": P("fresh-juices"),
  "cold-drinks": P("fresh-juices"),
  // Hot drinks must never fall back to the iced-tea frame.
  "hot-drinks": P("turkish-coffee"),
  smoothies: P("banana-strawberry"),
  "kids-menu": P("chicken-nuggets"),
};

/**
 * Convert approved food photography to WebP @ 82% into public/photos/.
 * Source files stay untouched; a later cleanup step removes them.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.argv[2];
const OUT_DIR = path.join(ROOT, "public", "photos");

// source (relative to public/) -> output slug
const MAP = {
  // ---- Series B: Studio Plate (1448x1086 landscape) ----
  "menu/Arabic Chicken Shawarma.png": "chicken-shawarma-plate",
  "menu/Mix Grill Plate.png": "mix-grill-plate",
  "menu/Shish Tawok Plate.png": "shish-tawook-plate",
  "menu/Kofta Kabab Plate.png": "kofta-kabab-plate",
  "menu/falfel.png": "falafel-plate",
  "menu/Baklava.png": "baklava",
  "menu/Shish Tawok Skewers.png": "shish-tawook-skewers",
  "menu/Beef Kebab Skewers.png": "beef-kebab-skewers",
  "menu/Lamb cubes Skewers.png": "lamb-cubes-skewers",
  "menu/Baba Ghanouj.png": "baba-ghanoush",

  // ---- Series C: Heritage (1254x1254 square) ----
  "menu/Mandi Lamb.png": "mandi-lamb",
  "menu/Family Plate.png": "family-plate",
  "menu/IMG_0766.png": "hummus",
  "menu/Fried Kibbeh.png": "fried-kibbeh",
  "menu/Fatouch Salad.png": "fattoush-salad",
  "menu/Shawarma Sandwich.png": "shawarma-sandwich",
  "menu/Booza.png": "booza",
  "menu/Greek Salad.png": "greek-salad",
  "menu/Cesar Salad.png": "caesar-salad",
  "menu/Kabsah Lamb.png": "kabsa-lamb",
  "menu/Labneh.png": "labneh",
  "menu/Yalnjee.png": "grape-leaves",
  "menu/Falafel 8 Pcs.png": "falafel-8pc",
  "menu/Cheese Roll.png": "cheese-rolls",
  "menu/Lamb Cubes.png": "lamb-cubes",
  "menu/Chocolate Cake.png": "chocolate-cake",
  "menu/Cheese Cake.png": "cheese-cake",
  "menu/Carrot Cake.png": "carrot-cake",
  "menu/Nuggets.png": "chicken-nuggets",
  "menu/Fries.png": "french-fries",
  "menu/Banana Straberry.png": "banana-strawberry",
  "menu/Oreo Milkshake.png": "oreo-milkshake",
  "menu/Nutella Milkshake.png": "nutella-milkshake",
  "menu/Ice Tea.png": "ice-tea",
  "menu/Lemon&Mint.png": "lemon-mint",
  "menu/Pineapple.png": "pineapple-juice",
  "menu/Cocacola.png": "coca-cola",
  "menu/Sprite.png": "sprite",
  "menu/Fanta.png": "fanta",
  "menu/Redbuall.png": "redbull",

  // ---- Series D: Real in-restaurant ----
  "menu/OLD Damascus.png": "fresh-juices",
  "menu/Kabseh Chicken.jpg.jpeg": "kabsa-chicken",
  "menu/Mango Smothie.jpg.jpeg": "mango-smoothie",
  "menu/STRAWberry.jpg.jpeg": "strawberry-smoothie",
  "menu/Mango.jpg.jpeg": "mango-juice",
  "menu/Diet Cocacola.jpg.jpeg": "diet-coke",
  "menu/Dr.Pepper.jpg.jpeg": "dr-pepper",
  "client-assets/drop/menu-photos/WhatsApp Image 2026-06-04 at 18.05.38.jpeg":
    "mixed-grill-table",
  "client-assets/drop/menu-photos/WhatsApp Image 2026-06-04 at 18.05.40.jpeg":
    "grill-board",
  "client-assets/drop/menu-photos/WhatsApp Image 2026-06-04 at 18.50.43 - Copy - Copy.jpeg":
    "hummus-client",
  "client-assets/drop/menu-photos/WhatsApp Image 2026-06-04 at 18.50.32 - Copy - Copy.jpeg":
    "cheese-rolls-client",
  "client-assets/drop/menu-photos/WhatsApp Image 2026-06-04 at 18.50.16 - Copy - Copy.jpeg":
    "baklawa-client",

  // ---- Misc kept ----
  "menu/placeholder.jpg": "placeholder",
};

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let inBytes = 0;
  let outBytes = 0;
  let done = 0;
  const missing = [];

  for (const [src, slug] of Object.entries(MAP)) {
    const abs = path.join(ROOT, "public", src);
    if (!fs.existsSync(abs)) {
      missing.push(src);
      continue;
    }
    const dest = path.join(OUT_DIR, slug + ".webp");
    const before = fs.statSync(abs).size;
    await sharp(abs)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest);
    const after = fs.statSync(dest).size;
    inBytes += before;
    outBytes += after;
    done++;
    console.log(
      `${slug.padEnd(24)} ${(before / 1024 / 1024).toFixed(2)}MB -> ${(
        after / 1024
      ).toFixed(0)}KB`
    );
  }

  console.log("\nconverted:", done);
  if (missing.length) console.log("MISSING:", missing);
  console.log(
    `total: ${(inBytes / 1024 / 1024).toFixed(1)}MB -> ${(
      outBytes / 1024 / 1024
    ).toFixed(1)}MB  (${(100 - (outBytes / inBytes) * 100).toFixed(1)}% smaller)`
  );
})();

/**
 * Compiles the real src/lib/menu-categories.ts and runs it against the live
 * Clover inventory, proving every category resolves to items and that the
 * serving order is correct. Not a mirror of the logic — the shipped module.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const OUT = path.join(os.tmpdir(), "od-menu-cat");
execSync(
  `npx tsc src/lib/menu-categories.ts --outDir "${OUT}" --module commonjs --target es2019 --skipLibCheck`,
  { stdio: "inherit" }
);
const mc = require(path.join(OUT, "menu-categories.js"));

const MID = process.env.CLOVER_MERCHANT_ID;
const TOKEN = process.env.CLOVER_ACCESS_TOKEN || process.env.CLOVER_API_TOKEN;
const BASE =
  (process.env.CLOVER_ENV || "sandbox") === "production"
    ? "https://api.clover.com"
    : "https://sandbox.dev.clover.com";

async function get(p) {
  const res = await fetch(`${BASE}/v3/merchants/${MID}${p}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function slugify(t) {
  return t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
}

(async () => {
  const cats = (await get("/categories?limit=200")).elements || [];
  const rawItems =
    (await get("/items?expand=categories&limit=500")).elements || [];

  // mirror the inventory-layer filters
  const items = rawItems.filter(
    (i) => !i.hidden && i.deleted !== true && i.isRevenue !== false
  );

  const categories = cats
    .filter((c) => !c.deleted)
    .map((c) => ({ id: c.id, name: c.name, slug: slugify(c.name), sortOrder: c.sortOrder }));

  console.log("=== SERVING ORDER (Clover sortOrder ignored) ===");
  const ordered = mc.sortCategories(categories);
  ordered.forEach((c, i) =>
    console.log(`  ${String(i + 1).padStart(2)}. ${c.name}   (clover sortOrder=${c.sortOrder})`)
  );

  const countFor = (selection) => {
    const matches = mc.makeCategoryPredicate(categories, selection);
    return items.filter((it) => {
      const ref = it.categories?.elements?.[0];
      if (!ref) return false;
      return matches(categories.find((x) => x.id === ref.id));
    }).length;
  };

  console.log("\n=== EVERY NAV CATEGORY RESOLVES (and stays exact) ===");
  let empties = 0;
  for (const c of ordered) {
    const n = countFor(c.slug);
    console.log(`  ${n > 0 ? "OK  " : "EMPTY"} ${String(n).padStart(3)}  ${c.name}`);
    if (n === 0) empties++;
  }

  console.log("\n=== SITE LINK TOKENS RESOLVE TO A LIVE CATEGORY ===");
  const tokens = [
    "main-dishes", "specialties", "family-platters", "sandwiches",
    "appetizers", "salads", "desserts", "drinks", "kids-menu",
  ];
  let unresolved = 0;
  for (const t of tokens) {
    const matches = mc.makeCategoryPredicate(categories, t);
    const hit = categories.filter((c) => matches(c));
    const n = countFor(t);
    console.log(
      `  ${hit.length ? "OK  " : "MISS"} ${t.padEnd(18)} ${String(n).padStart(3)} items -> ${hit.map((h) => h.name).join(", ") || "(nothing)"}`
    );
    if (!hit.length || n === 0) unresolved++;
  }

  console.log("\n=== CUSTOMER-FACING LABELS (Clover value kept internally) ===");
  for (const c of ordered) {
    const label = mc.categoryDisplayName(c);
    const changed = label !== c.name;
    console.log(
      `  ${changed ? "->" : "  "} ${String(c.name).padEnd(24)} ${changed ? label : ""}`
    );
  }

  console.log("\n=== GRILLED COLLECTION (display lens, not a Clover category) ===");
  const grilled = items.filter((it) => {
    const ref = it.categories?.elements?.[0];
    const cat = ref ? categories.find((x) => x.id === ref.id) : null;
    return mc.isGrilledItem({ name: it.name, categoryName: cat?.name });
  });
  console.log(`  ${grilled.length} items collected from real categories:`);
  const bySource = {};
  for (const it of grilled) {
    const ref = it.categories?.elements?.[0];
    const cat = ref ? categories.find((x) => x.id === ref.id) : null;
    const k = cat?.name || "(uncategorised)";
    (bySource[k] = bySource[k] || []).push(it.name);
  }
  for (const [k, v] of Object.entries(bySource)) {
    console.log(`    ${k}:`);
    for (const n of v) console.log(`      - ${n}`);
  }

  const grillEmpty = grilled.length === 0;
  console.log(
    `\nRESULT: ${empties} empty categories, ${unresolved} unresolved site tokens, grilled collection ${grilled.length} items`
  );
  process.exit(empties === 0 && unresolved === 0 && !grillEmpty ? 0 : 1);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});

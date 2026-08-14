/**
 * Read-only Clover diagnostic. Makes exactly two GET requests and reports
 * how the live inventory actually looks, so the menu mapping can be fixed
 * against real data rather than assumptions.
 */
const fs = require("fs");
const path = require("path");

// minimal .env.local loader
const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

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
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

(async () => {
  const cats = await get("/categories?limit=200");
  const items = await get(
    "/items?expand=categories,modifierGroups,taxRates&limit=500"
  );

  const C = cats.elements || [];
  const I = items.elements || [];

  console.log("=== CATEGORIES ===");
  console.log("count:", C.length);
  for (const c of C) {
    console.log(
      `  ${String(c.sortOrder ?? "-").padStart(3)}  ${c.id}  ${c.name}${c.deleted ? "  [DELETED]" : ""}`
    );
  }

  console.log("\n=== ITEMS ===");
  console.log("count:", I.length);

  const availVals = {};
  const hiddenVals = {};
  let noCategory = 0;
  let priceZero = 0;
  const perCat = {};

  for (const it of I) {
    availVals[String(it.available)] = (availVals[String(it.available)] || 0) + 1;
    hiddenVals[String(it.hidden)] = (hiddenVals[String(it.hidden)] || 0) + 1;
    const cat = it.categories?.elements?.[0];
    if (!cat) noCategory++;
    else perCat[cat.name || cat.id] = (perCat[cat.name || cat.id] || 0) + 1;
    if (!it.price) priceZero++;
  }

  console.log("\n  item.available distribution:", availVals);
  console.log("  item.hidden distribution   :", hiddenVals);
  console.log("  items with NO category     :", noCategory);
  console.log("  items with price 0/absent  :", priceZero);

  console.log("\n  items per category (from expand):");
  for (const [k, v] of Object.entries(perCat).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(v).padStart(3)}  ${k}`);
  }

  // how many would the current mapper mark unavailable?
  const wouldBeUnavailable = I.filter(
    (it) => !(it.available !== false && !it.hidden)
  );
  console.log(
    `\n  >>> current rule "available !== false && !hidden" marks ${wouldBeUnavailable.length}/${I.length} UNAVAILABLE`
  );
  for (const it of wouldBeUnavailable.slice(0, 12)) {
    console.log(
      `      ${it.name}  available=${it.available} hidden=${it.hidden}`
    );
  }

  // sample raw item so we can see every field Clover really sends
  console.log("\n=== SAMPLE RAW ITEM ===");
  console.log(JSON.stringify(I[0], null, 2).slice(0, 1200));
})().catch((e) => {
  console.error("DIAGNOSTIC FAILED:", e.message);
  process.exit(1);
});

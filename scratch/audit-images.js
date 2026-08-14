/**
 * Full image-mapping review for the live Clover catalogue.
 * Reports the photo each dish resolves to and every remaining shared photo.
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

const OUT = path.join(os.tmpdir(), "od-img-audit");
execSync(
  `npx tsc src/data/menu-image-map.ts src/lib/menu-categories.ts --outDir "${OUT}" --module commonjs --target es2019 --skipLibCheck`,
  { stdio: "inherit" }
);
const map = require(path.join(OUT, "data/menu-image-map.js"));
const cats = require(path.join(OUT, "lib/menu-categories.js"));

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
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

const slugify = (t) =>
  t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");

(async () => {
  const catList = (await get("/categories?limit=200")).elements || [];
  const items = ((await get("/items?expand=categories&limit=500")).elements || [])
    .filter((i) => !i.hidden && i.deleted !== true && i.isRevenue !== false);

  const catName = (it) => {
    const ref = it.categories?.elements?.[0];
    return ref ? catList.find((c) => c.id === ref.id)?.name || "?" : "(none)";
  };

  const resolve = (it) => {
    const m =
      map.getMenuItemMapping(it.id) ||
      map.getMenuItemMapping(it.name) ||
      map.getMenuItemMapping(slugify(it.name));
    if (m) return { photo: m.primary, mapped: true };
    const fb =
      map.CATEGORY_PHOTOS[cats.canonicalToken(catName(it)) || ""] || "";
    return { photo: fb || map.BRAND_PHOTOS.placeholder, mapped: false };
  };

  const rows = items
    .map((it) => ({ name: it.name, cat: catName(it), ...resolve(it) }))
    .sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));

  const byPhoto = {};
  for (const r of rows) (byPhoto[r.photo] = byPhoto[r.photo] || []).push(r);

  let current = "";
  console.log("=== ITEM -> PHOTO ===");
  for (const r of rows) {
    if (r.cat !== current) {
      current = r.cat;
      console.log(`\n[${current}]`);
    }
    const shared = byPhoto[r.photo].length > 1 ? `  (shared x${byPhoto[r.photo].length})` : "";
    console.log(
      `  ${r.name.padEnd(30)} ${r.photo.replace("/photos/", "").padEnd(24)}${r.mapped ? "" : "  [FALLBACK]"}${shared}`
    );
  }

  const dupes = Object.entries(byPhoto).filter(([, v]) => v.length > 1);
  console.log("\n=== SHARED PHOTOS (dishes without their own identity) ===");
  if (!dupes.length) console.log("  none");
  for (const [photo, v] of dupes.sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${photo.replace("/photos/", "")}  x${v.length}`);
    for (const r of v) console.log(`      - ${r.name}  [${r.cat}]`);
  }

  const unmapped = rows.filter((r) => !r.mapped);
  console.log(`\nTOTALS: ${rows.length} items · ${Object.keys(byPhoto).length} distinct photos · ${unmapped.length} on fallback · ${dupes.length} shared photos`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});

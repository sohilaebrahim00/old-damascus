/** Second pass: non-food detection, uncategorised items, image coverage. */
const fs = require("fs");
const path = require("path");

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

function slugify(t) {
  return t
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

(async () => {
  const items = (await get("/items?expand=categories&limit=500")).elements || [];

  const rev = {};
  for (const it of items)
    rev[String(it.isRevenue)] = (rev[String(it.isRevenue)] || 0) + 1;
  console.log("isRevenue distribution:", rev);

  console.log("\nNON-REVENUE items (candidates to exclude from a food menu):");
  for (const it of items.filter((i) => i.isRevenue === false))
    console.log(
      `  ${it.name}  price=${it.price} hidden=${it.hidden} cats=${it.categories?.elements?.length ?? 0} code=${it.code || "-"}`
    );

  console.log("\nUNCATEGORISED items:");
  for (const it of items.filter((i) => !i.categories?.elements?.length))
    console.log(`  ${it.name}  price=${it.price} hidden=${it.hidden}`);

  // image mapping coverage against the new map
  const src = fs.readFileSync(
    path.join(process.cwd(), "src/data/menu-image-map.ts"),
    "utf8"
  );
  const keys = new Set(
    [...src.matchAll(/^\s*"?([a-z0-9 ()&'\-\/.]+)"?\s*:\s*shot\(/gim)].map((m) =>
      m[1].trim().toLowerCase()
    )
  );

  const visible = items.filter((i) => !i.hidden && i.isRevenue !== false);
  const missing = visible.filter(
    (it) => !keys.has(it.name.toLowerCase()) && !keys.has(slugify(it.name))
  );
  console.log(
    `\nIMAGE COVERAGE: ${visible.length - missing.length}/${visible.length} live items mapped`
  );
  if (missing.length) {
    console.log("  UNMAPPED:");
    for (const it of missing) console.log(`    ${it.name}  ->  ${slugify(it.name)}`);
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});

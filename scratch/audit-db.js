/** Read-only probe: which Supabase tables exist and what the anon key can see. */
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TABLES = [
  "profiles",
  "addresses",
  "orders",
  "order_items",
  "order_item_modifiers",
  "menu_categories",
  "menu_items",
  "menu_modifiers",
  "catering_requests",
  "contact_submissions",
  "menu_sync_logs",
  "subscriptions",
  "meal_checkins",
  "leads",
];

(async () => {
  console.log("Supabase:", URL);
  console.log("Key type:", KEY?.startsWith("sb_") ? "publishable" : "anon-jwt");
  console.log("SERVICE_ROLE_KEY set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("");
  console.log("table                     status   anon can read");
  console.log("------------------------- -------- -------------");

  for (const t of TABLES) {
    let status = "?";
    let readable = "?";
    try {
      const res = await fetch(`${URL}/rest/v1/${t}?select=*&limit=1`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      });
      const body = await res.text();
      if (res.status === 200) {
        status = "EXISTS";
        const rows = JSON.parse(body);
        readable = `YES (${rows.length} row sample)`;
      } else if (body.includes("does not exist") || body.includes("42P01")) {
        status = "MISSING";
        readable = "-";
      } else if (res.status === 401 || res.status === 403) {
        status = "EXISTS";
        readable = "no (RLS blocks)";
      } else {
        status = `HTTP ${res.status}`;
        readable = body.slice(0, 60);
      }
    } catch (e) {
      status = "ERR";
      readable = e.message.slice(0, 50);
    }
    console.log(`${t.padEnd(25)} ${status.padEnd(8)} ${readable}`);
  }
})();

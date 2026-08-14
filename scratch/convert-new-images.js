/**
 * Convert the newly supplied photography into public/photos/ as WebP.
 * Mapping was decided by visual inspection, not filename.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(process.cwd(), "public", "menu");
const OUT = path.join(process.cwd(), "public", "photos");

const MAP = {
  "WhatsApp Image 2026-08-14 at 3.44.17 AM.jpeg": "water",
  "WhatsApp Image 2026-08-14 at 3.44.31 AM.jpeg": "falafel-plate-rice",
  "WhatsApp Image 2026-08-14 at 3.44.31 AM (1).jpeg": "falafel-sandwich",
  "WhatsApp Image 2026-08-14 at 3.44.31 AM (2).jpeg": "wings-8pc",
  "WhatsApp Image 2026-08-14 at 3.44.31 AM (3).jpeg": "laziza",
  "WhatsApp Image 2026-08-14 at 4.06.14 AM.jpeg": "virgin-mojito",
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let before = 0;
  let after = 0;
  for (const [file, slug] of Object.entries(MAP)) {
    const abs = path.join(SRC, file);
    if (!fs.existsSync(abs)) {
      console.log(`MISSING: ${file}`);
      continue;
    }
    const dest = path.join(OUT, `${slug}.webp`);
    const b = fs.statSync(abs).size;
    await sharp(abs)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest);
    const a = fs.statSync(dest).size;
    before += b;
    after += a;
    console.log(
      `${slug.padEnd(20)} ${(b / 1024).toFixed(0)}KB -> ${(a / 1024).toFixed(0)}KB`
    );
  }
  console.log(
    `\ntotal: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`
  );
})();

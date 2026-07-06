/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');

const publicMenuDir = path.join(__dirname, '../public/menu');
const mapFile = path.join(__dirname, '../src/data/menu-image-map.ts');

const files = [];

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else {
      files.push(filePath);
    }
  }
}

walk(publicMenuDir);

let mapContent = `// ============================================================
// Menu Image Map
// Maps menu item slugs to their image paths.
// When an image cannot be confidently matched, a branded
// placeholder is used. Upload food images to public/menu/
// and update this file.
// ============================================================

export const MENU_IMAGE_MAP: Record<string, string> = {
`;

for (const file of files) {
  const relPath = path.relative(publicMenuDir, file).replace(/\\/g, '/');
  const slug = path.basename(file, path.extname(file));
  mapContent += `  "${slug}": "/menu/${relPath}",\n`;
}

mapContent += `};

/** Returns image path or branded placeholder if image not found */
export function getMenuItemImage(slug: string): string {
  return MENU_IMAGE_MAP[slug] ?? "/menu/placeholder.jpg";
}
`;

fs.writeFileSync(mapFile, mapContent);
console.log('Regenerated menu-image-map.ts');

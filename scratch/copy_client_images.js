/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../public/client-assets/drop/menu-photos');
const menuDir = path.join(__dirname, '../public/menu');

// Copy identified client images to correct locations
const copies = [
  // keba.png = fried kubbeh (already exists, but this is better quality)
  ['keba.png', 'appetizers/fried-kubbeh-alt.png'],
  // baklawa
  ['WhatsApp Image 2026-06-04 at 18.50.16 - Copy - Copy.jpeg', 'desserts/baklawa-client.jpeg'],
  // mix grill platter (big spread)
  ['WhatsApp Image 2026-06-04 at 18.05.38.jpeg', 'grilled-dishes/mix-grill-client.jpeg'],
  // full restaurant spread
  ['WhatsApp Image 2026-06-04 at 18.05.40.jpeg', 'grilled-dishes/mixed-platter-client.jpeg'],
  // cheese rolls (skinny crispy rolls)
  ['WhatsApp Image 2026-06-04 at 18.50.32 - Copy - Copy.jpeg', 'appetizers/cheese-rolls-client.jpeg'],
  // hummus client
  ['WhatsApp Image 2026-06-04 at 18.50.43 - Copy - Copy.jpeg', 'appetizers/hummus-client.jpeg'],
];

// Category images from Specialties, Main Dishes, etc.
const catImages = [
  ['Main Dishes.png', 'main-dishes/main-dishes-cover.png'],
  ['Specialties.png', 'specialties/specialties-cover.png'],
  ['Sandwiches.png', 'sandwiches/sandwiches-cover.png'],
  ['Salads.png', 'salads/salads-cover.png'],
  ['Desserts.png', 'desserts/desserts-cover.png'],
  ['Hot Drinks - Copy.png', 'hot-drinks/turkish-coffee.png'],
  ['Soft Drinks - Copy.png', 'soft-drinks/soft-drinks.png'],
  ['Kids Menu.png', 'kids-menu/kids-menu-cover.png'],
];

function copyFile(src, dest) {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(menuDir, dest);
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(srcDir + '/' + src)) {
    console.log(`SKIP (not found): ${src}`);
    return;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied: ${src} -> ${dest}`);
}

for (const [src, dest] of [...copies, ...catImages]) {
  copyFile(src, dest);
}

// Now also copy the two avif files
const avifs = fs.readdirSync(srcDir).filter(f => f.endsWith('.avif'));
for (const avif of avifs) {
  const destName = avif.toLowerCase().replace(/[^a-z0-9.-]/g, '-').replace(/-+/g, '-');
  copyFile(avif, `grilled-dishes/${destName}`);
}

console.log('Done');

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');

const artifactsDir = 'C:\\Users\\sohila\\.gemini\\antigravity\\brain\\f4a47b29-f678-4619-8dd8-717c13aa0b29';

const copies = [
  ['shish_tawook_sandwich_1783302853230.png', 'public/menu/sandwiches/shish-tawook-sandwich.png'],
  ['adana_kabob_sandwich_1783302863806.png', 'public/menu/sandwiches/adana-kabob-sandwich.png'],
  ['beef_kofta_sandwich_1783302871860.png', 'public/menu/sandwiches/beef-kofta-sandwich.png'],
  ['lamb_mandi_1783302880877.png', 'public/menu/main-dishes/lamb-mandi-gen.png'],
  ['chicken_shawarma_plate_1783302905412.png', 'public/menu/main-dishes/chicken-shawarma-plate.png'],
  ['shish_tawook_plate_1783302916059.png', 'public/menu/grilled-dishes/shish-tawook-plate-gen.png'],
];

for (const [src, dest] of copies) {
  const srcPath = path.join(artifactsDir, src);
  const destPath = path.join(__dirname, '..', dest);
  if (fs.existsSync(srcPath)) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${src} -> ${dest}`);
  } else {
    console.log(`NOT FOUND: ${src}`);
  }
}
console.log('Done');

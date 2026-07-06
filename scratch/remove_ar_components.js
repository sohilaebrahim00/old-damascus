/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');

const filesToClean = [
  'src/components/home/CategoryPreview.tsx',
  'src/components/home/AboutPreview.tsx',
  'src/components/home/GoogleReviewCTA.tsx',
  'src/app/menu/[slug]/page.tsx'
];

for (const file of filesToClean) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/, nameAr: ".*?"/g, '');
    content = content.replace(/\s*<span className="text-xs text-olive font-arabic">\{cat\.nameAr\}<\/span>/g, '');
    content = content.replace(/\s*<p className="font-arabic.*?<\/p>/gs, '');
    content = content.replace(/\s*<p className="font-arabic.*?\n.*?<\/p>/gs, '');
    fs.writeFileSync(file, content);
  }
}
console.log('Removed Arabic from components');

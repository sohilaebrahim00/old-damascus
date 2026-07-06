/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');

let content = fs.readFileSync('src/data/menu.seed.ts', 'utf8');
content = content.replace(/\s*nameAr:\s*".*?",/g, '');
fs.writeFileSync('src/data/menu.seed.ts', content);
console.log('Done removing nameAr');

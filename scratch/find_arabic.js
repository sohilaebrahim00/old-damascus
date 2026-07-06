/* eslint-disable @typescript-eslint/no-require-imports */
// Scan for Arabic characters in public-facing code
const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  let found = false;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (scanDir(fullPath)) found = true;
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/[\u0600-\u06FF]/.test(content)) {
        console.log(`Arabic found in: ${fullPath}`);
        found = true;
      }
    }
  }
  return found;
}

if (!scanDir(path.join(__dirname, '../src'))) {
  console.log('No Arabic characters found in src directory.');
}

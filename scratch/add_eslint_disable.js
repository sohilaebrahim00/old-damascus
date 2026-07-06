/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');

const scratchDir = path.join(__dirname);
const files = fs.readdirSync(scratchDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(scratchDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.startsWith('/* eslint-disable')) {
    fs.writeFileSync(filePath, '/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */\n' + content);
    console.log(`Added eslint-disable to ${file}`);
  }
}
console.log('Done');

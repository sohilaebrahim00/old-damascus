/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Setup mock for alias resolution if needed, or just read files manually
const seedFile = fs.readFileSync(path.join(__dirname, '../src/data/menu.seed.ts'), 'utf-8');
const mapFile = fs.readFileSync(path.join(__dirname, '../src/data/menu-image-map.ts'), 'utf-8');

function extractItems() {
  const items = [];
  const regex = /id:\s*["'](item-[^"']+)["'][^}]+available:\s*(true|false)/g;
  let match;
  while ((match = regex.exec(seedFile)) !== null) {
    items.push({ id: match[1], available: match[2] === 'true' });
  }
  return items;
}

function extractMap() {
  const mapping = {};
  const lines = mapFile.split('\n');
  let currentKey = null;
  let inObject = false;

  // Simple parser since regexing JSON-like TS is brittle
  for (let line of lines) {
    if (line.includes('//') && !line.includes('":')) continue;
    
    // String mapping: "key": "value",
    const strMatch = line.match(/"([^"]+)":\s*"([^"]+)",?/);
    if (strMatch && !inObject) {
      mapping[strMatch[1]] = { primary: strMatch[2], gallery: [strMatch[2]] };
      continue;
    }

    // Object mapping start: "key": {
    const objMatch = line.match(/"([^"]+)":\s*\{/);
    if (objMatch) {
      currentKey = objMatch[1];
      inObject = true;
      mapping[currentKey] = { primary: "", gallery: [] };
      continue;
    }

    if (inObject) {
      const primaryMatch = line.match(/primary:\s*"([^"]+)"/);
      if (primaryMatch) {
        mapping[currentKey].primary = primaryMatch[1];
      }
      const galleryMatch = line.match(/gallery:\s*\[(.*)\]/);
      if (galleryMatch) {
        const urls = [...galleryMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
        mapping[currentKey].gallery = urls;
      }
      if (line.includes('},')) {
        inObject = false;
        currentKey = null;
      }
    }
  }
  return mapping;
}

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function runValidation() {
  const items = extractItems();
  const mapping = extractMap();
  
  let errors = [];
  const primaryImagesSeen = new Map(); // path -> itemId
  const imageHashesSeen = new Map(); // hash -> itemId
  let checkedCount = 0;

  const publicDir = path.join(__dirname, '../public');

  for (const item of items) {
    if (!item.available) continue; // Only check visible items
    checkedCount++;

    const map = mapping[item.id];
    
    if (!map || !map.primary) {
      // The user requested: "A visible item has no image" -> Fail
      // Wait, is it OK if an item has NO image? 
      // "A visible item has no image" -> Must fail!
      errors.push(`[Error] Visible item '${item.id}' has no image mapped.`);
      continue;
    }

    if (map.primary.includes('placeholder')) {
      errors.push(`[Error] Visible item '${item.id}' has fallback assigned as a real primary image.`);
    }

    // Check gallery duplicates
    const uniqueGallery = new Set(map.gallery);
    if (uniqueGallery.size !== map.gallery.length) {
      errors.push(`[Error] Gallery for '${item.id}' contains duplicate entries.`);
    }

    // Check file existence and casing
    for (const imgUrl of map.gallery) {
      const filePath = path.join(publicDir, imgUrl);
      if (!fs.existsSync(filePath)) {
        errors.push(`[Error] Image path does not exist for '${item.id}': ${imgUrl}`);
        continue;
      }

      // Check case sensitivity by looking at the directory contents
      const dirName = path.dirname(filePath);
      const baseName = path.basename(filePath);
      const actualFiles = fs.readdirSync(dirName);
      if (!actualFiles.includes(baseName)) {
        errors.push(`[Error] Filename casing mismatch for '${item.id}': ${imgUrl}`);
      }

      // File hash check for primary image only to ensure no duplicated images
      if (imgUrl === map.primary) {
        if (primaryImagesSeen.has(map.primary) && primaryImagesSeen.get(map.primary) !== item.id) {
          errors.push(`[Error] Two unrelated visible items use the same primary image: '${item.id}' and '${primaryImagesSeen.get(map.primary)}' share '${map.primary}'`);
        } else {
          primaryImagesSeen.set(map.primary, item.id);
        }

        const hash = getFileHash(filePath);
        if (imageHashesSeen.has(hash) && imageHashesSeen.get(hash) !== item.id) {
          errors.push(`[Error] The same file hash is assigned to unrelated items: '${item.id}' and '${imageHashesSeen.get(hash)}' share hash ${hash}`);
        } else {
          imageHashesSeen.set(hash, item.id);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`Menu Image Validation Failed (Checked ${checkedCount} visible items):`);
    errors.forEach(e => console.error(e));
    process.exit(1);
  } else {
    console.log(`Menu Image Validation Passed! Checked ${checkedCount} visible items successfully.`);
  }
}

runValidation();

/* eslint-disable */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svgText = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#183B0B"/>
  <text x="50%" y="55%" font-family="Georgia, serif" font-size="280" font-weight="bold" fill="#C6A15B" text-anchor="middle" dominant-baseline="middle">OD</text>
</svg>
`;

async function makeIcons() {
  const publicIcons = path.join(__dirname, "../public/icons");
  if (!fs.existsSync(publicIcons)) {
    fs.mkdirSync(publicIcons, { recursive: true });
  }

  // Generate 512x512
  await sharp(Buffer.from(svgText))
    .png()
    .toFile(path.join(publicIcons, "icon-512x512.png"));

  // Generate maskable
  const svgMaskable = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#183B0B"/>
    <text x="50%" y="55%" font-family="Georgia, serif" font-size="240" font-weight="bold" fill="#C6A15B" text-anchor="middle" dominant-baseline="middle">OD</text>
  </svg>
  `;
  await sharp(Buffer.from(svgMaskable))
    .png()
    .toFile(path.join(publicIcons, "maskable-512x512.png"));

  // Generate 192x192
  await sharp(Buffer.from(svgText))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicIcons, "icon-192x192.png"));

  // Generate src/app/icon.png
  await sharp(Buffer.from(svgText))
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, "../src/app/icon.png"));

  // Generate src/app/apple-icon.png
  await sharp(Buffer.from(svgText))
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, "../src/app/apple-icon.png"));

  // Generate src/app/favicon.ico
  await sharp(Buffer.from(svgText))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, "../src/app/favicon.ico"));

  console.log("Icons generated successfully.");
}

makeIcons().catch(console.error);

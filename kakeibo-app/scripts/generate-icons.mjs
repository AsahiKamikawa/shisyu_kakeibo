import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const emblem = (size, rounded) => {
  const r = rounded ? size * 0.22 : 0;
  const cx = size / 2;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7dd3fc"/>
      <stop offset="0.55" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <polyline points="${size * 0.24},${size * 0.66} ${size * 0.42},${size * 0.5} ${size * 0.56},${size * 0.58} ${size * 0.78},${size * 0.34}"
    fill="none" stroke="#ffffff" stroke-width="${size * 0.045}" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
  <text x="${cx}" y="${size * 0.62}" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="700" fill="#ffffff">¥</text>
</svg>`;
};

const targets = [
  { name: 'pwa-192x192.png', size: 192, rounded: true },
  { name: 'pwa-512x512.png', size: 512, rounded: true },
  { name: 'apple-touch-icon.png', size: 180, rounded: true },
  { name: 'maskable-512x512.png', size: 512, rounded: false },
];

for (const t of targets) {
  const svg = Buffer.from(emblem(t.size, t.rounded));
  await sharp(svg).png().toFile(resolve(publicDir, t.name));
  console.log('generated', t.name);
}

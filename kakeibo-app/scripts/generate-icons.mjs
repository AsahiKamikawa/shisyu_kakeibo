import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

// 背景グラデ（水色〜紫）とコイン/¥モチーフのエンブレム。
// coinR は中心からのコイン半径（maskable はセーフゾーンに収めるため小さめにする）。
const coin = (cx, cy, coinR) => {
  const ring = coinR * 1.0;
  const inner = coinR * 0.82;
  return `
  <circle cx="${cx}" cy="${cy}" r="${ring}" fill="#ffffff" opacity="0.95"/>
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="none" stroke="url(#coinStroke)" stroke-width="${coinR * 0.08}" opacity="0.9"/>
  <text x="${cx}" y="${cy + coinR * 0.34}" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="${coinR * 1.05}" font-weight="800" fill="url(#coinStroke)">¥</text>`;
};

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7dd3fc"/>
      <stop offset="0.55" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
    <linearGradient id="coinStroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>`;

// アプリアイコン。contentScale でコインの大きさ（=セーフゾーン）を調整。
const icon = (size, rounded, contentScale) => {
  const r = rounded ? size * 0.22 : 0;
  const cx = size / 2;
  const coinR = size * 0.5 * contentScale;
  // 軽いきらめきを右上に
  const sx = size * 0.74;
  const sy = size * 0.28;
  const sr = size * 0.035;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${defs}
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  ${coin(cx, cx, coinR)}
  <circle cx="${sx}" cy="${sy}" r="${sr}" fill="#ffffff" opacity="0.85"/>
</svg>`;
};

// iOS 起動画面（スプラッシュ）。中央にコイン。
const splash = (w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const coinR = Math.min(w, h) * 0.16;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${coin(cx, cy, coinR)}
  <text x="${cx}" y="${cy + coinR * 2.1}" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="${coinR * 0.42}" font-weight="700" fill="#ffffff" opacity="0.92">絶対死守 家計簿</text>
</svg>`;
};

const iconTargets = [
  { name: 'pwa-192x192.png', size: 192, rounded: true, scale: 0.74 },
  { name: 'pwa-512x512.png', size: 512, rounded: true, scale: 0.74 },
  { name: 'apple-touch-icon.png', size: 180, rounded: true, scale: 0.74 },
  // maskable は端が切られるためコインを内側（約62%）に収める
  { name: 'maskable-512x512.png', size: 512, rounded: false, scale: 0.62 },
];

// 代表的な現代 iPhone のスプラッシュ（width x height はデバイスピクセル）
const splashTargets = [
  { w: 750, h: 1334 }, // SE / 8
  { w: 828, h: 1792 }, // 11 / XR
  { w: 1125, h: 2436 }, // X / 11 Pro / 12 mini
  { w: 1170, h: 2532 }, // 12 / 13 / 14
  { w: 1179, h: 2556 }, // 14 Pro / 15 / 16
  { w: 1242, h: 2688 }, // 11 Pro Max
  { w: 1284, h: 2778 }, // 12/13 Pro Max / 14 Plus
  { w: 1290, h: 2796 }, // 14 Pro Max / 15 Plus / 15 Pro Max
];

for (const t of iconTargets) {
  const svg = Buffer.from(icon(t.size, t.rounded, t.scale));
  await sharp(svg).png().toFile(resolve(publicDir, t.name));
  console.log('generated', t.name);
}

for (const t of splashTargets) {
  const name = `splash-${t.w}x${t.h}.png`;
  const svg = Buffer.from(splash(t.w, t.h));
  await sharp(svg).png().toFile(resolve(publicDir, name));
  console.log('generated', name);
}

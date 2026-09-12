import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
const source = await readFile('public/icon.svg');
for (const [size, name] of [
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
  [180, 'apple-touch-icon.png'],
])
  await sharp(source).resize(size, size).png().toFile(`public/${name}`);
const inset = await sharp(source).resize(400, 400).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#e8efde' } })
  .composite([{ input: inset, gravity: 'centre' }])
  .png()
  .toFile('public/icon-maskable.png');

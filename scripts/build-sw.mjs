import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = path.resolve('dist');
async function walk(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(path.join(folder, entry.name)) : [path.join(folder, entry.name)],
      ),
    )
  ).flat();
}
const files = (await walk(root)).filter((file) => !file.endsWith('/sw.js'));
const assets = files.map((file) => '/' + path.relative(root, file).split(path.sep).join('/'));
const hash = createHash('sha256');
for (const file of files.sort()) hash.update(await readFile(file));
const version = hash.digest('hex').slice(0, 12);
await writeFile(
  path.join(root, 'sw.js'),
  `const CACHE_NAME = 'czytanki-${version}';
const ASSETS = ${JSON.stringify(['/', ...assets])};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('czytanki-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => response.ok ? response : caches.match('/index.html')).catch(() => caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(event.request, { ignoreVary: true })).then(cached => cached || fetch(event.request)));
});
`,
);
console.log(`Offline cache created: ${assets.length} assets, version ${version}`);

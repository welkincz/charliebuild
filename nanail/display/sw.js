// NaNail 门店展示页的离线缓存。
//
// 店里没有固定 wifi，靠手机热点，所以这块屏必须能在断网时照常播下去。
// 策略：
//   - 页面本身走 network-first（拿得到新版就用新版，拿不到就用缓存），
//     她在 iPad 上手动刷新一次就能看到更新过的内容。
//   - 图片等静态资源走 cache-first，热点流量只在版本号变化时才重新消耗。
//
// 改过 display/ 里的任何文件之后，把 VERSION 往上加一位再部署，
// 否则 iPad 上缓存的旧图片不会被替换。
const VERSION = 'nanail-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/assets/work-1.webp',
  '/assets/work-2.webp',
  '/assets/work-3.webp',
  '/assets/work-4.webp',
  '/assets/work-5.webp',
  '/assets/work-6.webp',
  '/assets/wechat-qr.png',
  '/assets/instagram-qr.png',
  '/assets/pearl-ribbon-atmosphere.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 扫码跳转必须每次都真的打到服务端，否则计数会漏。
  if (url.pathname === '/ig' || url.pathname === '/scans') return;

  event.respondWith(request.mode === 'navigate' ? networkFirst(request) : cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const fresh = await fetchWithTimeout(request, 3500);
    if (fresh && fresh.ok) {
      cache.put('/index.html', fresh.clone());
      cache.put('/', fresh.clone());
    }
    return fresh;
  } catch (error) {
    const cached = (await cache.match(request)) || (await cache.match('/index.html'));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  if (fresh && fresh.ok && fresh.type === 'basic') {
    cache.put(request, fresh.clone());
  }
  return fresh;
}

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

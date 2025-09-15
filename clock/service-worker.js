// キャッシュの名前とバージョン
const CACHE_NAME = 'ntp-clock-cache-v1';
// オフライン時に表示するためにキャッシュしておくファイル
const urlsToCache = [
  './', // ルートURL (index.html)
  './index.html', // index.html を明示的に指定
];

/**
 * Service Worker のインストール時に実行されるイベント
 * アプリの基本ファイル（アプ​​リケーションシェル）をキャッシュします。
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error("Cache addAll failed: ", err))
  );
});

/**
 * Service Worker が有効化されたときに実行されるイベント
 * 古いバージョンのキャッシュがあれば削除します。
 */
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * ページからのリクエストを横取りするイベント
 * オフライン時はキャッシュから、オンライン時はネットワークから応答を返します。
 */
self.addEventListener('fetch', (event) => {
  // このアプリのドメインへのリクエストのみを対象とする
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // キャッシュに一致するリクエストがあれば、それを返す
        // なければ、ネットワークにリクエストを送信する
        return response || fetch(event.request);
      })
    );
  }
});

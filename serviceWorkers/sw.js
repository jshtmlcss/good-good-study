var CACHE_NAME = 'my-site-cache-v1'
var urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
]

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return response
      return response ? response : fetch(event.request)
    })
  )
})

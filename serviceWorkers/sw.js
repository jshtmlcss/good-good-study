const CACHE_PREFIX = 'App-'
const CACHE_VERSION = 'v1'

// 提前需要进行缓存的资源
const urlsToCache = [
]

self.addEventListener('install', event => {
  // self.skipWaiting()
  console.log('============== install ==============')
  event.waitUntil(
    caches.open(CACHE_PREFIX + CACHE_VERSION).then(cache => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('activate', event => {
  console.log('============== activate ==============')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('当前版本：', CACHE_VERSION, '缓存版本：', cacheNames)
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.indexOf(CACHE_PREFIX) !== -1 && cacheName.indexOf(CACHE_VERSION) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

/**
 * 发起请求并将响应添加到缓存
 * @param {Object} request
 */
function addToCache (request) {
  return fetch(request).then(response => {
    console.log(`fetch ${request.url} response：`, response)
    if (response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
      caches.open(CACHE_PREFIX + CACHE_VERSION).then(cache => {
        cache.put(request, response)
      })
    }
    return response.clone()
  })
}

// 需要缓存资源的域名
const assetsUrl = '/assets/'

/**
 * 是否需要缓存
 * @param {Object} request 
 */
function needCache ({ method, url }) {
  return method === 'GET' && url.indexOf(assetsUrl) !== -1
}

self.addEventListener('fetch', event => {
  const request = event.request
  if (!needCache(request)) return
  event.respondWith(
    caches.match(request).then(response => {
      console.log(`${CACHE_VERSION} caches match:`, request.url, response)
      return response || addToCache(request)
    })
  )
})

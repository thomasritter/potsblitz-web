const staticDevPotsblitz = "potsblitz-v3"
const assets = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/application.js",
  "./fonts/IQBprimar-Regular.ttf",
  "./icons/ios_icon.png",
  "./icons/ipad_icon.png",
  "./images/finished.jpg",
  "./manifest.json",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevPotsblitz).then(cache => {
      return cache.addAll(assets)
    })
  )
})

self.addEventListener("activate", activateEvent => {
  activateEvent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== staticDevPotsblitz)
          .map(cacheName => caches.delete(cacheName))
      )
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
})
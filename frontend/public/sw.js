// Service Worker for CivicSense
const CACHE_NAME = 'civicsense-v1'
const STATIC_CACHE = 'civicsense-static-v1'
const API_CACHE = 'civicsense-api-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v1/reports'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_FILES)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            cache.put(request, response.clone())
          }
          return response
        }).catch(() => {
          // Return cached version if available
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline response for reports
            if (request.url.includes('/api/v1/reports')) {
              return new Response(JSON.stringify({
                data: [],
                message: 'You are offline. Reports will sync when connection is restored.'
              }), {
                headers: { 'Content-Type': 'application/json' }
              })
            }
            return new Response('Offline', { status: 503 })
          })
        })
      })
    )
    return
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((response) => {
        // Cache static assets
        if (response.status === 200 && request.method === 'GET') {
          const responseClone = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-reports') {
    event.waitUntil(syncReports())
  }
})

async function syncReports() {
  try {
    const cache = await caches.open(API_CACHE)
    const keys = await cache.keys()

    // Find pending report submissions
    const pendingRequests = keys.filter(request =>
      request.url.includes('/api/v1/reports') && request.method === 'POST'
    )

    // Retry pending requests
    for (const request of pendingRequests) {
      try {
        await fetch(request)
        await cache.delete(request)
      } catch (error) {
        console.log('Failed to sync report:', error)
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error)
  }
}
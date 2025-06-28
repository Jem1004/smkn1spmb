const CACHE_NAME = 'ppdb-smk-v1'
const STATIC_CACHE_NAME = 'ppdb-smk-static-v1'
const DYNAMIC_CACHE_NAME = 'ppdb-smk-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/login',
  '/manifest.json',
  '/offline.html',
  // Add other critical static files
]

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/students',
  '/api/ranking',
  '/api/quota'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Service Worker: Static files cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - cache with network first strategy
    event.respondWith(handleApiRequest(request))
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    // Static assets - cache first strategy
    event.respondWith(handleStaticAssets(request))
  } else {
    // HTML pages - network first with fallback
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests with network first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok && CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for:', request.url)
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Tidak ada koneksi internet. Data mungkin tidak terbaru.',
        offline: true
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// Handle static assets with cache first strategy
async function handleStaticAssets(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network and cache the response
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Failed to load static asset:', request.url)
    throw error
  }
}

// Handle page requests with network first strategy
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful HTML responses
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.includes('text/html')) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed for page:', request.url)
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline.html')
    if (offlineResponse) {
      return offlineResponse
    }
    
    // Fallback offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Offline - PPDB SMK</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .offline-container { max-width: 400px; margin: 0 auto; }
          .offline-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #333; }
          p { color: #666; line-height: 1.5; }
          button { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1>Anda Sedang Offline</h1>
          <p>Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.</p>
          <button onclick="window.location.reload()">Coba Lagi</button>
        </div>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html'
        }
      }
    )
  }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag)
  
  if (event.tag === 'student-form-sync') {
    event.waitUntil(syncStudentForms())
  } else if (event.tag === 'ranking-sync') {
    event.waitUntil(syncRankingData())
  }
})

// Sync student form submissions
async function syncStudentForms() {
  try {
    console.log('Service Worker: Syncing student forms...')
    
    // Get pending form submissions from IndexedDB
    const pendingForms = await getPendingForms()
    
    for (const form of pendingForms) {
      try {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form.data)
        })
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingForm(form.id)
          console.log('Service Worker: Form synced successfully:', form.id)
          
          // Notify client
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'FORM_SYNC_SUCCESS',
                formId: form.id
              })
            })
          })
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync form:', form.id, error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error)
  }
}

// Sync ranking data
async function syncRankingData() {
  try {
    console.log('Service Worker: Syncing ranking data...')
    
    const response = await fetch('/api/ranking')
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put('/api/ranking', response.clone())
      console.log('Service Worker: Ranking data synced')
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync ranking data:', error)
  }
}

// IndexedDB helpers for offline form storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ppdb-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('pendingForms')) {
        const store = db.createObjectStore('pendingForms', { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

async function getPendingForms() {
  const db = await openDB()
  const transaction = db.transaction(['pendingForms'], 'readonly')
  const store = transaction.objectStore('pendingForms')
  
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function removePendingForm(id) {
  const db = await openDB()
  const transaction = db.transaction(['pendingForms'], 'readwrite')
  const store = transaction.objectStore('pendingForms')
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: 'Ada update baru di sistem PPDB',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Detail',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('PPDB SMK', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Handle navigation requests
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Fallback ke halaman utama jika offline
          return caches.match('/')
        })
    )
    return
  }
  
  // Handle other requests...
})
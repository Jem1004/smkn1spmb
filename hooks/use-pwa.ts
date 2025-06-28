'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface UsePWAReturn {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  installApp: () => Promise<void>
  handleInstall: () => Promise<void>
  installPrompt: PWAInstallPrompt | null
  deferredPrompt: PWAInstallPrompt | null
  installPWA: () => Promise<void>
  isSupported: boolean
}

export function usePWA(): UsePWAReturn {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null)
  const { toast } = useToast()

  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator

  useEffect(() => {
    if (!isSupported) return

    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as any)
      setIsInstallable(true)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      toast({
        title: 'Aplikasi Terinstal',
        description: 'PPDB SMK berhasil diinstal di perangkat Anda'
      })
    }

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: 'Kembali Online',
        description: 'Koneksi internet tersedia'
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: 'Mode Offline',
        description: 'Beberapa fitur mungkin terbatas',
        variant: 'destructive'
      })
    }

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isSupported, toast])

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      toast({
        title: 'Tidak Dapat Menginstal',
        description: 'Aplikasi sudah terinstal atau browser tidak mendukung',
        variant: 'destructive'
      })
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast({
          title: 'Instalasi Dimulai',
          description: 'Aplikasi sedang diinstal...'
        })
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error installing app:', error)
      toast({
        title: 'Gagal Menginstal',
        description: 'Terjadi kesalahan saat menginstal aplikasi',
        variant: 'destructive'
      })
    }
  }, [deferredPrompt, toast])

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    handleInstall: installApp,
    installPrompt: deferredPrompt,
    deferredPrompt,
    installPWA: installApp,
    isSupported
  }
}

// Hook for offline storage
interface UseOfflineStorageReturn {
  saveOfflineData: (key: string, data: any) => Promise<void>
  getOfflineData: (key: string) => Promise<any>
  removeOfflineData: (key: string) => Promise<void>
  clearOfflineData: () => Promise<void>
  syncPendingData: () => Promise<void>
}

export function useOfflineStorage(): UseOfflineStorageReturn {
  const { toast } = useToast()

  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ppdb-offline', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'key' })
        }
        
        if (!db.objectStoreNames.contains('pendingForms')) {
          const store = db.createObjectStore('pendingForms', { keyPath: 'id', autoIncrement: true })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }, [])

  const saveOfflineData = useCallback(async (key: string, data: any) => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ key, data, timestamp: Date.now() })
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
      
      console.log('Data saved offline:', key)
    } catch (error) {
      console.error('Error saving offline data:', error)
      throw error
    }
  }, [openDB])

  const getOfflineData = useCallback(async (key: string) => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['offlineData'], 'readonly')
      const store = transaction.objectStore('offlineData')
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.data : null)
        }
      })
    } catch (error) {
      console.error('Error getting offline data:', error)
      return null
    }
  }, [openDB])

  const removeOfflineData = useCallback(async (key: string) => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch (error) {
      console.error('Error removing offline data:', error)
      throw error
    }
  }, [openDB])

  const clearOfflineData = useCallback(async () => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
      
      toast({
        title: 'Data Offline Dihapus',
        description: 'Semua data offline telah dihapus'
      })
    } catch (error) {
      console.error('Error clearing offline data:', error)
      throw error
    }
  }, [openDB, toast])

  const syncPendingData = useCallback(async () => {
    if (!navigator.onLine) {
      toast({
        title: 'Tidak Ada Koneksi',
        description: 'Sinkronisasi akan dilakukan saat online',
        variant: 'destructive'
      })
      return
    }

    try {
      // Register background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        // Type assertion for sync property
        await (registration as any).sync.register('student-form-sync')
        
        toast({
          title: 'Sinkronisasi Dimulai',
          description: 'Data sedang disinkronkan dengan server'
        })
      } else {
        // Fallback: sync immediately
        await syncPendingFormsNow()
      }
    } catch (error) {
      console.error('Error syncing pending data:', error)
      toast({
        title: 'Gagal Sinkronisasi',
        description: 'Terjadi kesalahan saat sinkronisasi data',
        variant: 'destructive'
      })
    }
  }, [toast])

  const syncPendingFormsNow = useCallback(async () => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['pendingForms'], 'readonly')
      const store = transaction.objectStore('pendingForms')
      
      const pendingForms = await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
      })
      
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
            const deleteTransaction = db.transaction(['pendingForms'], 'readwrite')
            const deleteStore = deleteTransaction.objectStore('pendingForms')
            deleteStore.delete(form.id)
          }
        } catch (error) {
          console.error('Failed to sync form:', form.id, error)
        }
      }
      
      toast({
        title: 'Sinkronisasi Selesai',
        description: `${pendingForms.length} form berhasil disinkronkan`
      })
    } catch (error) {
      console.error('Error syncing forms:', error)
      throw error
    }
  }, [openDB, toast])

  return {
    saveOfflineData,
    getOfflineData,
    removeOfflineData,
    clearOfflineData,
    syncPendingData
  }
}

// Hook for background sync
export function useBackgroundSync() {
  const { toast } = useToast()

  const registerSync = useCallback(async (tag: string) => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.log('Background sync not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      // Type assertion for sync property
      await (registration as any).sync.register(tag)
      return true
    } catch (error) {
      console.error('Error registering background sync:', error)
      return false
    }
  }, [])

  const savePendingForm = useCallback(async (formData: any) => {
    try {
      const request = indexedDB.open('ppdb-offline', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['pendingForms'], 'readwrite')
        const store = transaction.objectStore('pendingForms')
        
        store.add({
          data: formData,
          timestamp: Date.now()
        })
        
        // Register background sync
        registerSync('student-form-sync')
        
        toast({
          title: 'Form Disimpan',
          description: 'Form akan dikirim saat koneksi tersedia'
        })
      }
    } catch (error) {
      console.error('Error saving pending form:', error)
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan form',
        variant: 'destructive'
      })
    }
  }, [registerSync, toast])

  return {
    registerSync,
    savePendingForm
  }
}
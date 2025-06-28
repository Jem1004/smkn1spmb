'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function PWAUpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service worker has been updated and is now controlling the page
        window.location.reload()
      })

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed and waiting
                setWaitingWorker(newWorker)
                setShowUpdatePrompt(true)
                
                // Show toast notification
                toast({
                  title: 'Update Tersedia',
                  description: 'Versi baru aplikasi telah tersedia. Klik untuk memperbarui.',
                  duration: 0, // Don't auto-dismiss
                })
              }
            })
          }
        })

        // Check if there's already a waiting service worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowUpdatePrompt(true)
        }
      })
    }
  }, [])

  const handleUpdate = async () => {
    if (!waitingWorker) return

    setIsUpdating(true)
    
    try {
      // Tell the waiting service worker to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      
      // The page will reload automatically when the new service worker takes control
      toast({
        title: 'Memperbarui Aplikasi',
        description: 'Aplikasi sedang diperbarui, halaman akan dimuat ulang...',
      })
    } catch (error) {
      console.error('Failed to update service worker:', error)
      setIsUpdating(false)
      
      toast({
        title: 'Gagal Memperbarui',
        description: 'Terjadi kesalahan saat memperbarui aplikasi. Silakan coba lagi.',
        variant: 'destructive',
      })
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
    
    // Store dismissal in session storage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('pwa-update-dismissed', 'true')
    }
  }

  // Don't show if dismissed in this session
  if (typeof window !== 'undefined' && window.sessionStorage && sessionStorage.getItem('pwa-update-dismissed')) {
    return null
  }

  if (!showUpdatePrompt || !waitingWorker) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Update Tersedia</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Versi baru aplikasi PPDB SMK telah tersedia dengan perbaikan dan fitur terbaru.
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleUpdate}
            size="sm"
            className="flex-1"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Memperbarui...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Perbarui Sekarang
              </>
            )}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            disabled={isUpdating}
          >
            Nanti
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook for checking app version
export function useAppVersion() {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Get current version from service worker
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          const messageChannel = new MessageChannel()
          messageChannel.port1.onmessage = (event) => {
            if (event.data && event.data.version) {
              setCurrentVersion(event.data.version)
            }
          }
          
          registration.active.postMessage(
            { type: 'GET_VERSION' },
            [messageChannel.port2]
          )
        }
      })

      // Check for updates periodically
      const checkForUpdates = () => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update()
        })
      }

      // Check for updates every 30 minutes
      const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000)

      // Check for updates when the page becomes visible
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          checkForUpdates()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(updateInterval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  return {
    currentVersion,
    latestVersion,
    hasUpdate,
  }
}
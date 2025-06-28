'use client'

import { useEffect } from 'react'
import { usePWA } from '@/hooks/use-pwa'
import { useToast } from '@/hooks/use-toast'

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, isInstalled, deferredPrompt, installPWA } = usePWA()
  const { toast } = useToast()

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: 'Update Tersedia',
                    description: 'Versi baru aplikasi telah tersedia. Refresh halaman untuk menggunakan versi terbaru.',
                    duration: 10000,
                  })
                }
              })
            }
          })
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // Handle online/offline status
    const handleOnline = () => {
      toast({
        title: 'Koneksi Pulih',
        description: 'Anda kembali online. Data akan disinkronkan.',
        variant: 'default',
      })
    }

    const handleOffline = () => {
      toast({
        title: 'Koneksi Terputus',
        description: 'Anda sedang offline. Beberapa fitur mungkin terbatas.',
        variant: 'destructive',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [toast])

  // Show install prompt for PWA
  useEffect(() => {
    if (deferredPrompt && !isInstalled) {
      const timer = setTimeout(() => {
        toast({
          title: 'Install Aplikasi',
          description: 'Install aplikasi PPDB SMK untuk pengalaman yang lebih baik.',
          action: (
            <button
              onClick={installPWA}
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
            >
              Install
            </button>
          ),
          duration: 10000,
        })
      }, 5000) // Show after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [deferredPrompt, isInstalled, installPWA, toast])

  return (
    <>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <span className="text-sm font-medium">Offline</span>
          </div>
        </div>
      )}
    </>
  )
}
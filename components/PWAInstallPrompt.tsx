'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, deferredPrompt, handleInstall } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if app is already running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Show prompt after a delay if installable and not installed
    if (isInstallable && !isInstalled && !standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled])

  const handleInstallClick = async () => {
    try {
      await handleInstall()
      setShowPrompt(false)
    } catch (error) {
      console.error('Failed to install PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't show if already dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone) {
    return null
  }

  // iOS install instructions
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Install PPDB SMK</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Install aplikasi ini di perangkat iOS Anda:
          </p>
          
          <ol className="text-xs text-gray-500 space-y-1 mb-4">
            <li>1. Tap tombol Share (📤) di Safari</li>
            <li>2. Pilih &quot;Add to Home Screen&quot;</li>
            <li>3. Tap &quot;Add&quot; untuk menginstall</li>
          </ol>
          
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Mengerti
          </Button>
        </div>
      </div>
    )
  }

  // Android/Desktop install prompt
  if (isInstallable && showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Install PPDB SMK</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Install aplikasi ini untuk akses yang lebih cepat dan pengalaman yang lebih baik.
          </p>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Nanti
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// PWA Install Button Component
export function PWAInstallButton({ className }: { className?: string }) {
  const { isInstallable, isInstalled, handleInstall } = usePWA()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)
  }, [])

  if (!isInstallable || isInstalled || isStandalone) {
    return null
  }

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  )
}

// PWA Status Indicator
export function PWAStatusIndicator() {
  const { isInstalled, isOnline } = usePWA()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)
  }, [])

  if (!isInstalled && !isStandalone) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span>
        {isOnline ? 'Online' : 'Offline'} • PWA Mode
      </span>
    </div>
  )
}
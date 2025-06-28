import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import PWAProvider from '@/components/PWAProvider'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'PPDB SMK - Sistem Pendaftaran Siswa Digital',
  description: 'Aplikasi berbasis web untuk pendaftaran siswa baru SMK dengan role admin dan siswa',
  keywords: ['PPDB', 'SMK', 'Pendaftaran', 'Siswa', 'Digital'],
  authors: [{ name: 'SMK Development Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PPDB SMK',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'PPDB SMK',
    title: 'PPDB SMK - Sistem Pendaftaran Siswa Digital',
    description: 'Aplikasi berbasis web untuk pendaftaran siswa baru SMK dengan role admin dan siswa',
  },
  twitter: {
    card: 'summary',
    title: 'PPDB SMK - Sistem Pendaftaran Siswa Digital',
    description: 'Aplikasi berbasis web untuk pendaftaran siswa baru SMK dengan role admin dan siswa',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PPDB SMK" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <PWAProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                {children}
              </div>
              <Toaster />
              <PWAInstallPrompt />
            </AuthProvider>
          </PWAProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
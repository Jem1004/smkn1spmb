'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    // Set timeout untuk loading state
    const timer = setTimeout(() => {
      setLoadingTimeout(true)
    }, 5000) // 5 detik timeout

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Force redirect jika loading terlalu lama
    if (loadingTimeout && status === 'loading') {
      router.push('/login')
      return
    }

    // Don't redirect while still loading (dengan timeout)
    if (status === 'loading' && !loadingTimeout) return
    
    if (status === 'authenticated' && session?.user) {
      // Redirect berdasarkan role
      if (session.user.role === 'ADMIN') {
        router.push('/admin/students')
      } else if (session.user.role === 'STUDENT') {
        router.push('/student/status')
      }
    } else {
      // Redirect ke login jika belum login
      router.push('/login')
    }
  }, [session, status, router, loadingTimeout])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <h2 className="text-lg font-semibold text-center mb-2">
            PPDB SMK Digital
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {loadingTimeout ? 'Mengarahkan ke login...' : 'Memuat aplikasi...'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

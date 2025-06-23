'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect berdasarkan role
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (user.role === 'STUDENT') {
        router.push('/student/status')
      }
    } else {
      // Redirect ke login jika belum login
      router.push('/login')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <h2 className="text-lg font-semibold text-center mb-2">
            PPDB SMK Digital
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Memuat aplikasi...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
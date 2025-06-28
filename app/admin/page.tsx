'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Don't redirect while still loading
    if (status === 'loading') return
    
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    
    // Redirect to students page as the main admin page
    router.push('/admin/students')
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Mengalihkan ke halaman admin...</p>
      </div>
    </div>
  )
}
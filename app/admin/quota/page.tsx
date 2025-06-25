'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import QuotaManager from '@/components/QuotaManager'

export default function QuotaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  const handleQuotaUpdate = (quotas: Record<string, number>) => {
    // Handle quota update - could save to database or update global state
    console.log('Quotas updated:', quotas)
  }

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <QuotaManager onQuotaUpdate={handleQuotaUpdate} />
    </AdminLayout>
  )
}
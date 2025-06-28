'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  className?: string
}

export default function AdminLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backUrl = '/admin/students',
  className
}: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  // Check if user is authenticated and has admin role
  React.useEffect(() => {
    // Don't redirect while still loading
    if (status === 'loading') return
    
    if (status !== 'authenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'STUDENT')) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Handle responsive behavior
  React.useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(false)
        setSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Memverifikasi akses...
          </p>
        </div>
      </div>
    )
  }

  if (status !== 'authenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'STUDENT')) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "lg:block",
        isMobile ? (
          sidebarOpen ? "block" : "hidden"
        ) : "block"
      )}>
        <Sidebar 
          isCollapsed={!isMobile && sidebarCollapsed}
          onToggle={toggleSidebar}
          className={cn(
            isMobile && "z-40"
          )}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : (
          sidebarCollapsed ? "ml-16" : "ml-64"
        )
      )}>
        {/* Header */}
        <Header 
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          backUrl={backUrl}
          onMenuToggle={isMobile ? toggleSidebar : undefined}
        />

        {/* Page Content */}
        <main className={cn(
          "p-6 min-h-[calc(100vh-4rem)]",
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
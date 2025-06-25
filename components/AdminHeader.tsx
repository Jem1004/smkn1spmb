'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut, User, Settings, Home, Bell, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  className?: string
}

export default function AdminHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backUrl = '/admin/dashboard',
  className
}: AdminHeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout()
      router.push('/login')
    }
  }

  const handleBack = () => {
    router.push(backUrl)
  }

  const handleDashboard = () => {
    router.push('/admin/dashboard')
  }

  return (
    <Card className={cn(
      "mb-8 border-2 border-border shadow-xl bg-card transition-all duration-200 hover:shadow-2xl",
      className
    )}>
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          {/* Left Section */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {showBackButton && (
              <Button 
                onClick={handleBack} 
                variant="outline" 
                size="sm"
                className="border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-xl shadow-md hover:shadow-lg w-fit"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground mt-2 text-base lg:text-lg font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* User Profile Card */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-muted/50 to-muted/30 px-5 py-3 rounded-xl border-2 border-border shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-semibold text-foreground block text-sm">{user?.username}</span>
                <span className="text-muted-foreground text-xs font-medium bg-accent/50 px-2 py-0.5 rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={handleDashboard} 
                variant="outline" 
                size="sm"
                className="border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-xl shadow-md hover:shadow-lg"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 rounded-xl shadow-md hover:shadow-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
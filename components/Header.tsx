'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  LogOut, 
  User, 
  Home, 
  Search,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  onMenuToggle?: () => void
  className?: string
}

export default function Header({ 
  title = "Admin Panel", 
  subtitle, 
  showBackButton = false, 
  backUrl = '/admin/students',
  onMenuToggle,
  className
}: HeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await signOut({ callbackUrl: '/login' })
    }
  }

  const handleBack = () => {
    router.push(backUrl)
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "h-16 px-6 flex items-center justify-between",
      "shadow-lg transition-all duration-200",
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden hover:bg-accent rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Back Button */}
        {showBackButton && (
          <Button 
            onClick={handleBack} 
            variant="outline" 
            size="sm"
            className="hidden sm:flex border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-xl"
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        )}

        {/* Title Section */}
        <div className="flex-1 ml-4">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-base text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        {/* Logout Button */}
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          size="sm"
          className="border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 rounded-lg px-3 py-2"
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline font-medium text-sm">Logout</span>
        </Button>
      </div>
    </header>
  )
}
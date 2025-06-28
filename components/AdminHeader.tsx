'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut, User, Settings, Bell, Search, PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle = () => {} }: AdminHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      signOut({ callbackUrl: '/login' })
    }
  }



  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6 md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <PanelLeft className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari sesuatu..." className="pl-10 w-full max-w-xs bg-muted/50 rounded-full" />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifikasi</span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="font-semibold text-sm text-foreground">{session?.user?.username}</span>
            <span className="text-xs text-muted-foreground">{session?.user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
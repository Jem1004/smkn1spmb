'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Users,
  UserPlus,
  FileText,
  LogOut,
  GraduationCap,
  Trophy,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Target,
  PanelLeft,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    title: 'Manajemen Siswa',
    href: '/admin/students',
    icon: Users,
  },
  {
    title: 'Tambah Siswa',
    href: '/admin/students/add',
    icon: UserPlus,
  },
  {
    title: 'Ranking Pendaftaran',
    href: '/admin/ranking',
    icon: Trophy,
  },
  {
    title: 'Manajemen Kuota',
    href: '/admin/quota',
    icon: Target,
  },
]

export default function Sidebar({ isCollapsed, onToggle, className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  // Sidebar hanya untuk admin
  const navItems = navigationItems
  
  // Jika bukan admin, jangan render sidebar
  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      const { signOut } = await import('next-auth/react')
      await signOut({ callbackUrl: '/login' })
    }
  }

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const active = isActive(item.href)

    return (
          <div className="w-full">
            <Button
              variant={active ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start h-11 rounded-lg transition-all duration-200 font-semibold text-sm",
                isCollapsed ? "px-0 justify-center w-11 h-11" : "px-4",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => router.push(item.href)}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span className="flex-1 text-left">{item.title}</span>}
            </Button>
          </div>
    )
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-background border-r border-border/60 transition-all duration-300 ease-in-out",
      "flex flex-col",
      isCollapsed ? "w-[72px]" : "w-64",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center h-20 px-4 border-b border-border/60",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-foreground text-lg leading-tight">SPMB SMKN 1</h2>
              <p className="text-xs text-muted-foreground font-medium">T.A 2025/2026</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border/60 space-y-2">
        <Button
          variant={'ghost'}
          className={cn(
            "w-full justify-start h-11 rounded-lg transition-all duration-200 font-semibold text-sm",
            isCollapsed ? "px-0 justify-center w-11 h-11" : "px-4",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          title={isCollapsed ? "Pengaturan" : undefined}
        >
          <Settings className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="flex-1 text-left">Pengaturan</span>}
        </Button>
        <Button
          variant={'ghost'}
          className={cn(
            "w-full justify-start h-11 rounded-lg transition-all duration-200 font-semibold text-sm",
            isCollapsed ? "px-0 justify-center w-11 h-11" : "px-4",
            "text-red-500 hover:text-red-500 hover:bg-red-500/10"
          )}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="flex-1 text-left">Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
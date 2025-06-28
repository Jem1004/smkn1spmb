'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Users,
  UserPlus,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Trophy,
  BookOpen,
  Calendar,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Target,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
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

const studentNavigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/student/dashboard',
    icon: Home,
  },
  {
    title: 'Status Pendaftaran',
    href: '/student/status',
    icon: FileText,
  },
  {
    title: 'Profil',
    href: '/student/profile',
    icon: Users,
  },
  {
    title: 'Bantuan',
    href: '/student/help',
    icon: HelpCircle,
  },
]

export default function Sidebar({ 
  isCollapsed = false, 
  onToggle,
  className 
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const navItems = user?.role === 'ADMIN' ? navigationItems : studentNavigationItems

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout()
      router.push('/login')
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
          variant="ghost"
          className={cn(
            "w-full justify-start h-12 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
            "hover:bg-accent hover:text-accent-foreground",
        active && "bg-primary text-primary-foreground shadow-md",
            isCollapsed && "px-3 justify-center",
            level > 0 && "ml-4 w-[calc(100%-1rem)]"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.href)
            } else {
              router.push(item.href)
            }
          }}
        >
          <item.icon className={cn(
            "h-5 w-5 shrink-0",
            !isCollapsed && "mr-3"
          )} />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronRight className={cn(
                  "h-4 w-4 ml-2 transition-transform duration-200",
                  isExpanded && "rotate-90"
                )} />
              )}
            </>
          )}
        </Button>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card border-r-2 border-border transition-all duration-300 ease-in-out",
      "flex flex-col shadow-xl",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-sidebar-border",
        isCollapsed && "justify-center"
      )}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">PPDB SMK</h2>
          <p className="text-xs text-muted-foreground">Digital System</p>
            </div>
          </div>
        )}
        
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-accent rounded-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="mb-4 p-3 bg-accent/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start h-12 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
            "text-destructive hover:bg-destructive/10 hover:text-destructive",
            isCollapsed && "px-3 justify-center"
          )}
        >
          <LogOut className={cn(
            "h-5 w-5 shrink-0",
            !isCollapsed && "mr-3"
          )} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Dumbbell,
  Camera,
  TrendingUp,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workouts',  label: 'Workouts',  icon: Dumbbell },
  { href: '/photos',    label: 'Photos',    icon: Camera },
  { href: '/progress',  label: 'Progress',  icon: TrendingUp },
  { href: '/profile',   label: 'Profile',   icon: User },
]

interface SidebarProps {
  userName?: string | null
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col h-full transition-all duration-300',
          collapsed ? 'w-16' : 'w-[220px]'
        )}
        style={{
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center h-16 px-4',
            collapsed ? 'justify-center' : 'gap-2'
          )}
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent-violet)' }}
            >
              <span className="text-white font-bold text-sm">A</span>
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <div
                  className="w-2 h-2 rounded-full absolute -top-0.5 -right-0.5"
                  style={{
                    background: 'var(--accent-violet)',
                    boxShadow: '0 0 8px var(--accent-violet)',
                  }}
                />
              </div>
              <span
                className="font-bold text-lg tracking-wide group-hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-primary)' }}
              >
                Arc
              </span>
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-5 space-y-0.5 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href)

            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        'relative flex items-center justify-center h-10 w-full rounded-md transition-colors duration-150',
                        isActive
                          ? 'text-[var(--accent-violet)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      )}
                      style={isActive ? { background: 'rgba(124, 58, 237, 0.06)' } : undefined}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'text-[var(--accent-violet)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
                style={isActive ? { background: 'rgba(124, 58, 237, 0.06)' } : undefined}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: 'var(--accent-violet)' }}
                  />
                )}
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center h-10 w-full rounded-md transition-opacity hover:opacity-70"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background: 'rgba(124, 58, 237, 0.15)',
                      color: 'var(--accent-violet)',
                    }}
                  >
                    {initials}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{userName ?? 'Account'}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{
                  background: 'rgba(124, 58, 237, 0.15)',
                  color: 'var(--accent-violet)',
                }}
              >
                {initials}
              </div>
              <span
                className="text-sm truncate flex-1 min-w-0"
                style={{ color: 'var(--text-secondary)' }}
              >
                {userName ?? 'Account'}
              </span>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 transition-colors duration-150 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Users, DollarSign, AlertTriangle, Award, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminNavProps {
  userRole: 'admin' | 'super_admin'
}

export default function AdminNav({ userRole }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const baseNavItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: Shield,
    },
    {
      href: '/admin/verifications',
      label: 'Verification Queue',
      icon: Users,
    },
    {
      href: '/admin/escrow',
      label: 'Escrow Management',
      icon: DollarSign,
    },
    {
      href: '/admin/disputes',
      label: 'Disputes',
      icon: AlertTriangle,
    },
    {
      href: '/admin/badges',
      label: 'Badge Management',
      icon: Award,
    },
  ]

  // Add super admin link if user is super admin
  const navItems = userRole === 'super_admin' 
    ? [
        ...baseNavItems,
        {
          href: '/admin/super-admin',
          label: 'Super Admin',
          icon: Shield,
        },
      ]
    : baseNavItems

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-black/50 backdrop-blur border-b border-red-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span className="text-xl font-orbitron font-bold text-white">
              Red Arcana Admin
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

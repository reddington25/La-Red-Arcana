'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, LayoutDashboard, User, LogOut, Users, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SpecialistNav() {
  const pathname = usePathname()
  const [isAmbassador, setIsAmbassador] = useState(false)
  
  useEffect(() => {
    const checkAmbassador = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('is_ambassador')
          .eq('id', user.id)
          .single()
        setIsAmbassador(data?.is_ambassador || false)
      }
    }
    checkAmbassador()
  }, [])

  const baseNavItems = [
    { href: '/specialist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/specialist/opportunities', label: 'Oportunidades', icon: Briefcase },
    { href: '/specialist/profile', label: 'Perfil', icon: User },
  ]
  
  // Ambassador-only tabs
  const ambassadorNavItems = isAmbassador ? [
    { href: '/specialist/referrals', label: 'Mis Referidos', icon: Users },
    { href: '/specialist/network-earnings', label: 'Ganancias de Red', icon: DollarSign },
  ] : []

  const navItems = [...baseNavItems, ...ambassadorNavItems]
  
  return (
    <nav className="bg-black/50 backdrop-blur border-b border-red-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/specialist/dashboard" className="text-2xl font-orbitron font-bold text-red-500">
            Red Arcana
          </Link>
          
          <div className="flex items-center gap-4 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? item.href.startsWith('/specialist/referrals') || item.href.startsWith('/specialist/network-earnings')
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                      : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{item.label}</span>
                </Link>
              )
            })}
            
            <Link
              href="/auth/logout"
              className="flex items-center gap-2 px-3 py-2 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

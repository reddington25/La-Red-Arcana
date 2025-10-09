'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, LayoutDashboard, User, LogOut } from 'lucide-react'

export default function SpecialistNav() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/specialist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/specialist/opportunities', label: 'Oportunidades', icon: Briefcase },
    { href: '/specialist/profile', label: 'Perfil', icon: User },
  ]
  
  return (
    <nav className="bg-black/50 backdrop-blur border-b border-red-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/specialist/dashboard" className="text-2xl font-orbitron font-bold text-red-500">
            Red Arcana
          </Link>
          
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
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

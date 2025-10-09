'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Home, User, LogOut } from 'lucide-react'

export default function StudentNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: Home },
    { href: '/student/contracts/new', label: 'Nuevo Contrato', icon: FileText },
    { href: '/student/profile', label: 'Perfil', icon: User },
  ]

  return (
    <nav className="bg-black/90 backdrop-blur border-b border-red-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/student/dashboard" className="text-2xl font-orbitron text-red-500">
            Red Arcana
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}

            <Link
              href="/auth/logout"
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
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

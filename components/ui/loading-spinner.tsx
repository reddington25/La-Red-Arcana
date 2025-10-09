'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <Loader2 className={`animate-spin text-red-400 ${sizeClasses[size]} ${className}`} />
  )
}

export function LoadingScreen({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-400">{message}</p>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-800 rounded w-5/6"></div>
    </div>
  )
}

export function LoadingButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {children}
    </div>
  )
}

'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 touch-manipulation'

    const variantClasses = {
      primary:
        'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-lg shadow-red-500/20',
      secondary:
        'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800',
      outline:
        'bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500/10 active:bg-red-500/20',
      ghost:
        'bg-transparent text-gray-300 hover:bg-white/5 active:bg-white/10',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/20',
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-base min-h-[44px]',
      lg: 'px-6 py-4 text-lg min-h-[52px]',
    }

    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

TouchButton.displayName = 'TouchButton'

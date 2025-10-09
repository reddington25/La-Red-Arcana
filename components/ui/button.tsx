import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      default: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border border-red-500/30 bg-transparent text-white hover:bg-red-500/10',
      secondary: 'bg-gray-700 text-white hover:bg-gray-600',
      ghost: 'bg-transparent text-white hover:bg-gray-800',
      destructive: 'bg-red-600 text-white hover:bg-red-700'
    }
    
    const sizes = {
      default: 'px-4 py-2 text-sm',
      sm: 'px-3 py-1.5 text-xs',
      lg: 'px-6 py-3 text-base'
    }
    
    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
    
    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement<any>, {
        className: classes,
        ref
      } as any)
    }
    
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }

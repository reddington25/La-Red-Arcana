'use client'

interface GlitchTextProps {
  children: string
  className?: string
}

export function GlitchText({ children, className = '' }: GlitchTextProps) {
  return (
    <h1 className={`text-6xl md:text-8xl font-orbitron relative ${className}`}>
      <span className="absolute inset-0 text-red-500 animate-glitch-1" aria-hidden="true">
        {children}
      </span>
      <span className="absolute inset-0 text-blue-500 animate-glitch-2" aria-hidden="true">
        {children}
      </span>
      <span className="relative text-white">{children}</span>
    </h1>
  )
}

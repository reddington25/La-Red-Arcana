'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

interface InfoTooltipProps {
  content: string
  className?: string
}

export function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className={`text-gray-400 hover:text-gray-300 transition-colors ${className}`}
        aria-label="Más información"
      >
        <Info className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-sm text-gray-300">
          <div className="relative">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface HelpCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}

export function HelpCard({ title, description, icon, className = '' }: HelpCardProps) {
  return (
    <div className={`bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 text-blue-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-white font-semibold mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}

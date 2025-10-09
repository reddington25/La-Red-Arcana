'use client'

import { useNetworkStatus } from '@/lib/hooks/useMobile'
import { WifiOff, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OfflineIndicator() {
  const { isOnline, connectionType } = useNetworkStatus()
  const [showIndicator, setShowIndicator] = useState(false)
  const [justCameOnline, setJustCameOnline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true)
      setJustCameOnline(false)
    } else if (showIndicator) {
      // User just came back online
      setJustCameOnline(true)
      setTimeout(() => {
        setShowIndicator(false)
        setJustCameOnline(false)
      }, 3000)
    }
  }, [isOnline, showIndicator])

  if (!showIndicator) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div
        className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
          justCameOnline
            ? 'bg-green-500/90 backdrop-blur'
            : 'bg-red-500/90 backdrop-blur'
        }`}
      >
        {justCameOnline ? (
          <>
            <Wifi className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Conexión restaurada
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Sin conexión - Modo offline
            </span>
          </>
        )}
      </div>
      
      {!isOnline && (
        <p className="text-xs text-center text-gray-400 mt-2">
          Algunas funciones pueden no estar disponibles
        </p>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    const checkTouch = () => {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsTouch(touch)
    }

    checkMobile()
    checkTouch()

    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return { isMobile, isTouch }
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return orientation
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection?.effectiveType || 'unknown')

      const handleConnectionChange = () => {
        setConnectionType(connection?.effectiveType || 'unknown')
      }

      connection?.addEventListener('change', handleConnectionChange)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection?.removeEventListener('change', handleConnectionChange)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, connectionType }
}

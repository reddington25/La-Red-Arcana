'use client'

import { useEffect, useRef, useState } from 'react'

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLowPower, setIsLowPower] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Detect if device is low-power (mobile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    setIsLowPower(isMobile || prefersReducedMotion)

    // Set canvas size with device pixel ratio for sharp rendering
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      ctx.scale(dpr, dpr)
      
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
    resizeCanvas()
    
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resizeCanvas, 250)
    }
    window.addEventListener('resize', handleResize)

    // Chinese characters for matrix effect
    const chars = '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑'
    const charArray = chars.split('')

    // Adjust performance based on device
    const fontSize = isMobile ? 14 : 16
    const frameRate = isMobile ? 80 : 50 // Slower on mobile
    const fadeAmount = isMobile ? 0.08 : 0.05 // Faster fade on mobile
    
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1)

    let animationId: number
    let lastFrameTime = 0

    // Draw function with requestAnimationFrame for better performance
    const draw = (currentTime: number) => {
      if (!ctx || !canvas) return

      // Throttle frame rate
      if (currentTime - lastFrameTime < frameRate) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastFrameTime = currentTime

      // Black background with fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Red text with slight transparency
      ctx.fillStyle = 'rgba(220, 38, 38, 0.9)'
      ctx.font = `${fontSize}px monospace`

      // Draw characters (reduce columns on mobile for performance)
      const step = isMobile ? 2 : 1
      for (let i = 0; i < drops.length; i += step) {
        const char = charArray[Math.floor(Math.random() * charArray.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(char, x, y)

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }

      animationId = requestAnimationFrame(draw)
    }

    // Start animation only if not reduced motion
    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(draw)
    } else {
      // Static background for reduced motion
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{ 
        width: '100vw', 
        height: '100vh',
        willChange: isLowPower ? 'auto' : 'transform'
      }}
    />
  )
}

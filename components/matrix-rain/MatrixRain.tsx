'use client'

import { useEffect, useRef } from 'react'

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('Canvas not found')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Context not found')
      return
    }

    console.log('Matrix Rain initialized')

    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    
    console.log('Is mobile:', isMobile)

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      console.log('Canvas size:', canvas.width, 'x', canvas.height)
    }
    setCanvasSize()

    // Chinese characters
    const chars = '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑'
    const charArray = chars.split('')

    // Settings
    const fontSize = isMobile ? 12 : 16
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = []
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * canvas.height / fontSize)
    }

    console.log('Columns:', columns, 'Drops:', drops.length)

    // Animation
    let frameCount = 0
    const frameSkip = isMobile ? 2 : 1

    function draw() {
      if (!ctx || !canvas) return

      frameCount++
      if (frameCount % frameSkip !== 0) {
        requestAnimationFrame(draw)
        return
      }

      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw characters
      ctx.fillStyle = '#dc2626' // Red color
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(char, x, y)

        // Reset drop
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }

      requestAnimationFrame(draw)
    }

    // Start animation
    draw()

    // Handle resize
    const handleResize = () => {
      setCanvasSize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  )
}

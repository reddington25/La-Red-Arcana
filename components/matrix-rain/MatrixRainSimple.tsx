'use client'

import { useEffect, useRef } from 'react'

/**
 * Versión simplificada del efecto Matrix Rain
 * Usa CSS animations en lugar de canvas para mayor compatibilidad
 */
export function MatrixRainSimple() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Caracteres chinos para el efecto
    const chars = '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑'.split('')
    
    // Crear columnas de caracteres
    const columnCount = Math.floor(window.innerWidth / 20)
    
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement('div')
      column.className = 'matrix-column'
      column.style.left = `${i * 20}px`
      column.style.animationDelay = `${Math.random() * 5}s`
      column.style.animationDuration = `${10 + Math.random() * 10}s`
      
      // Agregar caracteres a la columna
      const charCount = Math.floor(Math.random() * 10) + 5
      for (let j = 0; j < charCount; j++) {
        const char = document.createElement('span')
        char.textContent = chars[Math.floor(Math.random() * chars.length)]
        char.style.opacity = `${0.3 + Math.random() * 0.7}`
        column.appendChild(char)
      }
      
      container.appendChild(column)
    }

    return () => {
      container.innerHTML = ''
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      <style jsx>{`
        .matrix-column {
          position: absolute;
          top: -100%;
          width: 20px;
          color: #dc2626;
          font-family: monospace;
          font-size: 16px;
          line-height: 20px;
          animation: fall linear infinite;
          opacity: 0.8;
        }
        
        .matrix-column span {
          display: block;
        }
        
        @keyframes fall {
          0% {
            top: -100%;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </>
  )
}

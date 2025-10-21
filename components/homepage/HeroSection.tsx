'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [text3, setText3] = useState('')
  const [showCursor1, setShowCursor1] = useState(true)
  const [showCursor2, setShowCursor2] = useState(false)
  const [showCursor3, setShowCursor3] = useState(false)

  const fullText1 = 'El sistema de educación tradicional ha fallado. Somos la alternativa.'
  const fullText2 = 'La red de inteligencia académica a tu alcance.'
  const fullText3 = 'Optimiza tu tiempo, asegura tus resultados.'

  useEffect(() => {
    let index1 = 0
    let index2 = 0
    let index3 = 0

    // Primera línea
    const timer1 = setInterval(() => {
      if (index1 < fullText1.length) {
        setText1(fullText1.substring(0, index1 + 1))
        index1++
      } else {
        clearInterval(timer1)
        setShowCursor1(false)
        setShowCursor2(true)
        
        // Segunda línea
        const timer2 = setInterval(() => {
          if (index2 < fullText2.length) {
            setText2(fullText2.substring(0, index2 + 1))
            index2++
          } else {
            clearInterval(timer2)
            setShowCursor2(false)
            setShowCursor3(true)
            
            // Tercera línea
            const timer3 = setInterval(() => {
              if (index3 < fullText3.length) {
                setText3(fullText3.substring(0, index3 + 1))
                index3++
              } else {
                clearInterval(timer3)
                setShowCursor3(false)
              }
            }, 50) // Más lento: 50ms por carácter
          }
        }, 50)
      }
    }, 50)

    return () => {
      clearInterval(timer1)
    }
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Glitch Title - Efecto distorsionado mejorado */}
      <h1 className="text-7xl md:text-9xl font-black font-orbitron relative mb-8 glitch-container">
        <span 
          className="absolute inset-0 text-red-500"
          style={{
            animation: 'glitch-1 0.3s infinite',
            textShadow: '3px 3px 0 rgba(220, 38, 38, 0.9), -3px -3px 0 rgba(220, 38, 38, 0.5)',
            clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)'
          }}
          aria-hidden="true"
        >
          Red Arcana
        </span>
        <span 
          className="absolute inset-0 text-cyan-400"
          style={{
            animation: 'glitch-2 0.3s infinite reverse',
            textShadow: '-3px -3px 0 rgba(34, 211, 238, 0.9), 3px 3px 0 rgba(34, 211, 238, 0.5)',
            clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)'
          }}
          aria-hidden="true"
        >
          Red Arcana
        </span>
        <span 
          className="absolute inset-0 text-yellow-400 opacity-30"
          style={{
            animation: 'glitch-3 0.4s infinite',
            filter: 'blur(2px)'
          }}
          aria-hidden="true"
        >
          Red Arcana
        </span>
        <span 
          className="relative text-white"
          style={{
            textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(220, 38, 38, 0.5), 0 0 45px rgba(220, 38, 38, 0.3)',
            animation: 'text-flicker 3s infinite'
          }}
        >
          Red Arcana
        </span>
      </h1>
      
      {/* Persuasive Slogan con animación typewriter */}
      <div className="mt-8 text-xl md:text-2xl text-center max-w-4xl leading-relaxed min-h-[200px]">
        <p className="text-gray-300">
          {text1}
          {showCursor1 && <span className="animate-pulse">|</span>}
        </p>
        {text2 && (
          <p className="text-red-400 font-semibold mt-4">
            {text2}
            {showCursor2 && <span className="animate-pulse">|</span>}
          </p>
        )}
        {text3 && (
          <p className="text-gray-300 mt-4">
            {text3}
            {showCursor3 && <span className="animate-pulse">|</span>}
          </p>
        )}
      </div>
      
      {/* CTA Buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth/login"
          className="px-8 py-4 text-lg font-semibold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-lg text-center"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/auth/register?role=student"
          className="px-8 py-4 text-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg text-center"
        >
          Registrarse como Estudiante
        </Link>
        <Link
          href="/auth/register?role=specialist"
          className="px-8 py-4 text-lg font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors rounded-lg text-center border-2 border-gray-700"
        >
          Aplicar como Especialista
        </Link>
      </div>
    </section>
  )
}

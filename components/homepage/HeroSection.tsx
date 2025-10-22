'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [text3, setText3] = useState('')
  const [text4, setText4] = useState('')
  const [showCursor1, setShowCursor1] = useState(true)
  const [showCursor2, setShowCursor2] = useState(false)
  const [showCursor3, setShowCursor3] = useState(false)
  const [showCursor4, setShowCursor4] = useState(false)

  const fullText1 = 'El sistema académico actual no mide tu inteligencia, mide tu resistencia. Te ahoga en un océano de trabajos, informes y plazos imposibles que devoran tu recurso más valioso: el tiempo.'
  const fullText2 = 'Red Arcana es la alternativa para quien entiende que se trata de estrategia, no de sacrificio.'
  const fullText3 = 'Somos la red de inteligencia académica a tu alcance; una ventaja táctica que te permite delegar lo urgente para que puedas enfocarte en lo importante.'
  const fullText4 = 'Optimiza tu tiempo y asegura mejores resultados. Bienvenido a La Red Arcana.'

  useEffect(() => {
    let index1 = 0
    let index2 = 0
    let index3 = 0
    let index4 = 0

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
                setShowCursor4(true)
                
                // Cuarta línea
                const timer4 = setInterval(() => {
                  if (index4 < fullText4.length) {
                    setText4(fullText4.substring(0, index4 + 1))
                    index4++
                  } else {
                    clearInterval(timer4)
                    setShowCursor4(false)
                  }
                }, 50)
              }
            }, 50)
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
      {/* Logo Red Arcana - Grande en desktop, normal en móvil */}
      <div className="mb-8 w-full px-4 md:px-8 lg:px-12">
        <img 
          src="/logo Red Arcana.png" 
          alt="Red Arcana"
          className="w-full h-auto object-contain mx-auto"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.5)) drop-shadow(0 0 60px rgba(220, 38, 38, 0.3))',
            maxWidth: '90vw',
            maxHeight: '500px'
          }}
        />
      </div>
      
      {/* Persuasive Slogan con animación typewriter */}
      <div className="mt-8 text-lg md:text-xl text-center max-w-5xl leading-relaxed min-h-[300px] px-4">
        <p className="text-gray-300">
          {text1}
          {showCursor1 && <span className="animate-pulse">|</span>}
        </p>
        {text2 && (
          <p className="text-red-400 font-semibold mt-6">
            {text2}
            {showCursor2 && <span className="animate-pulse">|</span>}
          </p>
        )}
        {text3 && (
          <p className="text-gray-300 mt-6">
            {text3}
            {showCursor3 && <span className="animate-pulse">|</span>}
          </p>
        )}
        {text4 && (
          <p className="text-white font-bold mt-6 text-xl md:text-2xl">
            {text4}
            {showCursor4 && <span className="animate-pulse">|</span>}
          </p>
        )}
      </div>
      
      {/* CTA Buttons con animaciones mejoradas */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth/login"
          className="group relative px-8 py-4 text-lg font-semibold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 rounded-lg text-center overflow-hidden transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
        >
          <span className="relative z-10">Iniciar Sesión</span>
          <div className="absolute inset-0 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -z-0"></div>
        </Link>
        <Link
          href="/auth/register?role=student"
          className="group relative px-8 py-4 text-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-all duration-300 rounded-lg text-center overflow-hidden transform hover:scale-105 shadow-lg shadow-red-500/50 hover:shadow-red-600/70 animate-pulse-slow"
        >
          <span className="relative z-10">Registrarse como Estudiante</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        <Link
          href="/auth/register?role=specialist"
          className="group relative px-8 py-4 text-lg font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-all duration-300 rounded-lg text-center border-2 border-gray-700 hover:border-gray-500 overflow-hidden transform hover:scale-105 hover:shadow-lg hover:shadow-gray-700/50"
        >
          <span className="relative z-10">Aplicar como Especialista</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>
    </section>
  )
}

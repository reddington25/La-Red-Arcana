'use client'

import { useEffect, useRef, useState } from 'react'

export function FeaturedSpecialistsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const specialists = [
    {
      name: 'Ing. Cruskaya',
      specialty: 'Ingeniería Quimica',
      photo: '/imagen 5.png',
      stats: {
        jobs: 49,
        rating: 4.9,
        responseTime: '2h',
        successRate: '100%'
      }
    },
    {
      name: 'Ing. Rodríguez',
      specialty: 'Ingeniería Civil',
      photo: '/generica.jpg',
      stats: {
        jobs: 55,
        rating: 4.8,
        responseTime: '3h',
        successRate: '98%'
      }
    },
    {
      name: 'Ing. Lupita',
      specialty: 'Ingeniería Eléctrica',
      photo: '/imagen 4.png',
      stats: {
        jobs: 42,
        rating: 4.9,
        responseTime: '2h',
        successRate: '100%'
      }
    },
    {
      name: 'Ing. Teran',
      specialty: 'Ingeniería Mecánica',
      photo: '/generica.jpg',
      stats: {
        jobs: 38,
        rating: 4.7,
        responseTime: '4h',
        successRate: '97%'
      }
    },
    {
      name: 'Ing. Chapaco',
      specialty: 'Ingeniería Industrial',
      photo: '/imagen 2.png',
      stats: {
        jobs: 51,
        rating: 4.9,
        responseTime: '2h',
        successRate: '99%'
      }
    },
    {
      name: 'Ing. Pérez',
      specialty: 'Ingeniería Química',
      photo: '/generica.jpg',
      stats: {
        jobs: 44,
        rating: 4.8,
        responseTime: '3h',
        successRate: '98%'
      }
    },
    {
      name: 'Ing. Castro',
      specialty: 'Ingeniería Electrónica',
      photo: '/generica.jpg',
      stats: {
        jobs: 49,
        rating: 5.0,
        responseTime: '1h',
        successRate: '100%'
      }
    },
    {
      name: 'Ing. Vargas',
      specialty: 'Ingeniería de Alimentos',
      photo: '/imagen 3.png',
      stats: {
        jobs: 36,
        rating: 4.8,
        responseTime: '3h',
        successRate: '97%'
      }
    },
    {
      name: 'Ing. Cacho',
      specialty: 'Ingeniería Civil',
      photo: '/generica.jpg',
      stats: {
        jobs: 53,
        rating: 4.9,
        responseTime: '2h',
        successRate: '99%'
      }
    },
    {
      name: 'Ing. López',
      specialty: 'Ingeniería Industrial',
      photo: '/imagen 1.png',
      stats: {
        jobs: 40,
        rating: 4.7,
        responseTime: '4h',
        successRate: '96%'
      }
    },
    {
      name: 'Lic. Newton',
      specialty: 'Matemáticas Aplicadas',
      photo: '/generica.jpg',
      stats: {
        jobs: 63,
        rating: 5.0,
        responseTime: '1h',
        successRate: '100%'
      }
    },
    {
      name: 'Arq. Salazar',
      specialty: 'Arquitectura y Diseño',
      photo: '/generica.jpg',
      stats: {
        jobs: 52,
        rating: 4.9,
        responseTime: '2h',
        successRate: '100%'
      }
    }
  ]

  // Auto-scroll cada 7 segundos
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % specialists.length
        return next
      })
    }, 7000) // 7 segundos

    return () => clearInterval(interval)
  }, [isPaused, specialists.length])

  // Scroll suave al cambiar el índice
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 320 + 24 // width + gap
      scrollRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])

  return (
    <div className="mb-16">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Especialistas Destacados
      </h3>

      {/* Carrusel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {specialists.map((specialist, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-80 snap-center transition-all duration-500"
            style={{
              opacity: Math.abs(currentIndex - index) <= 2 ? 1 : 0.5,
              transform: currentIndex === index ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500/60 transition-all duration-300 h-full">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={specialist.photo}
                  alt={specialist.name}
                  className="w-16 h-16 rounded-full border-2 border-red-500"
                />
                <div>
                  <h4 className="font-semibold text-white">{specialist.name}</h4>
                  <p className="text-sm text-gray-400">{specialist.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Trabajos</p>
                  <p className="font-bold text-white">{specialist.stats.jobs}</p>
                </div>
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Rating</p>
                  <p className="font-bold text-white">{specialist.stats.rating} ⭐</p>
                </div>
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Respuesta</p>
                  <p className="font-bold text-white">{specialist.stats.responseTime}</p>
                </div>
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Éxito</p>
                  <p className="font-bold text-white">{specialist.stats.successRate}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores de posición */}
      <div className="flex justify-center gap-2 mt-6">
        {specialists.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                ? 'w-8 bg-red-500'
                : 'w-2 bg-gray-600 hover:bg-gray-500'
              }`}
            aria-label={`Ir al especialista ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

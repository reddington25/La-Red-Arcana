'use client'

export function FeaturedSpecialistsCarousel() {
  const specialists = [
    {
      name: 'Ing. Cruskaya',
      specialty: 'Ingeniería de Sistemas',
      photo: '/icons/icon-192x192.png',
      stats: {
        jobs: 47,
        rating: 4.9,
        responseTime: '2h',
        successRate: '100%'
      }
    },
    {
      name: 'Dr. Mendoza',
      specialty: 'Matemáticas Aplicadas',
      photo: '/icons/icon-192x192.png',
      stats: {
        jobs: 63,
        rating: 5.0,
        responseTime: '1h',
        successRate: '100%'
      }
    },
    {
      name: 'Lic. Vargas',
      specialty: 'Derecho Constitucional',
      photo: '/icons/icon-192x192.png',
      stats: {
        jobs: 38,
        rating: 4.8,
        responseTime: '3h',
        successRate: '98%'
      }
    },
    {
      name: 'Arq. Salazar',
      specialty: 'Arquitectura y Diseño',
      photo: '/icons/icon-192x192.png',
      stats: {
        jobs: 52,
        rating: 4.9,
        responseTime: '2h',
        successRate: '100%'
      }
    },
    {
      name: 'Lic. Torres',
      specialty: 'Economía y Finanzas',
      photo: '/icons/icon-192x192.png',
      stats: {
        jobs: 41,
        rating: 4.7,
        responseTime: '4h',
        successRate: '97%'
      }
    }
  ]
  
  return (
    <div className="mb-16">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Especialistas Destacados
      </h3>
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
        {specialists.map((specialist, index) => (
          <div key={index} className="flex-shrink-0 w-80 snap-center">
            <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500/60 transition-colors">
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
    </div>
  )
}

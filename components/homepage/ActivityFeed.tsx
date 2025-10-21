'use client'

import { useEffect, useState } from 'react'

interface Activity {
  type: string
  time: string
  price: string
  id: number
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [nextId, setNextId] = useState(0)

  // Pool de contratos posibles
  const contractTypes = [
    { type: 'Ensayo de Filosofía', priceRange: [100, 150] },
    { type: 'Proyecto de Programación', priceRange: [200, 350] },
    { type: 'Revisión de Tesis', priceRange: [150, 250] },
    { type: 'Análisis Estadístico', priceRange: [180, 280] },
    { type: 'Diseño Arquitectónico', priceRange: [250, 400] },
    { type: 'Informe de Laboratorio', priceRange: [80, 150] },
    { type: 'Cálculo de Estructuras', priceRange: [200, 350] },
    { type: 'Diseño de Circuitos', priceRange: [180, 300] },
    { type: 'Análisis de Algoritmos', priceRange: [150, 250] },
    { type: 'Modelado 3D', priceRange: [200, 350] },
    { type: 'Simulación de Procesos', priceRange: [180, 280] },
    { type: 'Estudio de Mercado', priceRange: [150, 250] },
    { type: 'Plan de Negocios', priceRange: [200, 350] },
    { type: 'Análisis Financiero', priceRange: [180, 300] },
    { type: 'Diseño de Base de Datos', priceRange: [150, 250] },
    { type: 'Desarrollo Web', priceRange: [250, 450] },
    { type: 'App Móvil', priceRange: [300, 500] },
    { type: 'Informe Técnico', priceRange: [120, 200] },
    { type: 'Presentación PowerPoint', priceRange: [80, 150] },
    { type: 'Traducción de Documentos', priceRange: [100, 180] },
    { type: 'Corrección de Estilo', priceRange: [80, 150] },
    { type: 'Investigación Bibliográfica', priceRange: [100, 180] },
    { type: 'Análisis de Datos', priceRange: [180, 300] },
    { type: 'Diseño de Experimentos', priceRange: [200, 350] },
    { type: 'Memoria de Cálculo', priceRange: [150, 250] }
  ]

  // Función para generar una actividad aleatoria
  const generateRandomActivity = (minutesAgo: number): Activity => {
    const randomContract = contractTypes[Math.floor(Math.random() * contractTypes.length)]
    const randomPrice = Math.floor(
      Math.random() * (randomContract.priceRange[1] - randomContract.priceRange[0] + 1) +
      randomContract.priceRange[0]
    )
    
    return {
      type: randomContract.type,
      time: `Hace ${minutesAgo} min`,
      price: `Bs. ${randomPrice}`,
      id: nextId
    }
  }

  // Inicializar con actividades aleatorias
  useEffect(() => {
    const initialActivities: Activity[] = []
    const initialMinutes = [2, 7, 12, 18, 25, 35]
    
    initialMinutes.forEach((minutes, index) => {
      initialActivities.push({
        ...generateRandomActivity(minutes),
        id: index
      })
    })
    
    setActivities(initialActivities)
    setNextId(initialMinutes.length)
  }, [])

  // Agregar nuevas actividades en intervalos aleatorios
  useEffect(() => {
    const addNewActivity = () => {
      setActivities(prev => {
        // Agregar nueva actividad al inicio
        const newActivity = generateRandomActivity(0)
        
        // Actualizar tiempos de actividades existentes
        const updatedActivities = prev.map(activity => {
          const currentMinutes = parseInt(activity.time.match(/\d+/)?.[0] || '0')
          return {
            ...activity,
            time: `Hace ${currentMinutes + 1} min`
          }
        })
        
        // Mantener solo las últimas 6 actividades
        return [newActivity, ...updatedActivities].slice(0, 6)
      })
      
      setNextId(prev => prev + 1)
    }

    // Intervalo aleatorio entre 8 y 20 segundos
    const randomInterval = () => Math.floor(Math.random() * (20000 - 8000 + 1)) + 8000
    
    let timeoutId: NodeJS.Timeout
    
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        addNewActivity()
        scheduleNext()
      }, randomInterval())
    }
    
    scheduleNext()
    
    return () => clearTimeout(timeoutId)
  }, [nextId])

  return (
    <div className="mb-16 max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Actividad en Tiempo Real
      </h3>
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 overflow-hidden">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0 transition-all duration-500"
            style={{
              animation: index === 0 ? 'slideIn 0.5s ease-out' : 'none',
              opacity: 1 - (index * 0.1)
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 bg-green-500 rounded-full"
                style={{
                  animation: index === 0 ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                }}
              />
              <div>
                <p className="text-white font-medium">{activity.type}</p>
                <p className="text-sm text-gray-400">{activity.time}</p>
              </div>
            </div>
            <p className="text-red-400 font-semibold">{activity.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

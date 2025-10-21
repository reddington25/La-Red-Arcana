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

  // Pool de contratos posibles - Enfocado en tareas de ingeniería (50-200 Bs)
  const contractTypes = [
    // Ingeniería Civil
    { type: 'Ejercicios de Resistencia', priceRange: [60, 120] },
    { type: 'Cálculo de Vigas', priceRange: [80, 150] },
    { type: 'Diseño de Zapatas', priceRange: [90, 160] },
    { type: 'Análisis Estructural', priceRange: [100, 180] },
    
    // Ingeniería Eléctrica
    { type: 'Circuitos en Serie/Paralelo', priceRange: [50, 100] },
    { type: 'Análisis de Circuitos AC', priceRange: [70, 130] },
    { type: 'Diseño de Circuitos Digitales', priceRange: [90, 160] },
    { type: 'Problemas de Electromagnetismo', priceRange: [80, 140] },
    
    // Ingeniería de Sistemas
    { type: 'Algoritmos en Python', priceRange: [70, 140] },
    { type: 'Estructura de Datos', priceRange: [80, 150] },
    { type: 'Base de Datos SQL', priceRange: [90, 160] },
    { type: 'Página Web Simple', priceRange: [120, 200] },
    
    // Ingeniería Mecánica
    { type: 'Problemas de Termodinámica', priceRange: [60, 120] },
    { type: 'Análisis de Fuerzas', priceRange: [70, 130] },
    { type: 'Diseño de Piezas CAD', priceRange: [100, 180] },
    { type: 'Cálculo de Engranajes', priceRange: [80, 150] },
    
    // Ingeniería Industrial
    { type: 'Estudio de Tiempos', priceRange: [70, 130] },
    { type: 'Diagrama de Procesos', priceRange: [60, 110] },
    { type: 'Análisis de Productividad', priceRange: [80, 150] },
    { type: 'Layout de Planta', priceRange: [90, 160] },
    
    // Ingeniería Química
    { type: 'Balance de Materia', priceRange: [70, 130] },
    { type: 'Cálculos Estequiométricos', priceRange: [60, 110] },
    { type: 'Informe de Laboratorio', priceRange: [50, 100] },
    { type: 'Diagramas de Flujo', priceRange: [80, 140] },
    
    // Derecho
    { type: 'Resumen de Sentencias', priceRange: [60, 120] },
    { type: 'Análisis de Casos', priceRange: [80, 150] },
    { type: 'Ensayo Jurídico', priceRange: [90, 160] },
    
    // Economía
    { type: 'Ejercicios de Microeconomía', priceRange: [60, 120] },
    { type: 'Análisis de Mercado', priceRange: [80, 150] },
    { type: 'Gráficos Económicos', priceRange: [50, 100] },
    
    // Trabajos más pesados (ocasionales)
    { type: 'Revisión de Tesis', priceRange: [200, 350] },
    { type: 'Proyecto Final de Grado', priceRange: [250, 400] },
    { type: 'Monografía Completa', priceRange: [200, 300] }
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

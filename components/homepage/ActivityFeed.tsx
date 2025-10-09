'use client'

export function ActivityFeed() {
  const activities = [
    { type: 'Ensayo de Filosofía', time: 'Hace 5 min', price: 'Bs. 120' },
    { type: 'Proyecto de Programación', time: 'Hace 12 min', price: 'Bs. 250' },
    { type: 'Revisión de Tesis', time: 'Hace 18 min', price: 'Bs. 180' },
    { type: 'Análisis Estadístico', time: 'Hace 23 min', price: 'Bs. 200' },
    { type: 'Diseño Arquitectónico', time: 'Hace 31 min', price: 'Bs. 300' },
    { type: 'Informe de Laboratorio', time: 'Hace 45 min', price: 'Bs. 90' }
  ]
  
  return (
    <div className="mb-16 max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Actividad en Tiempo Real
      </h3>
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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

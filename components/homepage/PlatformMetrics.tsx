import { Users, TrendingUp, Clock } from 'lucide-react'

export function PlatformMetrics() {
  const metrics = [
    { value: '100+', label: 'Especialistas Activos', icon: Users },
    { value: '98.7%', label: 'Tasa de Satisfacción', icon: TrendingUp },
    { value: '24h', label: 'Tiempo Promedio de Respuesta', icon: Clock }
  ]
  
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-gradient-to-br from-red-500/20 to-black/50 backdrop-blur border border-red-500/50 rounded-lg p-8 text-center hover:from-red-500/30 transition-colors">
          <metric.icon className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-4xl font-bold text-white mb-2">{metric.value}</p>
          <p className="text-gray-300">{metric.label}</p>
        </div>
      ))}
    </div>
  )
}

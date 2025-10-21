import { Star } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      alias: 'EstudianteX',
      career: 'Ingeniería Civil',
      rating: 5,
      text: 'Increíble servicio. El especialista entendió perfectamente lo que necesitaba y entregó antes del plazo. Mi nota fue sobresaliente.',
      project: 'Cálculo de Estructuras',
      verified: true
    },
    {
      alias: 'AnonStudent',
      career: 'Derecho',
      rating: 5,
      text: 'La plataforma es muy segura y el proceso de escrow me dio mucha confianza. El trabajo fue impecable y la comunicación excelente.',
      project: 'Análisis Jurisprudencial',
      verified: true
    },
    {
      alias: 'UserAlpha',
      career: 'Administración',
      rating: 4,
      text: 'Excelente experiencia. El especialista fue muy profesional y me ayudó a entender mejor el tema. Definitivamente volveré a usar el servicio.',
      project: 'Plan de Negocios',
      verified: true
    },
    {
      alias: 'TechStudent',
      career: 'Ingeniería de Sistemas',
      rating: 5,
      text: 'El especialista no solo completó mi proyecto de programación, sino que me explicó cada parte del código. Aprendí mucho y saqué la mejor nota.',
      project: 'Sistema Web con React',
      verified: true
    },
    {
      alias: 'ElectroUser',
      career: 'Ingeniería Eléctrica',
      rating: 5,
      text: 'Necesitaba ayuda urgente con el diseño de circuitos y encontré un especialista increíble. Entrega rápida, trabajo impecable y excelente comunicación.',
      project: 'Diseño de Circuitos Digitales',
      verified: true
    },
    {
      alias: 'MechaStudent',
      career: 'Ingeniería Mecánica',
      rating: 4,
      text: 'La simulación de procesos que me entregaron fue exactamente lo que necesitaba. El especialista demostró mucho conocimiento y profesionalismo.',
      project: 'Simulación en SolidWorks',
      verified: true
    }
  ]
  
  return (
    <div className="max-w-6xl mx-auto">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Lo que Dicen Nuestros Estudiantes
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500/60 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-white">{testimonial.alias}</p>
                <p className="text-sm text-gray-400">{testimonial.career}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-gray-300 mb-4 italic">&quot;{testimonial.text}&quot;</p>
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-400">Proyecto: {testimonial.project}</p>
              {testimonial.verified && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                  VERIFICADO
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

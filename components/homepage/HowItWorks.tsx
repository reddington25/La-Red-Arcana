import { FileText, Users, Shield, CheckCircle } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: 'Describe tu Desafío',
      description: 'Publica los detalles de tu trabajo, sube los archivos necesarios y establece el precio que consideras justo. No es solo una tarea, es un contrato de servicio académico.'
    },
    {
      icon: Users,
      title: 'Recibe Contraofertas',
      description: 'Nuestra red de especialistas verificados analizará tu solicitud y te enviará contraofertas. Podrás comparar precios y perfiles.'
    },
    {
      icon: Shield,
      title: 'Elige a tu Experto',
      description: 'Revisa la reputación, experiencia y calificación de cada especialista. Acepta la oferta que más te convenga y deposita los fondos de forma segura en nuestro sistema de escrow.'
    },
    {
      icon: CheckCircle,
      title: 'Recibe tu Trabajo',
      description: 'El especialista trabaja en tu proyecto. Los fondos permanecen seguros hasta que apruebes el trabajo final. Califica la experiencia y cierra el contrato.'
    }
  ]
  
  return (
    <section className="py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
        Protocolo de los Contratos
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500/60 transition-colors">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <step.icon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
      
      {/* Specialist Hook */}
      <div className="mt-16 max-w-3xl mx-auto text-center">
        <p className="text-lg text-gray-300 italic border-l-4 border-red-500 pl-6 py-4 bg-black/30 rounded">
          Y recuerda, el conocimiento que adquieres hoy puede ser el que monetices mañana. 
          Si eres un estudiante destacado, a largo plazo también puedes postular para ser 
          parte de nuestra red de élite.
        </p>
      </div>
    </section>
  )
}

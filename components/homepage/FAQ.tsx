'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: '¿Cómo funciona el pago? ¿Es seguro?',
      answer: 'Utilizamos un sistema de escrow (depósito en garantía) manual. Cuando aceptas una oferta, depositas los fondos con nuestro equipo administrativo. El dinero permanece seguro hasta que apruebes el trabajo final. Solo entonces se libera el pago al especialista. Esto garantiza que ambas partes cumplan con el contrato.'
    },
    {
      question: '¿Mi identidad como estudiante es anónima?',
      answer: 'Sí, completamente. Tu nombre real nunca se muestra públicamente. Solo usas un alias de tu elección. Los especialistas solo conocen tu alias y los detalles del trabajo que necesitas. Tu privacidad es nuestra prioridad.'
    },
    {
      question: '¿Qué pasa si no estoy satisfecho con el trabajo entregado?',
      answer: 'Tenemos un sistema de disputas. Si el trabajo no cumple con lo acordado, puedes iniciar una disputa dentro de la semana siguiente a la entrega. Nuestro equipo de administración revisará el caso, el historial de mensajes y tomará una decisión justa que puede incluir reembolso total, parcial o solicitar correcciones al especialista.'
    },
    {
      question: '¿Quiénes son los especialistas y cómo son verificados?',
      answer: 'Nuestros especialistas son estudiantes destacados y egresados universitarios. Cada uno pasa por un riguroso proceso de verificación manual que incluye: validación de identidad, revisión de documentos académicos (CI, CV, certificados), y una entrevista por WhatsApp. Solo los mejores son aceptados en la red.'
    },
    {
      question: '¿Cómo puedo postular para ser un especialista?',
      answer: 'Haz clic en "Aplicar como Especialista" en la página principal. Deberás completar un formulario con tus datos académicos, subir tu CI y CV, y esperar la verificación de nuestro equipo. El proceso puede tomar de 24 a 48 horas. Una vez aprobado, podrás empezar a recibir oportunidades de trabajo.'
    },
    {
      question: '¿Qué comisiones cobra la plataforma?',
      answer: 'Red Arcana cobra una comisión del 15% sobre el precio final del contrato, que se descuenta del pago al especialista. Los estudiantes pagan exactamente el precio acordado sin cargos adicionales. Esta comisión nos permite mantener la plataforma segura, verificar especialistas y mediar disputas.'
    }
  ]

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
        Preguntas Frecuentes
      </h2>
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="mb-4 bg-black/50 backdrop-blur border border-red-500/30 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-red-500/10 transition-colors"
            >
              <span className="text-white font-semibold pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-red-400 flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-6">
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

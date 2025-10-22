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
      question: '¿Cómo funciona el pago y qué tan seguro es?',
      answer: 'Usamos un sistema de "Escrow" (Depósito en Garantía), que es 100% seguro para ti. Cuando aceptas la oferta de un especialista, tú le pagas a Red Arcana, no directamente al especialista. Nosotros guardamos tu dinero de forma segura. El especialista solo recibe el pago después de que haya entregado el trabajo y tú hayas confirmado tu total satisfacción. Tu dinero está protegido en cada paso del proceso.'
    },
    {
      question: '¿Mi identidad como estudiante se mantiene anónima?',
      answer: 'Absolutamente. Tu privacidad es nuestra máxima prioridad. En la plataforma, solo te identificarás con un alias (un apodo) que tú elijas. Tu nombre real y tu correo solo los conocemos nosotros para verificar tu cuenta. El especialista con el que trabajes nunca verá tu información personal.'
    },
    {
      question: '¿Quiénes son los especialistas y cómo garantizan la calidad?',
      answer: 'Nuestra red es exclusiva. Cada especialista pasa por un riguroso proceso de verificación manual donde un administrador revisa su identidad, sus credenciales académicas (como su CV, historial académico o título) y su área de especialización. Solo los perfiles más calificados y confiables son aprobados para unirse.'
    },
    {
      question: '¿Qué pasa si no estoy satisfecho con el trabajo entregado?',
      answer: 'Tienes una garantía. Si el trabajo entregado no cumple con lo que acordaste en el "Contrato", puedes iniciar una disputa (tienes hasta 7 días después de la entrega). Un administrador de Red Arcana intervendrá, revisará toda la evidencia (incluyendo el chat y los archivos) y mediará para darte una solución justa, que puede incluir correcciones gratuitas, un reembolso parcial o un reembolso total.'
    },
    {
      question: '¿Qué tipo de servicios puedo solicitar?',
      answer: 'Ofrecemos dos tipos de servicios principales. Puedes solicitar la "Realización del Trabajo Completo" si no tienes tiempo, o puedes pedir una "Revisión y Corrección". Este segundo servicio es perfecto si ya hiciste tu trabajo pero quieres que un experto lo revise, corrija errores, mejore la redacción y te dé sugerencias para asegurar la mejor nota posible.'
    },
    {
      question: 'Soy muy bueno en mi área, ¿cómo puedo unirme como especialista?',
      answer: '¡Nos encanta esa iniciativa! Creemos en el ciclo del conocimiento. Si eres un estudiante destacado o un egresado con un dominio comprobable de tus materias, puedes postular. Simplemente haz clic en el botón "Aplicar como Especialista" en la página principal, completa el formulario y nuestro equipo revisará tu perfil. ¡Es la mejor forma de rentabilizar tu capital intelectual!'
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

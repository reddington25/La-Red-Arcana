import Link from 'next/link'
import { GlitchText } from '@/components/glitch-text/GlitchText'

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Glitch Title */}
      <GlitchText>Red Arcana</GlitchText>
      
      {/* Persuasive Slogan */}
      <p className="mt-8 text-xl md:text-2xl text-center max-w-4xl text-gray-300 leading-relaxed">
        El sistema de educación tradicional ha fallado. Somos la alternativa.
        <br />
        <span className="text-red-400 font-semibold">
          La red de inteligencia académica a tu alcance.
        </span>
        <br />
        Optimiza tu tiempo, asegura tus resultados.
      </p>
      
      {/* CTA Buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth/login"
          className="px-8 py-4 text-lg font-semibold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-lg text-center"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/auth/register?role=student"
          className="px-8 py-4 text-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg text-center"
        >
          Registrarse como Estudiante
        </Link>
        <Link
          href="/auth/register?role=specialist"
          className="px-8 py-4 text-lg font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors rounded-lg text-center border-2 border-gray-700"
        >
          Aplicar como Especialista
        </Link>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'

export default function RoleSelection() {
  return (
    <div className="w-full max-w-4xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-orbitron mb-4">
          Únete a Red Arcana
        </h1>
        <p className="text-gray-400 text-lg">
          Selecciona tu rol para comenzar
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Card */}
        <Link
          href="/auth/register/student"
          className="group bg-black/50 backdrop-blur border border-red-500/30 hover:border-red-500 rounded-lg p-8 transition-all hover:scale-105"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-500/30 transition-colors">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Estudiante</h2>
            <p className="text-gray-400 mb-6">
              Publica tus trabajos académicos y recibe contraofertas de especialistas verificados
            </p>
            <ul className="text-left text-sm text-gray-300 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>Perfil anónimo con alias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>Sistema de escrow seguro</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>Elige el mejor precio y especialista</span>
              </li>
            </ul>
            <div className="mt-auto pt-4 border-t border-gray-700 w-full">
              <span className="text-red-400 font-semibold group-hover:text-red-300">
                Registrarse como Estudiante →
              </span>
            </div>
          </div>
        </Link>

        {/* Specialist Card */}
        <Link
          href="/auth/register/specialist"
          className="group bg-black/50 backdrop-blur border border-gray-700 hover:border-red-500 rounded-lg p-8 transition-all hover:scale-105"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-500/30 transition-colors">
              <svg
                className="w-10 h-10 text-gray-400 group-hover:text-red-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Especialista</h2>
            <p className="text-gray-400 mb-6">
              Monetiza tu conocimiento ayudando a estudiantes con trabajos académicos
            </p>
            <ul className="text-left text-sm text-gray-300 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>Proceso de verificación riguroso</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>Propón tus propios precios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✓</span>
                <span>Gana insignia "Garantía Arcana"</span>
              </li>
            </ul>
            <div className="mt-auto pt-4 border-t border-gray-700 w-full">
              <span className="text-gray-400 font-semibold group-hover:text-red-300">
                Aplicar como Especialista →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}

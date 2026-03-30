'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ShieldCheck, GraduationCap, Zap } from 'lucide-react'

export function LoginPopup() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Check if we've already shown the popup in this session
    const hasShownPopup = sessionStorage.getItem('loginPopupShown')
    
    if (!hasShownPopup) {
      // 5 minutes timer (300000 ms)
      const timer = setTimeout(() => {
        setIsVisible(true)
        sessionStorage.setItem('loginPopupShown', 'true')
      }, 300000)
      
      return () => clearTimeout(timer)
    }
  }, [])
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden bg-black/80 border border-red-500/50 rounded-2xl shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(to right, #440000 1px, transparent 1px), linear-gradient(to bottom, #440000 1px, transparent 1px)',
            backgroundSize: '24px 24px'
        }}></div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 z-20 p-1 text-gray-400 hover:text-white bg-black/50 hover:bg-red-500/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-orbitron font-bold text-white mb-3">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Únete a miles de universitarios que ya están mejorando su desarrollo académico con La Red Arcana.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-red-500/20 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-200">100% Seguro</h4>
                <p className="text-xs text-gray-500">Transacciones protegidas mediante sistema Escrow.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-blue-500/20 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-200">Red Académica Activa</h4>
                <p className="text-xs text-gray-500">Conecta con especialistas verificados de diversas facultades.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-green-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-200">Resultados Rápidos</h4>
                <p className="text-xs text-gray-500">Acelera tus proyectos y obtén asesorías en tiempo récord.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              href="/auth/register/student"
              onClick={() => setIsVisible(false)}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-center transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]"
            >
              Crear Cuenta Gratuita
            </Link>
            <Link 
              href="/auth/login"
              onClick={() => setIsVisible(false)}
              className="w-full py-3 px-4 bg-transparent border border-gray-600 hover:border-gray-400 hover:bg-white/5 text-gray-300 font-semibold rounded-lg text-center transition-colors"
            >
              Ya tengo una cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

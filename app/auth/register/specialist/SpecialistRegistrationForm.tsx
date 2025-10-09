'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { completeSpecialistProfile } from './actions'

interface SpecialistRegistrationFormProps {
  user: User
}

// Common subject tags for specialists
const SUBJECT_TAGS = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Programación',
  'Ingeniería de Software',
  'Bases de Datos',
  'Redes',
  'Estadística',
  'Cálculo',
  'Álgebra',
  'Economía',
  'Contabilidad',
  'Administración',
  'Derecho',
  'Historia',
  'Filosofía',
  'Literatura',
  'Inglés',
  'Arquitectura',
  'Diseño Gráfico',
  'Marketing',
  'Psicología',
  'Medicina',
  'Enfermería'
]

export default function SpecialistRegistrationForm({ user }: SpecialistRegistrationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [ciFile, setCiFile] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate at least one tag selected
    if (selectedTags.length === 0) {
      setError('Debes seleccionar al menos una materia de especialización')
      setIsLoading(false)
      return
    }

    // Validate CI file
    if (!ciFile) {
      setError('Debes subir una foto de tu CI')
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.append('ci_file', ciFile)
    if (cvFile) {
      formData.append('cv_file', cvFile)
    }
    formData.append('subject_tags', JSON.stringify(selectedTags))

    try {
      const result = await completeSpecialistProfile(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        // Redirect to pending verification page
        router.push('/auth/pending')
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white font-orbitron mb-2">
          Aplicación de Especialista
        </h1>
        <p className="text-gray-400">
          Completa tu perfil para ser parte de nuestra red de élite
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Proceso de verificación:</strong> Tu solicitud será revisada manualmente por nuestro equipo. 
            Te contactaremos por WhatsApp para verificar tu identidad y credenciales académicas.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Real Name */}
          <div>
            <label htmlFor="real_name" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Completo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="real_name"
              name="real_name"
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Número de WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              pattern="^[0-9]{8,15}$"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="ej: 59176543210"
            />
            <p className="mt-1 text-xs text-gray-500">
              Incluye código de país sin el símbolo +
            </p>
          </div>

          {/* CI Photo Upload */}
          <div>
            <label htmlFor="ci_file" className="block text-sm font-medium text-gray-300 mb-2">
              Foto de CI (Cédula de Identidad) <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              id="ci_file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => setCiFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              Formatos aceptados: JPG, PNG, PDF (máx. 10MB)
            </p>
          </div>

          {/* CV Upload (Optional) */}
          <div>
            <label htmlFor="cv_file" className="block text-sm font-medium text-gray-300 mb-2">
              CV o Certificados Académicos (Opcional)
            </label>
            <input
              type="file"
              id="cv_file"
              accept="application/pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white file:cursor-pointer hover:file:bg-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500">
              Formatos aceptados: PDF, DOC, DOCX (máx. 10MB)
            </p>
          </div>

          {/* University */}
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-300 mb-2">
              Universidad <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="university"
              name="university"
              required
              maxLength={100}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="ej: Universidad Mayor de San Andrés"
            />
          </div>

          {/* Career */}
          <div>
            <label htmlFor="career" className="block text-sm font-medium text-gray-300 mb-2">
              Carrera <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="career"
              name="career"
              required
              maxLength={100}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="ej: Ingeniería de Sistemas"
            />
          </div>

          {/* Academic Status */}
          <div>
            <label htmlFor="academic_status" className="block text-sm font-medium text-gray-300 mb-2">
              Estado Académico <span className="text-red-400">*</span>
            </label>
            <select
              id="academic_status"
              name="academic_status"
              required
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">Selecciona tu estado</option>
              <option value="1er Semestre">1er Semestre</option>
              <option value="2do Semestre">2do Semestre</option>
              <option value="3er Semestre">3er Semestre</option>
              <option value="4to Semestre">4to Semestre</option>
              <option value="5to Semestre">5to Semestre</option>
              <option value="6to Semestre">6to Semestre</option>
              <option value="7mo Semestre">7mo Semestre</option>
              <option value="8vo Semestre">8vo Semestre</option>
              <option value="9no Semestre">9no Semestre</option>
              <option value="10mo Semestre">10mo Semestre</option>
              <option value="Egresado">Egresado</option>
            </select>
          </div>

          {/* Subject Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Materias de Especialización <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-4 bg-gray-900 border border-gray-700 rounded-lg">
              {SUBJECT_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Seleccionadas: {selectedTags.length} {selectedTags.length > 0 && `(${selectedTags.join(', ')})`}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando Aplicación...
              </span>
            ) : (
              'Enviar Aplicación'
            )}
          </button>
        </form>

        {/* Info Text */}
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            Al enviar tu aplicación, aceptas que nuestro equipo revise tus documentos y credenciales académicas. 
            Te contactaremos por WhatsApp para una breve entrevista de verificación. El proceso puede tomar de 24 a 72 horas.
          </p>
        </div>
      </div>
    </div>
  )
}

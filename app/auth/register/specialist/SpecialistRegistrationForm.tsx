'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { completeSpecialistProfile } from './actions'
import { DEPARTMENTS, FACULTIES, getCareersByFaculty, type Department, type Faculty } from '@/lib/constants/academic-hierarchy'

interface SpecialistRegistrationFormProps {
  user: User
}

export default function SpecialistRegistrationForm({ user }: SpecialistRegistrationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ciFile, setCiFile] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)

  // Academic hierarchy state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | ''>('')
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | ''>('')
  const [selectedCareer, setSelectedCareer] = useState<string>('')

  // Get available careers based on selected faculty
  const availableCareers = selectedFaculty ? getCareersByFaculty(selectedFaculty) : []

  // Reset dependent fields when parent changes
  const handleDepartmentChange = (dept: Department | '') => {
    setSelectedDepartment(dept)
    setSelectedFaculty('')
    setSelectedCareer('')
  }

  const handleFacultyChange = (fac: Faculty | '') => {
    setSelectedFaculty(fac)
    setSelectedCareer('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate academic hierarchy fields
    if (!selectedDepartment) {
      setError('Debes seleccionar un departamento')
      setIsLoading(false)
      return
    }

    if (!selectedFaculty) {
      setError('Debes seleccionar una facultad')
      setIsLoading(false)
      return
    }

    if (!selectedCareer) {
      setError('Debes seleccionar una carrera')
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
    formData.append('department', selectedDepartment)
    formData.append('faculty', selectedFaculty)
    formData.append('career', selectedCareer)

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
            <div className="flex gap-2">
              <div className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                +591
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                pattern="^[67][0-9]{7}$"
                maxLength={8}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                placeholder="76543210"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Ingresa tu número de celular (8 dígitos). Usado para verificación.
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

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
              Departamento <span className="text-red-400">*</span>
            </label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value as Department | '')}
              required
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">Selecciona tu departamento</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Faculty */}
          <div>
            <label htmlFor="faculty" className="block text-sm font-medium text-gray-300 mb-2">
              Facultad <span className="text-red-400">*</span>
            </label>
            <select
              id="faculty"
              value={selectedFaculty}
              onChange={(e) => handleFacultyChange(e.target.value as Faculty | '')}
              required
              disabled={!selectedDepartment}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona tu facultad</option>
              {FACULTIES.map(fac => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </select>
            {!selectedDepartment && (
              <p className="mt-1 text-xs text-gray-500">Primero selecciona un departamento</p>
            )}
          </div>

          {/* Career */}
          <div>
            <label htmlFor="career" className="block text-sm font-medium text-gray-300 mb-2">
              Carrera <span className="text-red-400">*</span>
            </label>
            <select
              id="career"
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              required
              disabled={!selectedFaculty}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona tu carrera</option>
              {availableCareers.map(career => (
                <option key={career} value={career}>{career}</option>
              ))}
            </select>
            {!selectedFaculty && (
              <p className="mt-1 text-xs text-gray-500">Primero selecciona una facultad</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 mt-6">
            <div className="flex items-center h-5 mt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="terms" className="font-medium text-gray-300">
                Acepto los Términos y Condiciones
              </label>
              <p className="text-gray-500">
                Al marcar esta casilla, aceptas los términos y condiciones de uso de la plataforma Red Arcana.
              </p>
            </div>
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

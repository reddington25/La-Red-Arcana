'use client'

import { useState } from 'react'
import { Phone, GraduationCap, FileText, Tag, AlertCircle, CheckCircle, Upload } from 'lucide-react'
import { updateSpecialistProfile } from './actions'

interface SpecialistProfileEditFormProps {
  userId: string
  currentPhone: string
  currentCvUrl: string | null
  currentAcademicStatus: string
  currentSubjectTags: string[]
  pendingPhone: string | null
  pendingVerification: boolean
}

const AVAILABLE_TAGS = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Programación',
  'Bases de Datos',
  'Redes',
  'Inteligencia Artificial',
  'Estadística',
  'Cálculo',
  'Álgebra',
  'Economía',
  'Contabilidad',
  'Derecho',
  'Historia',
  'Filosofía',
  'Literatura',
  'Inglés',
  'Arquitectura',
  'Ingeniería Civil',
  'Ingeniería Industrial',
  'Medicina',
  'Enfermería',
  'Psicología',
  'Administración',
  'Marketing'
]

const ACADEMIC_STATUS_OPTIONS = [
  '1er Semestre',
  '2do Semestre',
  '3er Semestre',
  '4to Semestre',
  '5to Semestre',
  '6to Semestre',
  '7mo Semestre',
  '8vo Semestre',
  '9no Semestre',
  '10mo Semestre',
  'Egresado',
  'Titulado'
]

export function SpecialistProfileEditForm({
  userId,
  currentPhone,
  currentCvUrl,
  currentAcademicStatus,
  currentSubjectTags,
  pendingPhone,
  pendingVerification
}: SpecialistProfileEditFormProps) {
  const [phone, setPhone] = useState(currentPhone)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [academicStatus, setAcademicStatus] = useState(currentAcademicStatus)
  const [subjectTags, setSubjectTags] = useState<string[]>(currentSubjectTags)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  function toggleTag(tag: string) {
    if (subjectTags.includes(tag)) {
      setSubjectTags(subjectTags.filter(t => t !== tag))
    } else {
      setSubjectTags([...subjectTags, tag])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('phone', phone)
    formData.append('academicStatus', academicStatus)
    formData.append('subjectTags', JSON.stringify(subjectTags))
    
    if (cvFile) {
      formData.append('cvFile', cvFile)
    }

    const result = await updateSpecialistProfile(formData)

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Perfil actualizado exitosamente' })
      setCvFile(null) // Reset file input
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al actualizar el perfil' })
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pending Verification Alert */}
      {pendingVerification && pendingPhone && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Cambio Pendiente de Verificación</h3>
              <p className="text-sm text-yellow-300">
                Tu nuevo número de WhatsApp <strong>{pendingPhone}</strong> está pendiente de verificación por el equipo administrativo.
                Una vez aprobado, reemplazará tu número actual.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-400" />
            Número de WhatsApp
          </div>
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
          placeholder="+591 12345678"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Los cambios en el número de WhatsApp requieren verificación administrativa.
        </p>
      </div>

      {/* CV Upload */}
      <div>
        <label htmlFor="cv" className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" />
            Curriculum Vitae (Opcional)
          </div>
        </label>
        
        {currentCvUrl && !cvFile && (
          <div className="mb-2">
            <a
              href={currentCvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline text-sm"
            >
              Ver CV actual
            </a>
          </div>
        )}
        
        <div className="relative">
          <input
            type="file"
            id="cv"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="cv"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-gray-300 hover:border-red-500 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            {cvFile ? cvFile.name : 'Subir nuevo CV (PDF, DOC, DOCX)'}
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Puedes actualizar tu CV en cualquier momento. Máximo 5MB.
        </p>
      </div>

      {/* Academic Status */}
      <div>
        <label htmlFor="academicStatus" className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-red-400" />
            Estado Académico
          </div>
        </label>
        <select
          id="academicStatus"
          value={academicStatus}
          onChange={(e) => setAcademicStatus(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
          required
        >
          <option value="">Selecciona tu estado académico</option>
          {ACADEMIC_STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Mantén actualizado tu estado académico para reflejar tu nivel actual.
        </p>
      </div>

      {/* Subject Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-400" />
            Especializaciones (Selecciona al menos una)
          </div>
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                subjectTags.includes(tag)
                  ? 'bg-red-500/30 border-red-500 text-red-400'
                  : 'bg-black/50 border-red-500/30 text-gray-400 hover:border-red-500/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Selecciona las materias en las que te especializas. Recibirás notificaciones de contratos relacionados.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50' 
            : 'bg-red-500/20 border border-red-500/50'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || subjectTags.length === 0}
        className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </button>
      
      {subjectTags.length === 0 && (
        <p className="text-sm text-yellow-400 text-center">
          Debes seleccionar al menos una especialización
        </p>
      )}
    </form>
  )
}

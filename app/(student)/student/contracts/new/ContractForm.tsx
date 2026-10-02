'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText, AlertCircle, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validateFileType, formatFileSize } from '@/lib/supabase/storage'
import { validateFileUpload, showErrorToast, showSuccessToast } from '@/lib/utils/error-handler'
import { LoadingButton } from '@/components/ui/loading-spinner'
import { DEPARTMENTS, FACULTIES, getCareersByFaculty, type Department, type Faculty } from '@/lib/constants/academic-hierarchy'

function getMinDeadline(): string {
  // Al menos 12 horas + 5 minutos para evitar condiciones de carrera entre cliente y servidor
  const d = new Date(Date.now() + (12 * 60 + 5) * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getPresetDeadline(hours: number): string {
  // Añadir 30 minutos de margen al preset de 12 horas para que el usuario tenga tiempo
  // suficiente de redactar y enviar sin caer por debajo del umbral mínimo de 12h si permanece inactivo
  const extraMinutes = hours === 12 ? 30 : 0
  const d = new Date(Date.now() + (hours * 60 + extraMinutes) * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isDeadlineValid(deadlineStr: string): boolean {
  if (!deadlineStr) return false
  const d = new Date(deadlineStr)
  if (isNaN(d.getTime())) return false
  // Margen de tolerancia de 10 minutos (alineado con la tolerancia del servidor)
  const minTime = Date.now() + (12 * 60 - 10) * 60 * 1000
  return d.getTime() >= minTime
}

function formatDeadlineInSpanish(deadlineStr: string): string {
  try {
    const d = new Date(deadlineStr)
    if (isNaN(d.getTime())) return deadlineStr
    const formattedDate = d.toLocaleString('es-BO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const diffHours = Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60))
    const relativeTime = diffHours >= 24
      ? `(~${Math.round(diffHours / 24)} días)`
      : `(~${diffHours} horas)`
    return `${formattedDate} ${relativeTime}`
  } catch {
    return deadlineStr
  }
}

export default function ContractForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState<'full' | 'review'>('full')
  const [initialPrice, setInitialPrice] = useState('')
  const [deadline, setDeadline] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [draftLoaded, setDraftLoaded] = useState(false)

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

  // Recuperar draft si existe
  useEffect(() => {
    const draft = localStorage.getItem('draft_contract')
    if (draft) {
      try {
        const data = JSON.parse(draft)
        if (data.title) setTitle(data.title)
        if (data.description) setDescription(data.description)
        if (data.serviceType) setServiceType(data.serviceType)
        if (data.initialPrice) setInitialPrice(data.initialPrice)
        if (data.deadline) setDeadline(data.deadline)
        if (data.department) setSelectedDepartment(data.department)
        if (data.faculty) setSelectedFaculty(data.faculty)
        if (data.career) setSelectedCareer(data.career)

        // Mostrar mensaje
        showSuccessToast('Se recuperó tu borrador anterior')
      } catch (error) {
        console.error('[FORM] Error loading draft:', error)
      }
    }
    setDraftLoaded(true)
  }, [])

  // Auto-guardar borrador sin interferir con la sesión
  useEffect(() => {
    if (!draftLoaded) return
    if (title || description || initialPrice || deadline || selectedDepartment || selectedFaculty || selectedCareer) {
      localStorage.setItem('draft_contract', JSON.stringify({
        title,
        description,
        serviceType,
        initialPrice,
        deadline,
        department: selectedDepartment,
        faculty: selectedFaculty,
        career: selectedCareer,
      }))
    }
  }, [title, description, serviceType, initialPrice, deadline, selectedDepartment, selectedFaculty, selectedCareer, draftLoaded])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const newFiles = Array.from(e.target.files)
    const validFiles: File[] = []
    const errors: string[] = []

    newFiles.forEach(file => {
      const validation = validateFileUpload(file, {
        maxSizeMB: 10,
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
      })

      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      setError(errors.join(', '))
      showErrorToast(errors[0])
    } else {
      setError(null)
    }

    setFiles(prev => [...prev, ...validFiles])
    if (e.target) {
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validar plazo mínimo de 12 horas en cliente
      if (!deadline || !isDeadlineValid(deadline)) {
        const errorMsg = 'La fecha y hora límite debe ser de al menos 12 horas en el futuro.'
        setError(errorMsg)
        showErrorToast(errorMsg)
        setLoading(false)
        return
      }

      // Obtener sesión sin refresh destructivo del cliente
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // Crear FormData para API request
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('department', selectedDepartment)
      formData.append('faculty', selectedFaculty)
      formData.append('career', selectedCareer)
      formData.append('serviceType', serviceType)
      formData.append('initialPrice', initialPrice)
      formData.append('deadline', new Date(deadline).toISOString())
      formData.append('termsAccepted', acceptTerms ? 'true' : 'false')
      formData.append('termsAcceptedAt', new Date().toISOString())

      // Add files
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      console.log('[FORM] Sending request to API...')

      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      // Send to API route con Authorization header si está presente y cookies SSR incluidas
      const response = await fetch('/api/contracts', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important: include cookies
        headers,
      })

      console.log('[FORM] Response status:', response.status)

      // Manejar expiración real de sesión dictada por el servidor
      if (response.status === 401) {
        const errorMsg = 'Tu sesión ha expirado. Redirigiendo al login...'
        setError(errorMsg)
        showErrorToast(errorMsg)
        setLoading(false)

        // Guardar el estado del formulario en localStorage
        localStorage.setItem('draft_contract', JSON.stringify({
          title,
          description,
          serviceType,
          initialPrice,
          deadline,
          department: selectedDepartment,
          faculty: selectedFaculty,
          career: selectedCareer,
        }))

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/auth/login?redirectTo=/student/contracts/new'
        }, 2000)
        return
      }

      const result = await response.json()

      if (!response.ok || result.error) {
        console.error('[FORM] Error from API:', result.error)
        setError(result.error || 'Error al crear el contrato')
        showErrorToast(result.error || 'Error al crear el contrato')
        setLoading(false)
      } else {
        console.log('[FORM] Contract created successfully:', result.contractId)
        showSuccessToast('Contrato creado exitosamente. Los especialistas serán notificados.')

        // Limpiar draft tras publicación exitosa
        localStorage.removeItem('draft_contract')

        // Redirect to contract page
        router.push(`/student/contracts/${result.contractId}`)
      }
    } catch (err) {
      console.error('[FORM] Unexpected error:', err)
      const errorMessage = 'Error al crear el contrato. Por favor, intenta de nuevo.'
      setError(errorMessage)
      showErrorToast(errorMessage)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          Título del Contrato *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Proyecto de Programación en Python"
          className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          required
          minLength={5}
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/200 caracteres</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Descripción Detallada *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe en detalle lo que necesitas. Incluye requisitos, formato esperado, fecha límite, etc."
          rows={8}
          className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
          required
          minLength={20}
          maxLength={5000}
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/5000 caracteres</p>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Archivos Adjuntos (Opcional)
        </label>
        <div className="border-2 border-dashed border-red-500/30 rounded-lg p-6 text-center hover:border-red-500/50 transition-colors">
          <input
            type="file"
            id="files"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="files" className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Haz clic para subir archivos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOCX, JPG, PNG (máx 10MB cada uno)
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-black/50 border border-red-500/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm text-white">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Academic Hierarchy Fields */}
      <div className="space-y-4">
        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
            Departamento *
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value as Department | '')}
            required
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
          >
            <option value="">Selecciona el departamento</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Departamento donde necesitas el servicio</p>
        </div>

        {/* Faculty */}
        <div>
          <label htmlFor="faculty" className="block text-sm font-medium text-gray-300 mb-2">
            Facultad *
          </label>
          <select
            id="faculty"
            value={selectedFaculty}
            onChange={(e) => handleFacultyChange(e.target.value as Faculty | '')}
            required
            disabled={!selectedDepartment}
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Selecciona la facultad</option>
            {FACULTIES.map(fac => (
              <option key={fac} value={fac}>{fac}</option>
            ))}
          </select>
          {!selectedDepartment && (
            <p className="text-xs text-gray-500 mt-1">Primero selecciona un departamento</p>
          )}
        </div>

        {/* Career */}
        <div>
          <label htmlFor="career" className="block text-sm font-medium text-gray-300 mb-2">
            Carrera *
          </label>
          <select
            id="career"
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            required
            disabled={!selectedFaculty}
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Selecciona la carrera</option>
            {availableCareers.map(career => (
              <option key={career} value={career}>{career}</option>
            ))}
          </select>
          {!selectedFaculty && (
            <p className="text-xs text-gray-500 mt-1">Primero selecciona una facultad</p>
          )}
          {selectedCareer && (
            <p className="text-xs text-gray-500 mt-1">
              Los especialistas de {selectedCareer} en {selectedDepartment} serán notificados
            </p>
          )}
        </div>
      </div>

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tipo de Servicio *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setServiceType('full')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${serviceType === 'full'
                ? 'border-red-500 bg-red-500/10'
                : 'border-red-500/30 bg-black/50 hover:border-red-500/50'
              }`}
          >
            <h3 className="font-semibold text-white mb-1">Desarrollo del Proyecto</h3>
            <p className="text-sm text-gray-400">
              El especialista realizará todo el proyecto desde cero
            </p>
          </button>

          <button
            type="button"
            onClick={() => setServiceType('review')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${serviceType === 'review'
                ? 'border-red-500 bg-red-500/10'
                : 'border-red-500/30 bg-black/50 hover:border-red-500/50'
              }`}
          >
            <h3 className="font-semibold text-white mb-1">Revisión y Corrección</h3>
            <p className="text-sm text-gray-400">
              El especialista revisará, corregirá y optimizará tu proyecto existente.
            </p>
          </button>
        </div>
      </div>

      {/* Initial Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
          Precio Inicial (Bs) *
        </label>
        <input
          type="number"
          id="price"
          value={initialPrice}
          onChange={(e) => setInitialPrice(e.target.value)}
          placeholder="Ej: 150"
          min={10}
          max={10000}
          step={1}
          className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Los especialistas podrán hacer contraofertas con precios diferentes
        </p>
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
          Fecha y Hora Límite de Entrega *
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={getMinDeadline()}
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 cursor-pointer"
            required
            onClick={(e) => {
              try {
                if ('showPicker' in HTMLInputElement.prototype) {
                  e.currentTarget.showPicker();
                }
              } catch (err) {
                // Ignore if showPicker is not supported or fails
              }
            }}
          />
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Plazo máximo de entrega del trabajo (mínimo 12 horas a partir de ahora)
        </p>

        {/* Botones de sugerencias rápidas */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">Atajos rápidos:</span>
          <button
            type="button"
            onClick={() => setDeadline(getPresetDeadline(12))}
            className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-red-500/20 hover:border-red-500/50 text-gray-300 hover:text-white transition-colors"
          >
            +12 horas (urgente)
          </button>
          <button
            type="button"
            onClick={() => setDeadline(getPresetDeadline(24))}
            className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-red-500/20 hover:border-red-500/50 text-gray-300 hover:text-white transition-colors"
          >
            +24 horas (1 día)
          </button>
          <button
            type="button"
            onClick={() => setDeadline(getPresetDeadline(72))}
            className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-red-500/20 hover:border-red-500/50 text-gray-300 hover:text-white transition-colors"
          >
            +3 días
          </button>
          <button
            type="button"
            onClick={() => setDeadline(getPresetDeadline(168))}
            className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-red-500/20 hover:border-red-500/50 text-gray-300 hover:text-white transition-colors"
          >
            +1 semana
          </button>
        </div>

        {/* Ayuda contextual en español con validación y recuperación de plazo */}
        {deadline && (
          <div
            className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
              isDeadlineValid(deadline)
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                {isDeadlineValid(deadline)
                  ? `Plazo seleccionado: ${formatDeadlineInSpanish(deadline)}`
                  : 'La fecha y hora límite debe ser de al menos 12 horas en el futuro.'}
              </span>
            </div>
            {!isDeadlineValid(deadline) && (
              <button
                type="button"
                onClick={() => setDeadline(getPresetDeadline(12))}
                className="px-2 py-0.5 text-xs rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 transition-colors font-medium cursor-pointer whitespace-nowrap"
              >
                Actualizar a +12 horas
              </button>
            )}
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-red-500/30 bg-black/50 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
            required
          />
          <span className="text-sm text-gray-300">
            Acepto los términos y condiciones DEL CONTRATO *
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 bg-black/50 border border-red-500/30 text-white rounded-lg hover:border-red-500/50 transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !selectedDepartment || !selectedFaculty || !selectedCareer || !deadline || !isDeadlineValid(deadline) || !acceptTerms}
          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? <LoadingButton>Creando...</LoadingButton> : 'Publicar Contrato'}
        </button>
      </div>
    </form>
  )
}

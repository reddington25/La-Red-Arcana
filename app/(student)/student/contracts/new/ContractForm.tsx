'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { createContract } from './actions'
import { createClient } from '@/lib/supabase/client'
import { validateFileType, formatFileSize } from '@/lib/supabase/storage'
import { validateFileUpload, showErrorToast, showSuccessToast } from '@/lib/utils/error-handler'
import { LoadingButton } from '@/components/ui/loading-spinner'

const SUBJECT_TAGS = [
  'Matemáticas',
  'Física',
  'Química',
  'Programación',
  'Bases de Datos',
  'Redes',
  'Sistemas Operativos',
  'Ingeniería de Software',
  'Cálculo',
  'Álgebra',
  'Estadística',
  'Economía',
  'Contabilidad',
  'Derecho',
  'Filosofía',
  'Historia',
  'Literatura',
  'Inglés',
  'Biología',
  'Arquitectura',
]

export default function ContractForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [serviceType, setServiceType] = useState<'full' | 'review'>('full')
  const [initialPrice, setInitialPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])

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
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Verify session before submitting
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('[FORM] Session check:', { hasSession: !!session, error: sessionError })
      
      if (sessionError || !session) {
        const errorMsg = 'Sesión expirada. Por favor, inicia sesión de nuevo.'
        setError(errorMsg)
        showErrorToast(errorMsg)
        setLoading(false)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/auth/login?redirectTo=/student/contracts/new'
        }, 2000)
        return
      }

      const result = await createContract(
        {
          title,
          description,
          tags: selectedTags,
          serviceType,
          initialPrice: parseFloat(initialPrice),
        },
        files
      )

      if (result?.error) {
        setError(result.error)
        showErrorToast(result.error)
        setLoading(false)
      } else {
        showSuccessToast('Contrato creado exitosamente. Los especialistas serán notificados.')
      }
      // If successful, redirect happens in server action
    } catch (err) {
      const errorMessage = 'Error al crear el contrato'
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

      {/* Subject Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Etiquetas de Materia * (Selecciona al menos una)
        </label>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-red-500 text-white'
                  : 'bg-black/50 text-gray-400 border border-red-500/30 hover:border-red-500/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {selectedTags.length} etiqueta(s) seleccionada(s)
        </p>
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
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              serviceType === 'full'
                ? 'border-red-500 bg-red-500/10'
                : 'border-red-500/30 bg-black/50 hover:border-red-500/50'
            }`}
          >
            <h3 className="font-semibold text-white mb-1">Realización del Trabajo Completo</h3>
            <p className="text-sm text-gray-400">
              El especialista realizará todo el trabajo desde cero
            </p>
          </button>

          <button
            type="button"
            onClick={() => setServiceType('review')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              serviceType === 'review'
                ? 'border-red-500 bg-red-500/10'
                : 'border-red-500/30 bg-black/50 hover:border-red-500/50'
            }`}
          >
            <h3 className="font-semibold text-white mb-1">Revisión y Corrección</h3>
            <p className="text-sm text-gray-400">
              El especialista revisará y corregirá tu trabajo existente
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
          disabled={loading || selectedTags.length === 0}
          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? <LoadingButton>Creando...</LoadingButton> : 'Publicar Contrato'}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { FileText, Upload, Loader2, CheckCircle } from 'lucide-react'
import { uploadDeliveryFiles } from './actions'

interface WorkDeliveryProps {
  contractId: string
  contractStatus: string
  isStudent: boolean
}

export default function WorkDelivery({ 
  contractId, 
  contractStatus,
  isStudent 
}: WorkDeliveryProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  async function handleSubmitDelivery(e: React.FormEvent) {
    e.preventDefault()
    
    if (files.length === 0) {
      alert('Por favor selecciona al menos un archivo para entregar.')
      return
    }

    if (!confirm('¿Estás seguro de que deseas entregar estos archivos? El estudiante podrá revisarlos y marcar el contrato como completado.')) {
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('contractId', contractId)
    files.forEach((file) => {
      formData.append('files', file)
    })

    const result = await uploadDeliveryFiles(formData)

    if (result.error) {
      alert(result.error)
    } else {
      alert('Archivos entregados exitosamente. El estudiante será notificado.')
      setFiles([])
    }

    setUploading(false)
  }

  // For specialists: show upload form
  if (!isStudent) {
    return (
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Entrega del Trabajo
        </h2>

        {contractStatus === 'in_progress' && (
          <>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-blue-400 text-sm">
                Sube los archivos finales del trabajo completado. El estudiante podrá revisarlos y marcar el contrato como completado.
              </p>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Archivos de Entrega
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-500 file:text-white
                    hover:file:bg-red-600
                    file:cursor-pointer cursor-pointer"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceptados: PDF, DOC, DOCX, JPG, PNG, ZIP
                </p>
              </div>

              {files.length > 0 && (
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-2">
                    Archivos seleccionados ({files.length}):
                  </p>
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Subiendo archivos...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Entregar Trabajo
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {contractStatus === 'completed' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="w-5 h-5" />
              <p className="font-semibold">Contrato Completado</p>
            </div>
            <p className="text-sm text-gray-300">
              El estudiante ha marcado el contrato como completado. Tu pago ha sido acreditado a tu saldo.
            </p>
          </div>
        )}
      </div>
    )
  }

  // For students: this component is not used (they have their own)
  return null
}

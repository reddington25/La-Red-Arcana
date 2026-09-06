'use client'

import { useState } from 'react'
import { GraduationCap, FileText, Tag, AlertCircle, CheckCircle, Upload, Building2, CreditCard, User, QrCode } from 'lucide-react'
import { updateSpecialistProfile } from './actions'

interface SpecialistProfileEditFormProps {
  userId: string
  currentAlias: string
  currentCvUrl: string | null
  currentAcademicStatus: string
  currentSubjectTags: string[]
  pendingVerification: boolean
  userCreatedAt: string
  currentBankName?: string | null
  currentAccountNumber?: string | null
  currentAccountHolderName?: string | null
  currentAccountHolderCi?: string | null
  currentPaymentQrUrl?: string | null
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

const BOLIVIAN_BANKS = [
  'Banco Unión',
  'Banco Nacional de Bolivia (BNB)',
  'Banco de Crédito de Bolivia (BCP)',
  'Banco Mercantil Santa Cruz (BMSC)',
  'Banco FIE',
  'Banco BISA',
  'Banco Ganadero',
  'Banco Económico',
  'Banco Fortaleza',
  'Banco Sol',
  'Otro banco / Cooperativa'
]

export function SpecialistProfileEditForm({
  userId,
  currentAlias,
  currentCvUrl,
  currentAcademicStatus,
  currentSubjectTags,
  pendingVerification,
  userCreatedAt,
  currentBankName,
  currentAccountNumber,
  currentAccountHolderName,
  currentAccountHolderCi,
  currentPaymentQrUrl,
}: SpecialistProfileEditFormProps) {
  const [alias, setAlias] = useState(currentAlias)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [academicStatus, setAcademicStatus] = useState(currentAcademicStatus)
  const [subjectTags, setSubjectTags] = useState<string[]>(currentSubjectTags)

  // Bank Coordinates & QR states
  const [bankName, setBankName] = useState(currentBankName || '')
  const [accountNumber, setAccountNumber] = useState(currentAccountNumber || '')
  const [accountHolderName, setAccountHolderName] = useState(currentAccountHolderName || '')
  const [accountHolderCi, setAccountHolderCi] = useState(currentAccountHolderCi || '')
  const [qrFile, setQrFile] = useState<File | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Calculate max tags based on time (Initial 5 + 3 per every 3 months, max 20)
  const registrationDate = new Date(userCreatedAt)
  const now = new Date()
  const monthsDiff = (now.getFullYear() - registrationDate.getFullYear()) * 12 + (now.getMonth() - registrationDate.getMonth())
  const maxTags = Math.min(20, 5 + Math.floor(monthsDiff / 3) * 3)

  function toggleTag(tag: string) {
    if (subjectTags.includes(tag)) {
      setSubjectTags(subjectTags.filter(t => t !== tag))
    } else {
      if (subjectTags.length < maxTags) {
        setSubjectTags([...subjectTags, tag])
      } else {
        setMessage({ 
          type: 'error', 
          text: `Has alcanzado tu límite actual de ${maxTags} etiquetas. Desbloqueas 3 más cada 3 meses.` 
        })
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('alias', alias)
    formData.append('academicStatus', academicStatus)
    formData.append('subjectTags', JSON.stringify(subjectTags))
    
    if (cvFile) {
      formData.append('cvFile', cvFile)
    }

    // Append Bank coordinates
    formData.append('bankName', bankName)
    formData.append('accountNumber', accountNumber)
    formData.append('accountHolderName', accountHolderName)
    formData.append('accountHolderCi', accountHolderCi)
    if (qrFile) {
      formData.append('qrFile', qrFile)
    }

    const result = await updateSpecialistProfile(formData)

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Perfil actualizado exitosamente' })
      setCvFile(null) // Reset file input
      setQrFile(null) // Reset QR input
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al actualizar el perfil' })
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pending Verification Alert */}
      {pendingVerification && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Cambios Académicos en Revisión</h3>
              <p className="text-sm text-yellow-300">
                Tienes modificaciones académicas pendientes de aprobación. 
                Mientras tanto visualizarás tus datos anteriores.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* P2P Bank Coordinates Section */}
      <div className="p-5 bg-gradient-to-r from-emerald-950/30 to-black/60 border border-emerald-500/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Datos de Cobro Directo P2P</h3>
            <p className="text-xs text-gray-300">
              Configura tu cuenta bancaria y código QR Simple para recibir el <strong>85% del pago acordado directamente</strong> de los estudiantes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Bank Name */}
          <div>
            <label htmlFor="bankName" className="block text-xs font-medium text-gray-300 mb-1">
              Nombre de la Entidad Bancaria
            </label>
            <input
              type="text"
              id="bankName"
              list="bolivian-banks-list"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ej. Banco Unión, BNB, BCP"
              className="w-full px-3 py-2 bg-black/50 border border-emerald-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            <datalist id="bolivian-banks-list">
              {BOLIVIAN_BANKS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          {/* Account Number */}
          <div>
            <label htmlFor="accountNumber" className="block text-xs font-medium text-gray-300 mb-1">
              Número de Cuenta Bancaria
            </label>
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Ej. 10000012345678"
              className="w-full px-3 py-2 bg-black/50 border border-emerald-500/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label htmlFor="accountHolderName" className="block text-xs font-medium text-gray-300 mb-1">
              Nombre Completo del Titular
            </label>
            <input
              type="text"
              id="accountHolderName"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Nombre como figura en el banco"
              className="w-full px-3 py-2 bg-black/50 border border-emerald-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Account Holder CI */}
          <div>
            <label htmlFor="accountHolderCi" className="block text-xs font-medium text-gray-300 mb-1">
              C.I. / Documento de Identidad del Titular
            </label>
            <input
              type="text"
              id="accountHolderCi"
              value={accountHolderCi}
              onChange={(e) => setAccountHolderCi(e.target.value)}
              placeholder="Ej. 1234567 LP"
              className="w-full px-3 py-2 bg-black/50 border border-emerald-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* QR Code Upload */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            Código QR Simple de Cobro (Imagen)
          </label>

          {currentPaymentQrUrl && !qrFile && (
            <div className="mb-2 flex items-center gap-2">
              <a
                href={currentPaymentQrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
              >
                Ver código QR actual
              </a>
            </div>
          )}

          <div className="relative">
            <input
              type="file"
              id="qrFile"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setQrFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="qrFile"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-black/50 border border-emerald-500/30 rounded-lg text-gray-300 hover:border-emerald-500 cursor-pointer transition-colors text-xs font-medium"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              {qrFile ? qrFile.name : (currentPaymentQrUrl ? 'Subir nuevo QR Simple' : 'Subir imagen de QR Simple (PNG, JPG, WEBP)')}
            </label>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Los estudiantes podrán escanear este QR directamente para transferirte el dinero de tus trabajos.
          </p>
        </div>
      </div>

      {/* Alias Field */}
      <div>
        <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 text-red-400 flex items-center justify-center">@</span>
            Alias Público
          </div>
        </label>
        <input
          type="text"
          id="alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
          placeholder="Tu alias público"
          required
          minLength={3}
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-1">
          Este es el nombre que verán los clientes. Los cambios requieren verificación administrativa.
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
            <span className="ml-auto text-xs font-normal text-gray-400">
              {subjectTags.length} / {maxTags} etiquetas
            </span>
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

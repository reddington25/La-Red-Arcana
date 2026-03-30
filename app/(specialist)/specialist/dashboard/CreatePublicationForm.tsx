'use client'

import { useState } from 'react'
import { ImagePlus, X, Upload, Loader2 } from 'lucide-react'
import { createPublication } from './publication-actions'
import { uploadFile } from '@/lib/supabase/storage'

export default function CreatePublicationForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      setMessage({ type: 'error', text: 'Máximo 5 imágenes por publicación' })
      return
    }
    
    const newImages = [...images, ...files]
    setImages(newImages)
    
    // Create previews
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviewUrls([...previewUrls, ...newPreviews])
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previewUrls[index])
    setImages(images.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Upload images first
      const uploadedUrls: string[] = []
      for (const img of images) {
        const timestamp = Date.now()
        const path = `${timestamp}-${img.name}`
        const result = await uploadFile('specialist-publications', path, img)
        if (result.error) {
          setMessage({ type: 'error', text: `Error subiendo imagen: ${result.error}` })
          setIsSubmitting(false)
          return
        }
        uploadedUrls.push(result.url)
      }

      const formData = new FormData()
      formData.append('description', description)
      formData.append('imageUrls', JSON.stringify(uploadedUrls))

      const result = await createPublication(formData)

      if (result.success) {
        setMessage({ type: 'success', text: '¡Publicación creada exitosamente!' })
        setDescription('')
        setImages([])
        setPreviewUrls([])
        setTimeout(() => {
          setIsOpen(false)
          setMessage(null)
          window.location.reload()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al crear la publicación' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error inesperado' })
    }

    setIsSubmitting(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all font-semibold shadow-lg shadow-red-500/20"
      >
        <ImagePlus className="w-5 h-5" />
        Publicar Promoción
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-br from-black/80 to-red-950/20 backdrop-blur border border-red-500/40 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Nueva Publicación Promocional</h3>
        <button onClick={() => { setIsOpen(false); setMessage(null) }} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción de tu proyecto o servicio destacado
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none placeholder-gray-600"
            placeholder="Describe tu proyecto, servicio o logro destacado. Puedes incluir detalles técnicos, resultados, etc."
            required
            minLength={10}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imágenes (opcional, máximo 5)
          </label>
          
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-red-500/30">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {images.length < 5 && (
            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black/50 border border-dashed border-red-500/30 rounded-lg text-gray-400 hover:border-red-500 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Seleccionar imágenes
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || description.trim().length < 10}
          className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              Publicar
            </>
          )}
        </button>
      </form>
    </div>
  )
}

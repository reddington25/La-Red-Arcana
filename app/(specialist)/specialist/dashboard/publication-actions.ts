'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPublication(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verify user is a specialist
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'specialist') {
    return { error: 'Solo los especialistas pueden crear publicaciones' }
  }

  const description = formData.get('description') as string
  const imageUrlsJson = formData.get('imageUrls') as string

  if (!description || description.trim().length < 10) {
    return { error: 'La descripción debe tener al menos 10 caracteres' }
  }

  let imageUrls: string[] = []
  try {
    imageUrls = JSON.parse(imageUrlsJson || '[]')
  } catch {
    imageUrls = []
  }

  const { error } = await supabase
    .from('publications')
    .insert({
      specialist_id: user.id,
      description: description.trim(),
      image_urls: imageUrls.length > 0 ? imageUrls : null,
    })

  if (error) {
    console.error('Error creating publication:', error)
    return { error: 'Error al crear la publicación' }
  }

  revalidatePath('/specialist/dashboard')
  return { success: true }
}

export async function deletePublication(publicationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('publications')
    .delete()
    .eq('id', publicationId)
    .eq('specialist_id', user.id)

  if (error) {
    console.error('Error deleting publication:', error)
    return { error: 'Error al eliminar la publicación' }
  }

  revalidatePath('/specialist/dashboard')
  return { success: true }
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SpecialistProfileEditForm } from './SpecialistProfileEditForm'

export default async function SpecialistProfileEditPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single()
  
  if (!userData) {
    redirect('/auth/login')
  }
  
  // Get profile details
  const { data: profile } = await supabase
    .from('profile_details')
    .select('real_name, phone, cv_url, academic_status, subject_tags, pending_phone, pending_verification')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) {
    redirect('/specialist/profile')
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/specialist/profile"
          className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Perfil
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Editar Perfil</h1>
        <p className="text-gray-400">Actualiza tu información de especialista</p>
      </div>
      
      <div className="space-y-6">
        {/* Non-editable Information Notice */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">Información No Editable</h3>
          <p className="text-sm text-blue-300">
            Por razones de seguridad, no puedes editar: <strong>Email, Nombre Real, Foto de CI, Universidad, y Carrera</strong>.
            Si necesitas cambiar estos datos, contacta al equipo administrativo.
          </p>
        </div>
        
        {/* Edit Form */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <SpecialistProfileEditForm 
            userId={user.id}
            currentPhone={profile.phone}
            currentCvUrl={profile.cv_url}
            currentAcademicStatus={profile.academic_status || ''}
            currentSubjectTags={profile.subject_tags || []}
            pendingPhone={profile.pending_phone}
            pendingVerification={profile.pending_verification || false}
          />
        </div>
      </div>
    </div>
  )
}

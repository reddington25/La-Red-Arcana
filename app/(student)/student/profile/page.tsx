import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Phone } from 'lucide-react'
import { RatingSummary } from '@/components/reviews/RatingSummary'
import { ReviewsList } from '@/components/reviews/ReviewsList'
import { StudentProfileEditForm } from './StudentProfileEditForm'

export default async function StudentProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('email, average_rating, total_reviews')
    .eq('id', user.id)
    .single()
  
  if (!userData) {
    redirect('/auth/login')
  }
  
  // Get profile details
  const { data: profile } = await supabase
    .from('profile_details')
    .select('real_name, alias, phone, pending_phone, pending_verification')
    .eq('user_id', user.id)
    .single()
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-400">Información de tu cuenta de estudiante</p>
      </div>
      
      <div className="space-y-6">
        {/* Rating Summary */}
        {userData.total_reviews > 0 && (
          <RatingSummary 
            averageRating={userData.average_rating} 
            totalReviews={userData.total_reviews} 
          />
        )}
        
        {/* Personal Information - Read Only */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Información Personal (No Editable)</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">Nombre Real (Privado)</div>
                <div className="text-white">{profile?.real_name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">Email</div>
                <div className="text-white">{userData.email}</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Estos campos no pueden ser editados por razones de seguridad. 
            Si necesitas cambiarlos, contacta al equipo administrativo.
          </p>
        </div>
        
        {/* Editable Information */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Información Editable</h2>
          <StudentProfileEditForm 
            userId={user.id}
            currentAlias={profile?.alias || ''}
            currentPhone={profile?.phone || ''}
            pendingPhone={profile?.pending_phone || null}
            pendingVerification={profile?.pending_verification || false}
          />
        </div>
        
        {/* Reviews */}
        {userData.total_reviews > 0 && (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Reseñas de Especialistas</h2>
            <ReviewsList userId={user.id} />
          </div>
        )}
      </div>
    </div>
  )
}

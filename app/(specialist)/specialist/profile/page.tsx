import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Phone, GraduationCap, Award, Tag } from 'lucide-react'
import { RatingSummary } from '@/components/reviews/RatingSummary'
import { ReviewsList } from '@/components/reviews/ReviewsList'

export default async function SpecialistProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('email, has_arcana_badge, average_rating, total_reviews')
    .eq('id', user.id)
    .single()
  
  if (!userData) {
    redirect('/auth/login')
  }
  
  // Get profile details separately
  const { data: profile } = await supabase
    .from('profile_details')
    .select('real_name, phone, university, career, academic_status, subject_tags, cv_url')
    .eq('user_id', user.id)
    .single()
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-400">Información de tu cuenta de especialista</p>
      </div>
      
      <div className="space-y-6">
        {/* Badge and Rating */}
        {userData.has_arcana_badge && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 border border-yellow-500/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-yellow-400">Garantía Arcana</h2>
                <p className="text-gray-300 text-sm">
                  Eres parte de nuestra élite de especialistas verificados
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Rating Summary */}
        <RatingSummary 
          averageRating={userData.average_rating} 
          totalReviews={userData.total_reviews} 
        />
        
        {/* Personal Information */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Información Personal</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">Nombre</div>
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
            
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">WhatsApp</div>
                <div className="text-white">{profile?.phone}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Academic Information */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Información Académica</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">Universidad</div>
                <div className="text-white">{profile?.university}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">Carrera</div>
                <div className="text-white">{profile?.career}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">Estado Académico</div>
                <div className="text-white">{profile?.academic_status}</div>
              </div>
            </div>
            
            {profile?.cv_url && (
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm text-gray-400">CV</div>
                  <a
                    href={profile.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    Ver CV
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Specializations */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Especializaciones</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.subject_tags && profile.subject_tags.length > 0 ? (
              profile.subject_tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/50"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No hay especializaciones configuradas</p>
            )}
          </div>
        </div>
        
        {/* Reviews */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Reseñas de Estudiantes</h2>
          <ReviewsList userId={user.id} />
        </div>

        {/* Edit Profile Link */}
        <div className="flex justify-center">
          <a
            href="/specialist/profile/edit"
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Editar Perfil
          </a>
        </div>
      </div>
    </div>
  )
}

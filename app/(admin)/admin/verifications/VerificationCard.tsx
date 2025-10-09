'use client'

import { UserWithProfile } from '@/types/database'
import { User, Phone, Mail, GraduationCap, FileText, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { verifyUser } from './actions'

interface VerificationCardProps {
  user: UserWithProfile
}

export default function VerificationCard({ user }: VerificationCardProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isStudent = user.role === 'student'
  const profile = user.profile_details

  const handleVerify = async () => {
    setIsVerifying(true)
    setError(null)

    try {
      const result = await verifyUser(user.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsVerifying(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-500/20 backdrop-blur border border-green-500/50 rounded-lg p-6">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle className="w-6 h-6" />
          <p className="font-semibold">User verified successfully!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isStudent ? 'bg-blue-500/20' : 'bg-green-500/20'
          }`}>
            <User className={`w-6 h-6 ${isStudent ? 'text-blue-400' : 'text-green-400'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{profile.real_name}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              isStudent 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {isStudent ? 'Student' : 'Specialist'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Registered</p>
          <p className="text-sm text-white">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Email */}
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">WhatsApp</p>
            <p className="text-sm text-white">{profile.phone}</p>
          </div>
        </div>

        {/* Student-specific: Alias */}
        {isStudent && profile.alias && (
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Public Alias</p>
              <p className="text-sm text-white">{profile.alias}</p>
            </div>
          </div>
        )}

        {/* Specialist-specific: University */}
        {!isStudent && profile.university && (
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">University</p>
              <p className="text-sm text-white">{profile.university}</p>
            </div>
          </div>
        )}

        {/* Specialist-specific: Career */}
        {!isStudent && profile.career && (
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Career</p>
              <p className="text-sm text-white">{profile.career}</p>
            </div>
          </div>
        )}

        {/* Specialist-specific: Academic Status */}
        {!isStudent && profile.academic_status && (
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Academic Status</p>
              <p className="text-sm text-white">{profile.academic_status}</p>
            </div>
          </div>
        )}
      </div>

      {/* Specialist-specific: Subject Tags */}
      {!isStudent && profile.subject_tags && profile.subject_tags.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-2">Subject Specializations</p>
          <div className="flex flex-wrap gap-2">
            {profile.subject_tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specialist-specific: Documents */}
      {!isStudent && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-3">Documents</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* CI Photo */}
            {profile.ci_photo_url && (
              <a
                href={profile.ci_photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white">CI Photo</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            )}

            {/* CV */}
            {profile.cv_url && (
              <a
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-white">CV</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          {isVerifying ? 'Verifying...' : 'Verify User'}
        </button>
        
        <a
          href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Phone className="w-5 h-5" />
          Contact via WhatsApp
        </a>
      </div>
    </div>
  )
}

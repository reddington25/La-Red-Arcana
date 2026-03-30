import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Image as ImageIcon } from 'lucide-react';

export async function PublicationsFeed() {
  const supabase = await createClient();

  // Fetch publications with specialist profile details
  const { data: publications, error } = await supabase
    .from('publications')
    .select(`
      id,
      description,
      image_urls,
      created_at,
      specialist_id,
      users:specialist_id (
        profile_details (
          real_name,
          alias,
          faculty,
          career
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !publications || publications.length === 0) {
    return (
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center text-gray-500">
        <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
        No hay publicaciones promocionales todavía.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <span>⭐ Portafolio de Especialistas</span>
      </h2>
      <div className="grid gap-6">
        {publications.map((pub) => {
          const profile = (pub.users as any)?.profile_details?.[0] || {};
          const specialistName = profile.alias || profile.real_name || 'Especialista';
          const facultyInfo = [profile.career, profile.faculty].filter(Boolean).join(' - ');

          return (
            <div key={pub.id} className="bg-gradient-to-br from-black/80 to-red-950/20 backdrop-blur border border-red-500/30 rounded-lg overflow-hidden hover:border-red-500/50 transition-colors">
              
              <div className="p-4 border-b border-red-500/10 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white">{specialistName}</h3>
                  {facultyInfo && <p className="text-xs text-gray-400">{facultyInfo}</p>}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(pub.created_at), { addSuffix: true, locale: es })}
                </div>
              </div>

              {pub.image_urls && pub.image_urls.length > 0 && (
                <div className="w-full bg-black/50 overflow-x-auto snap-x flex">
                  {pub.image_urls.map((url: string, index: number) => (
                    <img 
                      key={index} 
                      src={url} 
                      alt={`Promoción ${index + 1}`} 
                      className="w-full max-h-[400px] object-cover bg-black snap-center shrink-0" 
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <div className="p-4">
                <p className="text-white whitespace-pre-line text-sm leading-relaxed">
                  {pub.description}
                </p>
                <div className="mt-4 pt-4 border-t border-red-500/10 flex justify-end">
                    <span className="text-xs text-red-500 font-semibold px-2 py-1 bg-red-500/10 rounded">Publicación Promocional</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

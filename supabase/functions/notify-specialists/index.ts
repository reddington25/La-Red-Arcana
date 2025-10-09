import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  contract_id: string
  tags: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { contract_id, tags } = await req.json() as NotificationRequest

    // Get contract details
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select(`
        *,
        student:users!student_id (
          profile_details (alias)
        )
      `)
      .eq('id', contract_id)
      .single()

    if (contractError || !contract) {
      throw new Error('Contract not found')
    }

    // Find specialists with matching tags who are verified
    const { data: specialists, error: specialistsError } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        profile_details (
          real_name,
          subject_tags
        )
      `)
      .eq('role', 'specialist')
      .eq('is_verified', true)

    if (specialistsError) {
      throw new Error('Error fetching specialists')
    }

    // Filter specialists with matching tags
    const matchingSpecialists = specialists?.filter(specialist => {
      const specialistTags = specialist.profile_details?.subject_tags || []
      return tags.some(tag => specialistTags.includes(tag))
    }) || []

    console.log(`Found ${matchingSpecialists.length} matching specialists`)

    // Send email notifications using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email notifications')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Contract created but email notifications not configured',
          specialists_count: matchingSpecialists.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailPromises = matchingSpecialists.map(async (specialist) => {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Red Arcana <noreply@redarcana.com>',
            to: specialist.email,
            subject: `Nueva Oportunidad: ${contract.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">Nueva Oportunidad de Contrato</h2>
                <p>Hola ${specialist.profile_details?.real_name || 'Especialista'},</p>
                <p>Hay un nuevo contrato que coincide con tus áreas de especialización:</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">${contract.title}</h3>
                  <p><strong>Descripción:</strong> ${contract.description.substring(0, 200)}${contract.description.length > 200 ? '...' : ''}</p>
                  <p><strong>Tipo de Servicio:</strong> ${contract.service_type === 'full' ? 'Realización Completa' : 'Revisión y Corrección'}</p>
                  <p><strong>Precio Inicial:</strong> Bs. ${contract.initial_price}</p>
                  <p><strong>Etiquetas:</strong> ${contract.tags.join(', ')}</p>
                </div>
                
                <p>
                  <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL')}/specialist/opportunities/${contract_id}" 
                     style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Ver Contrato y Hacer Contraoferta
                  </a>
                </p>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Este es un correo automático de Red Arcana. No respondas a este mensaje.
                </p>
              </div>
            `,
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          console.error(`Failed to send email to ${specialist.email}:`, error)
          return { success: false, email: specialist.email, error }
        }

        return { success: true, email: specialist.email }
      } catch (error) {
        console.error(`Error sending email to ${specialist.email}:`, error)
        return { success: false, email: specialist.email, error: error.message }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(r => r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notified ${successCount} of ${matchingSpecialists.length} specialists`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in notify-specialists function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

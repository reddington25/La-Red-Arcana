import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadContractFiles } from '@/lib/supabase/storage'

export async function POST(request: NextRequest) {
  console.log('[API CONTRACTS] Starting...')
  console.log('[API CONTRACTS] Method:', request.method)
  console.log('[API CONTRACTS] URL:', request.url)

  try {
    const supabase = await createClient()
    let user = null
    let authError = null

    // Intentar obtener el token del header Authorization primero
    const authHeader = request.headers.get('authorization')
    console.log('[API CONTRACTS] Authorization header present:', !!authHeader)

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      console.log('[API CONTRACTS] Using Authorization header token')

      // Crear cliente con el token explícito
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)

      if (tokenError) {
        console.error('[API CONTRACTS] Error with token:', tokenError)
      } else if (tokenUser) {
        console.log('[API CONTRACTS] User from token:', tokenUser.id)
        user = tokenUser
      }
    }

    // Si no hay usuario del token, intentar con cookies
    if (!user) {
      console.log('[API CONTRACTS] Trying to get user from cookies...')
      console.log('[API CONTRACTS] Cookies:', request.cookies.getAll().map(c => c.name))

      const {
        data: { user: cookieUser },
        error: cookieError,
      } = await supabase.auth.getUser()

      user = cookieUser
      authError = cookieError

      console.log('[API CONTRACTS] User from cookies:', user?.id)
      console.log('[API CONTRACTS] Cookie auth error:', cookieError)
    }

    if (authError) {
      console.error('[API CONTRACTS] Auth error:', authError)
      return NextResponse.json(
        { error: `Error de autenticación: ${authError.message}` },
        { status: 401 }
      )
    }

    if (!user) {
      console.log('[API CONTRACTS] No user found from any source')
      return NextResponse.json(
        { error: 'No autenticado. Por favor, inicia sesión de nuevo.' },
        { status: 401 }
      )
    }

    console.log('[API CONTRACTS] Authenticated user:', user.id)

    // Validate user is a verified student
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[API CONTRACTS] Profile error:', profileError)
      return NextResponse.json(
        { error: `Error al verificar perfil: ${profileError.message}` },
        { status: 500 }
      )
    }

    if (!profile || profile.role !== 'student' || !profile.is_verified) {
      console.log('[API CONTRACTS] User not authorized:', { profile })
      return NextResponse.json(
        { error: 'No autorizado para crear contratos' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const department = formData.get('department') as string
    const faculty = formData.get('faculty') as string
    const career = formData.get('career') as string
    const deadline = formData.get('deadline') as string
    const serviceType = formData.get('serviceType') as 'full' | 'review'
    const initialPrice = parseFloat(formData.get('initialPrice') as string)

    // Validate form data
    if (!title || title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: 'El título debe tener entre 5 y 200 caracteres' },
        { status: 400 }
      )
    }

    if (!description || description.length < 20 || description.length > 5000) {
      return NextResponse.json(
        { error: 'La descripción debe tener entre 20 y 5000 caracteres' },
        { status: 400 }
      )
    }

    if (!department || !faculty || !career) {
      return NextResponse.json(
        { error: 'Debes seleccionar departamento, facultad y carrera' },
        { status: 400 }
      )
    }

    if (!initialPrice || initialPrice < 10 || initialPrice > 10000) {
      return NextResponse.json(
        { error: 'El precio debe estar entre 10 y 10000 Bs' },
        { status: 400 }
      )
    }

    if (!deadline) {
      return NextResponse.json(
        { error: 'Debes seleccionar una fecha y hora límite' },
        { status: 400 }
      )
    }

    // Validate deadline is at least 12 hours in the future
    const deadlineDate = new Date(deadline)
    const minDeadline = new Date()
    minDeadline.setHours(minDeadline.getHours() + 12)

    if (isNaN(deadlineDate.getTime()) || deadlineDate < minDeadline) {
      return NextResponse.json(
        { error: 'La fecha límite debe ser al menos 12 horas en el futuro' },
        { status: 400 }
      )
    }

    // Get files
    const files: File[] = []
    const fileKeys = Array.from(formData.keys()).filter(key => key.startsWith('file_'))
    for (const key of fileKeys) {
      const file = formData.get(key) as File
      if (file) {
        files.push(file)
      }
    }

    // Create contract first to get ID
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        student_id: user.id,
        title,
        description,
        department,
        faculty,
        career,
        deadline: deadlineDate.toISOString(),
        tags: [], // Deprecated field
        service_type: serviceType,
        initial_price: initialPrice,
        status: 'open',
        file_urls: [],
      })
      .select()
      .single()

    if (contractError || !contract) {
      console.error('[API CONTRACTS] Error creating contract:', contractError)
      return NextResponse.json(
        { error: 'Error al crear el contrato' },
        { status: 500 }
      )
    }

    // Upload files if any
    let fileUrls: string[] = []
    if (files && files.length > 0) {
      const uploadResults = await uploadContractFiles(contract.id, files)

      // Check for upload errors
      const uploadErrors = uploadResults.filter(r => r.error)
      if (uploadErrors.length > 0) {
        // Delete the contract if file upload fails
        await supabase.from('contracts').delete().eq('id', contract.id)
        return NextResponse.json(
          { error: `Error al subir archivos: ${uploadErrors[0].error}` },
          { status: 500 }
        )
      }

      fileUrls = uploadResults.map(r => r.url)

      // Update contract with file URLs
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ file_urls: fileUrls })
        .eq('id', contract.id)

      if (updateError) {
        console.error('[API CONTRACTS] Error updating contract with file URLs:', updateError)
      }
    }

    // Trigger Edge Function to notify specialists
    // Only notify specialists with exact career match
    try {
      const { data, error: functionError } = await supabase.functions.invoke('notify-specialists', {
        body: {
          contract_id: contract.id,
          department,
          faculty,
          career,
        },
      })

      if (functionError) {
        console.error('[API CONTRACTS] Error invoking notify-specialists function:', functionError)
      } else {
        console.log('[API CONTRACTS] Notification result:', data)
      }
    } catch (error) {
      // Don't fail contract creation if notification fails
      console.error('[API CONTRACTS] Error sending notifications:', error)
    }

    console.log('[API CONTRACTS] Contract created successfully:', contract.id)

    return NextResponse.json({
      success: true,
      contractId: contract.id,
    })
  } catch (error) {
    console.error('[API CONTRACTS] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado al crear el contrato. Por favor, intenta de nuevo.' },
      { status: 500 }
    )
  }
}

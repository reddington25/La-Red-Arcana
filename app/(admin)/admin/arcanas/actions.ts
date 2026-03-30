'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addArcanas(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verify admin/super_admin
  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'Acceso denegado' }
  }

  const targetUserId = formData.get('userId') as string
  const amount = parseInt(formData.get('amount') as string)
  const description = formData.get('description') as string || null
  const receiptImgUrl = formData.get('receiptImgUrl') as string || null

  if (!targetUserId || !amount || amount <= 0) {
    return { error: 'Se requiere un usuario y monto válido' }
  }

  if (!receiptImgUrl) {
    return { error: 'Debes subir un comprobante de pago' }
  }

  // Get current user arcanas
  const { data: targetUser } = await supabase
    .from('users')
    .select('arcanas')
    .eq('id', targetUserId)
    .single()

  if (!targetUser) {
    return { error: 'Usuario no encontrado' }
  }

  // Update user's arcanas 
  const { error: updateError } = await supabase
    .from('users')
    .update({ arcanas: (targetUser.arcanas || 0) + amount })
    .eq('id', targetUserId)

  if (updateError) {
    console.error('Error updating arcanas:', updateError)
    return { error: 'Error al actualizar las arcanas' }
  }

  // Record the transaction
  const { error: txnError } = await supabase
    .from('arcana_transactions')
    .insert({
      admin_id: user.id,
      user_id: targetUserId,
      amount: amount,
      description: description,
      receipt_img_url: receiptImgUrl,
    })

  if (txnError) {
    console.error('Error creating transaction:', txnError)
    return { error: 'Arcanas actualizadas pero error al registrar la transacción' }
  }

  // Log the financial audit
  await supabase.from('financial_audit_logs').insert({
    admin_id: user.id,
    user_id: targetUserId,
    action_type: 'arcanas_add',
    amount: amount,
    details: { description, receipt_img_url: receiptImgUrl },
  })

  revalidatePath('/admin/arcanas')
  return { success: true, newBalance: (targetUser.arcanas || 0) + amount }
}

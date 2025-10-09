// Supabase Edge Function to clean up messages from completed contracts
// This function runs daily via cron to delete messages from contracts completed >7 days ago

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoffDate = sevenDaysAgo.toISOString()

    console.log(`Cleaning up messages from contracts completed before ${cutoffDate}`)

    // Find contracts that were completed more than 7 days ago
    const { data: oldContracts, error: contractsError } = await supabaseClient
      .from('contracts')
      .select('id')
      .eq('status', 'completed')
      .lt('completed_at', cutoffDate)

    if (contractsError) {
      throw new Error(`Error fetching contracts: ${contractsError.message}`)
    }

    if (!oldContracts || oldContracts.length === 0) {
      console.log('No contracts found that need message cleanup')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No contracts found that need message cleanup',
          contractsProcessed: 0,
          messagesDeleted: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const contractIds = oldContracts.map((c) => c.id)
    console.log(`Found ${contractIds.length} contracts to clean up`)

    // Delete messages from these contracts
    const { data: deletedMessages, error: deleteError } = await supabaseClient
      .from('messages')
      .delete()
      .in('contract_id', contractIds)
      .select('id')

    if (deleteError) {
      throw new Error(`Error deleting messages: ${deleteError.message}`)
    }

    const messagesDeleted = deletedMessages?.length || 0
    console.log(`Successfully deleted ${messagesDeleted} messages from ${contractIds.length} contracts`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message cleanup completed successfully',
        contractsProcessed: contractIds.length,
        messagesDeleted: messagesDeleted,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in cleanup-messages function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, ShieldAlert, Activity } from 'lucide-react'

export default async function SecurityDashboardPage() {
  const supabase = await createClient()

  // Verify super_admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'super_admin') {
    redirect('/admin/dashboard')
  }

  // Get recent security events
  const { data: events } = await supabase
    .from('security_events')
    .select(`
      id,
      event_type,
      ip_address,
      details,
      created_at,
      user_id,
      users ( email )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Basic Anomaly Detection: Count failed logins per IP in the last 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data: anomalyData } = await supabase
    .from('security_events')
    .select('ip_address, event_type')
    .eq('event_type', 'failed_login')
    .gte('created_at', twentyFourHoursAgo)
    
  const failedLoginsByIp = (anomalyData || []).reduce((acc: any, event) => {
    if (event.ip_address) {
      acc[event.ip_address] = (acc[event.ip_address] || 0) + 1
    }
    return acc
  }, {})

  const anomalousIps = Object.entries(failedLoginsByIp)
    .filter(([_, count]) => (count as number) >= 5)
    .sort((a, b) => (b[1] as number) - (a[1] as number))

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold text-white">Monitoreo de Seguridad</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anomalies Panel */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Alertas y Anomalías (Últimas 24h)
          </h2>
          
          {anomalousIps.length === 0 ? (
            <p className="text-gray-400">No se encontraron actividades sospechosas recientes.</p>
          ) : (
            <div className="space-y-4">
              {anomalousIps.map(([ip, count]) => (
                <div key={ip} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-red-400 font-semibold mb-1">Múltiples Intentos Fallidos</h3>
                      <p className="text-sm text-gray-300">
                        IP: <span className="font-mono bg-black/50 px-2 py-0.5 rounded text-xs">{ip}</span>
                      </p>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {count as number} Intentos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Panel */}
        <div className="bg-black/50 backdrop-blur border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Registro de Eventos (Últimos 50)
          </h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {!events || events.length === 0 ? (
              <p className="text-gray-400">No hay eventos registrados.</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-400">
                      {event.event_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-xs text-right">
                      {new Date(event.created_at).toLocaleString('es-BO')}
                    </span>
                  </div>
                  {event.ip_address && (
                    <div className="text-gray-400 text-xs">
                      <span className="font-medium mr-1 text-gray-500">IP:</span> 
                      {event.ip_address}
                    </div>
                  )}
                  {(event.users as any)?.email && (
                    <div className="text-gray-400 text-xs">
                      <span className="font-medium mr-1 text-gray-500">USER:</span> 
                      {(event.users as any).email}
                    </div>
                  )}
                  {event.details && (
                    <pre className="mt-1 bg-black p-2 rounded text-xs text-green-400 overflow-x-auto">
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

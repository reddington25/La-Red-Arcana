// Script para diagnosticar sesión en el navegador
// Copia y pega esto en la consola del navegador (F12 → Console)
// Después de hacer login

console.log('=== DIAGNÓSTICO DE SESIÓN ===')
console.log('')

// 1. Verificar cookies
console.log('1. COOKIES:')
const cookies = document.cookie.split(';').map(c => c.trim())
console.log('Total cookies:', cookies.length)
cookies.forEach(cookie => {
  const [name] = cookie.split('=')
  if (name.includes('sb-')) {
    console.log('  ✓', name)
  }
})

const hasSbCookies = cookies.some(c => c.includes('sb-'))
if (!hasSbCookies) {
  console.error('  ✗ NO HAY COOKIES DE SUPABASE')
  console.log('  Esto significa que el login no creó las cookies correctamente')
}
console.log('')

// 2. Verificar localStorage
console.log('2. LOCALSTORAGE:')
const lsKeys = Object.keys(localStorage)
console.log('Total keys:', lsKeys.length)
lsKeys.forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    console.log('  ✓', key)
  }
})
console.log('')

// 3. Verificar sessionStorage
console.log('3. SESSIONSTORAGE:')
const ssKeys = Object.keys(sessionStorage)
console.log('Total keys:', ssKeys.length)
ssKeys.forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    console.log('  ✓', key)
  }
})
console.log('')

// 4. Verificar sesión con Supabase
console.log('4. VERIFICANDO SESIÓN CON SUPABASE...')
console.log('Importando Supabase...')

// Necesitas reemplazar estas URLs con las tuyas
const SUPABASE_URL = prompt('Pega tu NEXT_PUBLIC_SUPABASE_URL:')
const SUPABASE_ANON_KEY = prompt('Pega tu NEXT_PUBLIC_SUPABASE_ANON_KEY:')

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Necesitas proporcionar las URLs de Supabase')
} else {
  import('https://esm.sh/@supabase/supabase-js@2').then(({ createClient }) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Verificar sesión
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('')
      console.log('RESULTADO:')
      if (error) {
        console.error('  ✗ Error:', error.message)
      } else if (data.session) {
        console.log('  ✓ Sesión EXISTE')
        console.log('  User ID:', data.session.user.id)
        console.log('  Email:', data.session.user.email)
        console.log('  Expira:', new Date(data.session.expires_at * 1000).toLocaleString())
        
        const now = Date.now() / 1000
        const expiresIn = data.session.expires_at - now
        console.log('  Expira en:', Math.floor(expiresIn / 60), 'minutos')
        
        if (expiresIn < 300) {
          console.warn('  ⚠ La sesión expira en menos de 5 minutos')
        }
      } else {
        console.error('  ✗ NO HAY SESIÓN')
        console.log('  Esto confirma que la sesión se perdió')
      }
      
      console.log('')
      console.log('=== FIN DEL DIAGNÓSTICO ===')
      console.log('')
      console.log('COMPARTE ESTE OUTPUT COMPLETO')
    })
  }).catch(err => {
    console.error('Error importando Supabase:', err)
  })
}

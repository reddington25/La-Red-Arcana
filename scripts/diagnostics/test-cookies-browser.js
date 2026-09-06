// Script para ejecutar en la consola del navegador (F12)
// Copia y pega todo este código en la consola

console.log('=== TEST DE COOKIES Y SESION ===')
console.log('')

// Test 1: Cookies
console.log('1. COOKIES:')
console.log('Todas las cookies:', document.cookie)
console.log('')

const cookies = document.cookie.split(';').map(c => c.trim())
const supabaseCookies = cookies.filter(c => c.startsWith('sb-'))
console.log('Cookies de Supabase:', supabaseCookies.length > 0 ? supabaseCookies : 'NINGUNA')
console.log('')

// Test 2: LocalStorage
console.log('2. LOCAL STORAGE:')
const lsKeys = Object.keys(localStorage)
console.log('Keys en localStorage:', lsKeys)
const supabaseLSKeys = lsKeys.filter(k => k.includes('supabase'))
console.log('Keys de Supabase:', supabaseLSKeys.length > 0 ? supabaseLSKeys : 'NINGUNA')
console.log('')

// Test 3: SessionStorage
console.log('3. SESSION STORAGE:')
const ssKeys = Object.keys(sessionStorage)
console.log('Keys en sessionStorage:', ssKeys)
const supabaseSSKeys = ssKeys.filter(k => k.includes('supabase'))
console.log('Keys de Supabase:', supabaseSSKeys.length > 0 ? supabaseSSKeys : 'NINGUNA')
console.log('')

// Test 4: Verificar si hay token en localStorage
console.log('4. TOKEN EN LOCAL STORAGE:')
const authToken = localStorage.getItem('supabase.auth.token')
console.log('Token existe:', authToken ? 'SI' : 'NO')
if (authToken) {
  try {
    const parsed = JSON.parse(authToken)
    console.log('Token parseado:', {
      hasAccessToken: !!parsed.access_token,
      hasRefreshToken: !!parsed.refresh_token,
      expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000).toLocaleString() : 'N/A'
    })
  } catch (e) {
    console.log('Error parseando token:', e.message)
  }
}
console.log('')

// Test 5: Configuración del navegador
console.log('5. CONFIGURACION DEL NAVEGADOR:')
console.log('Cookies habilitadas:', navigator.cookieEnabled)
console.log('User Agent:', navigator.userAgent)
console.log('URL actual:', window.location.href)
console.log('')

// Test 6: Intentar crear una cookie de prueba
console.log('6. TEST DE CREAR COOKIE:')
document.cookie = 'test_cookie=test_value; path=/; SameSite=Lax; Secure'
const testCookieExists = document.cookie.includes('test_cookie')
console.log('Cookie de prueba creada:', testCookieExists ? 'SI' : 'NO')
if (testCookieExists) {
  // Limpiar cookie de prueba
  document.cookie = 'test_cookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
}
console.log('')

console.log('=== FIN DEL TEST ===')
console.log('')
console.log('RESUMEN:')
console.log('- Cookies de Supabase:', supabaseCookies.length > 0 ? 'ENCONTRADAS' : 'NO ENCONTRADAS')
console.log('- LocalStorage de Supabase:', supabaseLSKeys.length > 0 ? 'ENCONTRADO' : 'NO ENCONTRADO')
console.log('- Token de auth:', authToken ? 'EXISTE' : 'NO EXISTE')
console.log('- Cookies habilitadas:', navigator.cookieEnabled ? 'SI' : 'NO')
console.log('')
console.log('COPIA TODO ESTE OUTPUT Y COMPARTELO')

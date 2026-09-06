# 🔑 Rotar Claves de Google OAuth (SOLUCIÓN DEFINITIVA)

## 🎯 Problema

GitHub detectó el Google OAuth Client ID en los commits y está bloqueando TODO push al repositorio.
La única solución es crear nuevas credenciales de Google OAuth.

## ✅ Solución: Crear Nuevas Credenciales

### PASO 1: Crear Nuevo OAuth Client ID en Google Cloud

1. **Ve a Google Cloud Console:**

   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Haz clic en "Create Credentials"**

3. **Selecciona "OAuth 2.0 Client ID"**

4. **Configura:**
   - Application type: **Web application**
   - Name: **Red Arcana Auth (Nuevo)**
5. **En "Authorized redirect URIs", agrega:**

   ```
   https://uohpkoywggsqxgaymtwg.supabase.co/auth/v1/callback
   ```

6. **Haz clic en "Create"**

7. **COPIA el nuevo Client ID y Client Secret**
   - Guárdalos en un lugar seguro temporalmente

---

### PASO 2: Actualizar en Supabase

1. **Ve a Supabase Dashboard:**

   ```
   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/auth/providers
   ```

2. **Haz clic en "Google"**

3. **Pega las NUEVAS credenciales:**

   - Client ID: (el nuevo que copiaste)
   - Client Secret: (el nuevo que copiaste)

4. **Haz clic en "Save"**

---

### PASO 3: Eliminar el Viejo OAuth Client ID

1. **Vuelve a Google Cloud Console:**

   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Encuentra el viejo OAuth Client ID**

   - El que tiene el ID que GitHub detectó

3. **Haz clic en el ícono de basura (Delete)**

4. **Confirma la eliminación**

**IMPORTANTE:** Al eliminar el viejo Client ID:

- ✅ Las claves viejas quedan inválidas
- ✅ GitHub ya no las considera un riesgo de seguridad
- ✅ Podrás hacer push sin problemas

---

### PASO 4: Intentar Push de Nuevo

Ahora que las claves viejas están invalidadas:

```powershell
# Volver a main
git checkout main

# Agregar cambios
git add .

# Commit
git commit -m "fix: eliminar service worker y desactivar modo demo"

# Push (ahora debería funcionar)
git push origin main
```

---

## 🚀 Alternativa: Desplegar Directamente desde Vercel

Si no quieres esperar a que GitHub desbloquee el repo, puedes desplegar directamente:

### Opción A: Vercel CLI

```powershell
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Desplegar a producción
vercel --prod
```

### Opción B: Conectar Vercel a la Rama Nueva

1. **Ve a Vercel Dashboard:**

   ```
   https://vercel.com/tu-proyecto/settings/git
   ```

2. **En "Production Branch"**, cambia a: `fix-login-sin-service-worker`

3. **Guarda**

4. **Vercel desplegará desde esa rama**

---

## 📋 Checklist de Rotación de Claves

- [ ] Crear nuevo OAuth Client ID en Google Cloud
- [ ] Copiar nuevo Client ID y Secret
- [ ] Actualizar en Supabase
- [ ] Guardar cambios en Supabase
- [ ] Eliminar viejo OAuth Client ID en Google Cloud
- [ ] Esperar 5 minutos
- [ ] Intentar push de nuevo
- [ ] Verificar que funciona

---

## ⏱️ Tiempo Estimado

- Crear nuevas credenciales: 2 minutos
- Actualizar en Supabase: 1 minuto
- Eliminar viejas credenciales: 30 segundos
- Esperar propagación: 5 minutos
- **Total: ~10 minutos**

---

## 🔒 Seguridad

Después de rotar las claves:

✅ **Las claves viejas están invalidadas**

- No funcionan más
- GitHub las marca como "resueltas"
- Ya no son un riesgo de seguridad

✅ **Las nuevas claves están seguras**

- Solo en variables de entorno
- No en el código
- No en commits

✅ **El repositorio se desbloquea**

- Puedes hacer push normalmente
- Sin restricciones

---

## 🆘 Si Sigue Sin Funcionar

Si después de rotar las claves GitHub sigue bloqueando:

### Opción 1: Contactar a GitHub Support

1. Ve a: https://support.github.com/
2. Explica que rotaste las claves
3. Pide que desbloqueen el repositorio

### Opción 2: Usar Vercel CLI (Bypass GitHub)

```powershell
vercel --prod
```

Esto despliega directamente sin pasar por GitHub.

### Opción 3: Crear Nuevo Repositorio

Como último recurso:

1. Crear nuevo repo en GitHub
2. Copiar el código (sin .git)
3. Inicializar nuevo repo
4. Push al nuevo repo
5. Conectar Vercel al nuevo repo

Pero **primero intenta rotar las claves**, que debería funcionar.

---

## 💡 Prevención Futura

Para evitar este problema en el futuro:

1. **NUNCA pongas claves en archivos de código**

   - Usa variables de entorno
   - Usa `.env.local` (que está en `.gitignore`)

2. **Usa placeholders en documentación**

   - En lugar de: `Client ID: 123456789`
   - Usa: `Client ID: tu_client_id_aqui`

3. **Revisa antes de commit**

   ```powershell
   git diff --cached
   ```

4. **Usa herramientas de detección**
   - git-secrets
   - truffleHog
   - GitHub Secret Scanning (ya lo tienes)

---

## 🎯 Acción Inmediata

**Ejecuta este script para guiarte paso a paso:**

```powershell
.\rotar-claves-google.ps1
```

O sigue los pasos manuales arriba.

**Tiempo total: ~10 minutos**

Después de rotar las claves, podrás hacer push sin problemas.

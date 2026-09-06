# Guía Rápida de Dashboards

## 📚 Índice
- [Dashboard de Estudiante](#dashboard-de-estudiante)
- [Dashboard de Especialista](#dashboard-de-especialista)
- [Dashboard de Admin](#dashboard-de-admin)
- [Solución de Problemas](#solución-de-problemas)

---

## 🎓 Dashboard de Estudiante

### ¿Qué puedo hacer aquí?

#### 1. **Crear Nuevo Contrato**
- **Botón**: "Nuevo Contrato" (esquina superior derecha)
- **Qué hace**: Te lleva a un formulario para crear un contrato
- **Cuándo usarlo**: Cuando necesites ayuda con un trabajo académico

#### 2. **Ver Estadísticas**
- **Total de Contratos**: Todos los contratos que has creado
- **Abiertos**: Contratos esperando ofertas de especialistas
- **En Progreso**: Contratos siendo trabajados por especialistas
- **Completados**: Contratos finalizados exitosamente

#### 3. **Gestionar Contratos**
- **Haz clic en cualquier contrato** para:
  - Ver ofertas recibidas
  - Aceptar una oferta
  - Chatear con el especialista
  - Confirmar trabajo completado
  - Dejar una reseña

### 🔄 Flujo Típico

1. **Crear Contrato** → Describe tu trabajo
2. **Esperar Ofertas** → Los especialistas envían propuestas
3. **Aceptar Oferta** → Elige el mejor especialista
4. **Realizar Pago** → Deposita el dinero en escrow
5. **Recibir Trabajo** → El especialista entrega el trabajo
6. **Confirmar y Reseñar** → Libera el pago y deja una reseña

---

## 👨‍🏫 Dashboard de Especialista

### ¿Qué puedo hacer aquí?

#### 1. **Ver Saldo**
- **Saldo Disponible**: Dinero que puedes retirar
- **Comisión**: Red Arcana cobra 15% por cada contrato
- **Retiro Mínimo**: Bs. 50

#### 2. **Solicitar Retiro**
- **Botón**: "Solicitar Retiro"
- **Qué hace**: Envía una solicitud al admin para retirar tu saldo
- **Tiempo de procesamiento**: 24-48 horas

#### 3. **Ver Estadísticas**
- **Contratos Activos**: Trabajos que estás realizando ahora
- **Completados**: Trabajos finalizados
- **Ofertas Pendientes**: Ofertas enviadas esperando respuesta
- **Ganancias Totales**: Total ganado (después de comisión)

#### 4. **Buscar Oportunidades**
- **Botón**: "Ver Oportunidades" o "Buscar Oportunidades"
- **Qué hace**: Muestra contratos disponibles que coinciden con tus especialidades
- **Cómo funciona**: Envía ofertas con tu precio y propuesta

### 🔄 Flujo Típico

1. **Buscar Oportunidades** → Encuentra contratos disponibles
2. **Enviar Oferta** → Propón tu precio y plan de trabajo
3. **Esperar Aceptación** → El estudiante revisa tu oferta
4. **Trabajar en el Contrato** → Realiza el trabajo acordado
5. **Entregar Trabajo** → Sube los archivos completados
6. **Recibir Pago** → El dinero se acredita a tu saldo

---

## 👨‍💼 Dashboard de Admin

### ¿Qué puedo hacer aquí?

#### 1. **Verificaciones Pendientes**
- **Qué son**: Usuarios nuevos esperando aprobación
- **Qué hacer**: Revisar documentos y aprobar/rechazar
- **Acceso**: Click en "Revisar Verificaciones"

#### 2. **Gestionar Pagos (Escrow)**
- **Depósitos Pendientes**: Pagos esperando confirmación
- **Retiros Pendientes**: Solicitudes de retiro de especialistas
- **Qué hacer**: Confirmar depósitos y procesar retiros
- **Acceso**: Click en "Gestionar Pagos"

#### 3. **Resolver Disputas**
- **Qué son**: Conflictos entre estudiantes y especialistas
- **Qué hacer**: Mediar y tomar decisiones sobre el pago
- **Acceso**: Click en "Resolver Disputas"

#### 4. **Gestionar Distintivos**
- **Qué son**: Garantía Arcana para especialistas destacados
- **Qué hacer**: Otorgar o revocar distintivos
- **Acceso**: Click en "Gestionar Distintivos"

### 🔄 Flujo Típico de Verificación

1. **Ver Solicitud** → Revisar perfil del usuario
2. **Verificar Documentos** → Comprobar identidad y credenciales
3. **Aprobar/Rechazar** → Tomar decisión
4. **Usuario Notificado** → El usuario recibe un email

### 🔄 Flujo Típico de Retiro

1. **Ver Solicitud** → Revisar monto y datos bancarios
2. **Procesar Pago** → Realizar transferencia bancaria
3. **Confirmar en Sistema** → Marcar como completado
4. **Especialista Notificado** → El especialista recibe confirmación

---

## 🔧 Solución de Problemas

### Problema: "Me redirige al login al hacer clic en botones"

**Solución**:
1. Limpia las cookies del navegador:
   - Presiona F12 para abrir DevTools
   - Ve a Application > Cookies
   - Elimina todas las cookies de localhost:3000

2. Ejecuta el script de solución:
   ```powershell
   .\solucionar-problema-sesion.ps1
   ```

3. Cierra todas las pestañas del navegador

4. Abre una nueva pestaña y vuelve a iniciar sesión

**Más información**: Lee `SOLUCION_PROBLEMA_SESION.md`

### Problema: "No veo mis contratos/ofertas"

**Posibles causas**:
1. **Políticas RLS**: Verifica que las políticas V3 estén aplicadas
2. **Rol incorrecto**: Verifica que tu usuario tenga el rol correcto
3. **No verificado**: Asegúrate de que tu cuenta esté verificada

**Solución**:
```sql
-- Verifica tu rol y estado de verificación
SELECT id, email, role, is_verified 
FROM users 
WHERE email = 'tu_email@ejemplo.com';
```

### Problema: "Error 404 en la consola"

**Causa**: Service worker antiguo o archivos faltantes

**Solución**:
```powershell
# Limpia el service worker
.\limpiar-service-worker.ps1

# Reinicia el servidor
npm run dev
```

### Problema: "No puedo crear un contrato"

**Verificaciones**:
1. ¿Estás verificado? (Debe aparecer en tu perfil)
2. ¿Tienes el rol de estudiante?
3. ¿Completaste todos los campos del formulario?
4. ¿Los archivos son menores a 10MB?

### Problema: "No puedo solicitar retiro"

**Verificaciones**:
1. ¿Tu saldo es mayor a Bs. 50?
2. ¿Ya tienes una solicitud pendiente?
3. ¿Configuraste tus datos bancarios en tu perfil?

---

## 💡 Consejos y Mejores Prácticas

### Para Estudiantes

1. **Sé específico en la descripción**: Más detalles = mejores ofertas
2. **Adjunta archivos de referencia**: Ayuda a los especialistas a entender mejor
3. **Responde rápido a las ofertas**: Los buenos especialistas se ocupan rápido
4. **Deja reseñas honestas**: Ayuda a otros estudiantes

### Para Especialistas

1. **Completa tu perfil**: Más información = más confianza
2. **Responde rápido a oportunidades**: Los contratos se asignan rápido
3. **Sé realista con los precios**: Considera el tiempo y complejidad
4. **Comunícate claramente**: Usa el chat para aclarar dudas
5. **Entrega a tiempo**: Tu reputación es tu mejor activo

### Para Admins

1. **Verifica documentos cuidadosamente**: La calidad de la plataforma depende de esto
2. **Responde rápido a disputas**: Los usuarios esperan resolución rápida
3. **Procesa retiros puntualmente**: Los especialistas dependen de sus pagos
4. **Otorga Garantía Arcana con criterio**: Es un distintivo de calidad

---

## 📞 ¿Necesitas Más Ayuda?

- **Documentación técnica**: Lee los archivos `TASK_*_SUMMARY.md`
- **Problemas de autenticación**: Lee `SOLUCION_PROBLEMA_SESION.md`
- **Configuración**: Lee `SETUP.md`
- **Despliegue**: Lee `DEPLOYMENT_GUIDE.md`

---

## 🎯 Atajos de Teclado (Próximamente)

- `Ctrl + N`: Nuevo contrato (estudiante)
- `Ctrl + O`: Ver oportunidades (especialista)
- `Ctrl + M`: Ver mensajes
- `Ctrl + P`: Ver perfil

---

**Última actualización**: Octubre 2025
**Versión**: 1.0

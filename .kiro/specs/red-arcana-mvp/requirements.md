# Requirements Document - Red Arcana MVP

## Introduction

Red Arcana es un marketplace académico mobile-first que conecta estudiantes universitarios con especialistas verificados mediante un modelo de contraoferta similar a inDrive. La plataforma prioriza la confianza y seguridad a través de verificación manual, perfiles anónimos para estudiantes, sistema de escrow manual y mediación de disputas. El MVP debe operar con coste cero utilizando los niveles gratuitos de Next.js, Tailwind CSS, Supabase y Vercel.

## Requirements

### Requirement 1: Sistema de Autenticación y Registro con Verificación Manual

**User Story:** Como usuario nuevo (estudiante o especialista), quiero registrarme en la plataforma usando mi cuenta de Gmail y completar mi perfil, para que un administrador pueda verificar mi identidad antes de acceder a las funcionalidades.

#### Acceptance Criteria

1. WHEN un usuario accede a la página de registro THEN el sistema SHALL mostrar la opción de autenticación con Gmail mediante Supabase Auth
2. WHEN un usuario completa la autenticación con Gmail THEN el sistema SHALL redirigir al formulario de completar perfil según el rol seleccionado
3. IF el usuario es estudiante THEN el formulario SHALL solicitar: nombre real (privado), alias público, y número de WhatsApp
4. IF el usuario es especialista THEN el formulario SHALL solicitar: nombre real, número de WhatsApp, foto de CI, CV opcional, universidad, carrera, y estado académico (semestre actual o egresado)
5. WHEN un usuario envía el formulario de registro THEN el sistema SHALL crear la cuenta con `is_verified = false` en la base de datos
6. WHEN la cuenta es creada THEN el sistema SHALL mostrar una pantalla de "Cuenta en revisión" al usuario
7. WHEN una nueva cuenta es creada THEN el sistema SHALL notificar al panel de administración con los datos del solicitante
8. WHEN un admin verifica la identidad por WhatsApp THEN el admin SHALL poder activar la cuenta cambiando `is_verified` a `true`
9. WHEN la cuenta es verificada THEN el usuario SHALL poder acceder a todas las funcionalidades de su rol

### Requirement 2: Gestión de Contratos por Estudiantes

**User Story:** Como estudiante verificado, quiero crear y publicar contratos con detalles de mi trabajo académico, para que especialistas puedan ver mi necesidad y hacer contraofertas.

#### Acceptance Criteria

1. WHEN un estudiante accede a su panel THEN el sistema SHALL mostrar un botón de "Crear Contrato"
2. WHEN un estudiante crea un contrato THEN el formulario SHALL solicitar: título, descripción detallada, archivos adjuntos, etiquetas de materia, tipo de servicio, y precio inicial en Bs
3. WHEN un estudiante sube archivos THEN el sistema SHALL almacenar múltiples archivos (PDF, DOCX, JPG) en Supabase Storage
4. WHEN un estudiante selecciona etiquetas THEN el sistema SHALL permitir selección múltiple de materias
5. WHEN un estudiante selecciona tipo de servicio THEN el sistema SHALL ofrecer "Realización del Trabajo Completo" o "Revisión y Corrección"
6. WHEN un estudiante publica el contrato THEN el sistema SHALL crear el registro con estado "open" en la base de datos
7. WHEN un contrato es publicado THEN una Supabase Edge Function SHALL enviar notificación por correo a especialistas con etiquetas coincidentes
8. WHEN un estudiante ve su panel THEN el sistema SHALL mostrar lista de contraofertas recibidas con: alias del especialista, calificación, insignia "Garantía Arcana" (si aplica), y precio propuesto
9. WHEN un estudiante acepta una oferta THEN el sistema SHALL cambiar el estado del contrato a "assigned" y SHALL dejar de aceptar más ofertas

### Requirement 3: Sistema de Escrow Manual y Flujo de Pago

**User Story:** Como estudiante que aceptó una oferta, quiero depositar los fondos de forma segura mediante un proceso guiado por el admin, para que el especialista pueda comenzar el trabajo con la garantía de pago.

#### Acceptance Criteria

1. WHEN un estudiante acepta una oferta THEN el sistema SHALL cambiar el estado del contrato a "pending_deposit"
2. WHEN el estado cambia a "pending_deposit" THEN el sistema SHALL notificar al panel de administración
3. WHEN un admin recibe la notificación THEN el admin SHALL poder enviar un QR de pago al estudiante mediante un canal de comunicación Admin-Usuario (separado del chat del contrato)
4. WHEN el estudiante realiza el pago THEN el estudiante SHALL notificar al admin mediante el mismo canal Admin-Usuario
5. WHEN el admin confirma la recepción del pago THEN el admin SHALL actualizar el estado del contrato a "in_progress"
6. WHEN el estado cambia a "in_progress" THEN el sistema SHALL habilitar el chat interno del contrato entre estudiante y especialista
7. WHEN el especialista completa el trabajo THEN el especialista SHALL subir los archivos finales al contrato
8. WHEN el estudiante revisa el trabajo THEN el estudiante SHALL poder marcar el contrato como "completed"
9. WHEN el contrato es marcado como "completed" THEN el sistema SHALL retener el 15% de comisión y SHALL acreditar el 85% al saldo del especialista

### Requirement 4: Panel de Oportunidades y Contraofertas para Especialistas

**User Story:** Como especialista verificado, quiero ver contratos disponibles que coincidan con mis áreas de especialización y hacer contraofertas, para poder ofrecer mis servicios a estudiantes.

#### Acceptance Criteria

1. WHEN un especialista accede a su panel THEN el sistema SHALL mostrar una sección "Oportunidades"
2. WHEN el sistema muestra oportunidades THEN SHALL filtrar contratos con estado "open" que coincidan con las etiquetas del especialista
3. WHEN un especialista ve un contrato THEN el sistema SHALL mostrar: título, descripción, archivos, etiquetas, tipo de servicio, y precio inicial
4. WHEN un especialista hace una contraoferta THEN el formulario SHALL solicitar: precio propuesto y mensaje opcional
5. WHEN un especialista envía una contraoferta THEN el sistema SHALL crear un registro en la tabla `offers`
6. WHEN un especialista es elegido THEN el sistema SHALL notificar al especialista del contrato asignado
7. WHEN un especialista ve su panel THEN el sistema SHALL mostrar contratos activos, completados, y saldo actual
8. WHEN un especialista solicita retiro THEN el sistema SHALL notificar al admin para procesar el pago manualmente
9. WHEN un especialista tiene saldo disponible THEN el sistema SHALL mostrar el monto después de descontar el 15% de comisión

### Requirement 5: Sistema de Calificaciones Obligatorias

**User Story:** Como usuario que completó un contrato, quiero calificar a la otra parte de forma obligatoria, para mantener la transparencia y confianza en la plataforma.

#### Acceptance Criteria

1. WHEN un contrato es marcado como "completed" THEN el sistema SHALL mostrar un modal de calificación obligatoria
2. WHEN el modal de calificación aparece THEN el sistema SHALL solicitar: calificación de 1-5 estrellas y comentario
3. WHEN un usuario intenta cerrar el modal sin calificar THEN el sistema SHALL prevenir el cierre y SHALL mostrar mensaje de obligatoriedad
4. WHEN ambas partes califican THEN el sistema SHALL almacenar las calificaciones en la tabla `reviews`
5. WHEN las calificaciones son guardadas THEN el sistema SHALL actualizar el promedio de calificación del usuario calificado
6. WHEN un estudiante ve contraofertas THEN el sistema SHALL mostrar el promedio de calificación del especialista
7. WHEN un especialista ve su perfil THEN el sistema SHALL mostrar su promedio de calificación y reseñas recibidas

### Requirement 6: Chat Interno con Retención Temporal

**User Story:** Como usuario con un contrato activo, quiero comunicarme con la otra parte mediante un chat interno, para coordinar detalles del trabajo de forma segura dentro de la plataforma.

#### Acceptance Criteria

1. WHEN un contrato tiene estado "in_progress" THEN el sistema SHALL habilitar el chat interno entre estudiante y especialista
2. WHEN un usuario envía un mensaje THEN el sistema SHALL almacenar el mensaje en la tabla `messages` con timestamp
3. WHEN un usuario accede al chat THEN el sistema SHALL mostrar mensajes en tiempo real usando suscripciones de Supabase
4. WHEN un contrato es finalizado THEN el sistema SHALL mantener los mensajes visibles durante 1 semana
5. WHEN han pasado 7 días desde la finalización THEN una Edge Function programada SHALL eliminar los mensajes del contrato
6. WHEN el contrato no está en estado "in_progress" o finalizado hace menos de 1 semana THEN el sistema SHALL deshabilitar el envío de nuevos mensajes
7. WHEN un admin media una disputa THEN el admin SHALL poder ver el historial completo de mensajes del contrato

### Requirement 7: Sistema de Disputas con Mediación de Admin

**User Story:** Como usuario con un contrato problemático, quiero iniciar una disputa para que un administrador revise el caso y medie la situación.

#### Acceptance Criteria

1. WHEN un contrato está en estado "in_progress" o "completed" THEN el sistema SHALL mostrar un botón "Iniciar Disputa"
2. WHEN han pasado más de 7 días desde la finalización THEN el sistema SHALL ocultar el botón de disputa
3. WHEN un usuario inicia una disputa THEN el sistema SHALL cambiar el estado del contrato a "disputed"
4. WHEN el estado cambia a "disputed" THEN el sistema SHALL notificar al panel de administración
5. WHEN un admin accede a una disputa THEN el sistema SHALL mostrar: detalles del contrato, historial de mensajes, y perfiles de ambas partes
6. WHEN un admin resuelve una disputa THEN el admin SHALL poder cambiar el estado del contrato y SHALL poder ajustar el pago manualmente
7. WHEN una disputa es resuelta THEN el sistema SHALL notificar a ambas partes de la decisión

### Requirement 8: Panel de Administración con Gestión Manual

**User Story:** Como administrador, quiero gestionar verificaciones de usuarios, procesar pagos de escrow, otorgar insignias y mediar disputas, para mantener la operación y confianza de la plataforma.

#### Acceptance Criteria

1. WHEN un admin accede al panel THEN el sistema SHALL mostrar secciones: solicitudes pendientes, escrow pendiente, disputas activas, y gestión de insignias
2. WHEN hay solicitudes de registro pendientes THEN el sistema SHALL mostrar lista con datos del solicitante y botón de verificar
3. WHEN un admin verifica un usuario THEN el sistema SHALL actualizar `is_verified` a `true` y SHALL notificar al usuario
4. WHEN hay contratos en "pending_deposit" THEN el sistema SHALL mostrar lista con datos del estudiante y botón para enviar QR
5. WHEN un admin confirma un pago THEN el sistema SHALL actualizar el estado del contrato a "in_progress"
6. WHEN hay solicitudes de retiro THEN el sistema SHALL mostrar lista con datos del especialista, monto solicitado, y botón de procesar
7. WHEN un admin otorga insignia "Garantía Arcana" THEN el sistema SHALL actualizar `has_arcana_badge` a `true` en el perfil del especialista
8. WHEN un admin accede a una disputa THEN el sistema SHALL mostrar toda la información relevante del contrato para tomar una decisión

### Requirement 9: Panel de Super Admin con Gestión de Administradores

**User Story:** Como super administrador, quiero crear, modificar y eliminar cuentas de administradores, para mantener el control total sobre la plataforma.

#### Acceptance Criteria

1. WHEN un super admin accede al panel THEN el sistema SHALL mostrar todas las funcionalidades de admin más una sección de "Gestión de Admins"
2. WHEN un super admin accede a gestión de admins THEN el sistema SHALL mostrar lista de todos los admins actuales
3. WHEN un super admin crea un nuevo admin THEN el sistema SHALL solicitar email y SHALL crear cuenta con rol "admin"
4. WHEN un super admin modifica un admin THEN el sistema SHALL permitir cambiar permisos o datos de contacto
5. WHEN un super admin elimina un admin THEN el sistema SHALL cambiar el rol a usuario regular o SHALL desactivar la cuenta
6. WHEN un super admin realiza cambios THEN el sistema SHALL registrar la acción en un log de auditoría

### Requirement 10: Homepage con Diseño Distintivo y Mobile-First

**User Story:** Como visitante de la plataforma, quiero ver una página de inicio atractiva y clara que explique el servicio, para entender rápidamente cómo funciona Red Arcana y decidir registrarme.

#### Acceptance Criteria

1. WHEN un visitante accede a la homepage THEN el sistema SHALL mostrar un fondo animado de "matrix rain" con caracteres chinos usando HTML canvas
2. WHEN la animación se renderiza THEN el sistema SHALL optimizar el rendimiento para no afectar la experiencia móvil
3. WHEN la página carga THEN el sistema SHALL mostrar el título "Red Arcana" con fuente futurista (Orbitron) y efecto glitch CSS
4. WHEN un visitante ve el contenido THEN el sistema SHALL mostrar: propuesta de valor, proceso en 4 pasos (Describe, Recibe, Elige, Libera), y énfasis en el sistema de escrow
5. WHEN un visitante ve los CTAs THEN el sistema SHALL mostrar botones claros: "Publicar un Contrato" y "Aplicar como Especialista"
6. WHEN un visitante accede desde móvil THEN el diseño SHALL ser completamente responsivo y optimizado para mobile-first
7. WHEN un visitante accede desde desktop THEN el diseño SHALL adaptarse manteniendo la funcionalidad completa
8. WHEN la página carga THEN el sistema SHALL implementar características PWA básicas para comportamiento similar a app

### Requirement 11: Notificaciones por Correo Electrónico

**User Story:** Como especialista, quiero recibir notificaciones por correo cuando hay nuevos contratos que coinciden con mis especialidades, para no perder oportunidades de trabajo.

#### Acceptance Criteria

1. WHEN un estudiante publica un contrato THEN una Supabase Edge Function SHALL dispararse automáticamente
2. WHEN la Edge Function se ejecuta THEN SHALL consultar especialistas con etiquetas coincidentes y `is_verified = true`
3. WHEN se identifican especialistas coincidentes THEN el sistema SHALL enviar correo usando Nodemailer
4. WHEN el correo es enviado THEN SHALL incluir: título del contrato, descripción resumida, etiquetas, precio inicial, y enlace directo
5. WHEN un especialista hace clic en el enlace THEN el sistema SHALL redirigir al detalle del contrato en su panel
6. WHEN el envío de correo falla THEN el sistema SHALL registrar el error pero no SHALL bloquear la publicación del contrato

### Requirement 12: Gestión de Archivos con Supabase Storage

**User Story:** Como usuario, quiero subir y descargar archivos relacionados con contratos de forma segura, para compartir documentos necesarios para el trabajo académico.

#### Acceptance Criteria

1. WHEN un estudiante crea un contrato THEN el sistema SHALL permitir subir múltiples archivos (PDF, DOCX, JPG)
2. WHEN un archivo es subido THEN el sistema SHALL almacenar en Supabase Storage con permisos apropiados
3. WHEN un archivo es almacenado THEN el sistema SHALL guardar la URL en el campo `file_urls` del contrato
4. WHEN un especialista ve un contrato THEN el sistema SHALL permitir descargar los archivos adjuntos
5. WHEN un especialista completa el trabajo THEN el sistema SHALL permitir subir archivos de entrega
6. WHEN un estudiante ve el trabajo completado THEN el sistema SHALL permitir descargar los archivos de entrega
7. WHEN un contrato es eliminado o archivado THEN el sistema SHALL mantener los archivos por razones de auditoría
8. WHEN se sube un archivo THEN el sistema SHALL validar el tipo y tamaño máximo (ej. 10MB por archivo)

### Requirement 13: Sistema de Etiquetas y Especialización

**User Story:** Como especialista, quiero configurar las materias en las que me especializo, para recibir notificaciones solo de contratos relevantes a mis conocimientos.

#### Acceptance Criteria

1. WHEN un especialista completa su registro THEN el sistema SHALL solicitar selección de etiquetas de materias
2. WHEN el sistema muestra etiquetas THEN SHALL ofrecer lista predefinida de materias comunes universitarias
3. WHEN un especialista selecciona etiquetas THEN el sistema SHALL permitir selección múltiple
4. WHEN un especialista accede a su perfil THEN el sistema SHALL permitir editar las etiquetas en cualquier momento
5. WHEN un estudiante crea un contrato THEN el sistema SHALL mostrar las mismas etiquetas para selección
6. WHEN se publican contratos THEN el sistema SHALL usar las etiquetas para filtrar especialistas a notificar
7. WHEN un especialista ve oportunidades THEN el sistema SHALL priorizar contratos con mayor coincidencia de etiquetas

### Requirement 14: Sistema de Insignia "Garantía Arcana"

**User Story:** Como estudiante, quiero identificar fácilmente a los especialistas de élite con la insignia "Garantía Arcana", para tomar decisiones informadas al elegir una contraoferta.

#### Acceptance Criteria

1. WHEN un admin identifica un especialista de élite THEN el admin SHALL poder otorgar la insignia desde el panel
2. WHEN la insignia es otorgada THEN el sistema SHALL actualizar `has_arcana_badge` a `true`
3. WHEN un especialista tiene la insignia THEN el sistema SHALL mostrar un ícono distintivo junto a su alias
4. WHEN un estudiante ve contraofertas THEN el sistema SHALL destacar visualmente especialistas con insignia
5. WHEN un especialista ve su perfil THEN el sistema SHALL mostrar si tiene la insignia "Garantía Arcana"
6. WHEN un admin revoca la insignia THEN el sistema SHALL actualizar `has_arcana_badge` a `false`

### Requirement 15: Diseño Responsivo y PWA

**User Story:** Como usuario móvil, quiero que la aplicación funcione perfectamente en mi teléfono y se comporte como una app nativa, para tener una experiencia fluida y accesible.

#### Acceptance Criteria

1. WHEN la aplicación es desarrollada THEN el diseño SHALL seguir principio mobile-first con Tailwind CSS
2. WHEN un usuario accede desde cualquier dispositivo THEN el diseño SHALL ser completamente responsivo
3. WHEN la aplicación carga THEN SHALL incluir manifest.json para PWA
4. WHEN un usuario visita desde móvil THEN el navegador SHALL ofrecer opción de "Agregar a pantalla de inicio"
5. WHEN la aplicación es instalada como PWA THEN SHALL funcionar con ícono propio y pantalla de splash
6. WHEN la aplicación es PWA THEN SHALL preparar infraestructura para futuras notificaciones push
7. WHEN un usuario interactúa con la UI THEN todos los elementos SHALL ser táctiles y accesibles en pantallas pequeñas
8. WHEN se despliega en Vercel THEN el sistema SHALL aprovechar optimizaciones automáticas de Next.js para rendimiento


### Requirement 16: Gestión de Perfil de Usuario

**User Story:** Como usuario verificado, quiero editar ciertos datos de mi perfil, para mantener mi información actualizada sin necesidad de crear una nueva cuenta.

#### Acceptance Criteria

1. WHEN un usuario accede a su perfil THEN el sistema SHALL mostrar un botón de "Editar Perfil"
2. WHEN un estudiante edita su perfil THEN el sistema SHALL permitir modificar: alias público y número de WhatsApp
3. WHEN un especialista edita su perfil THEN el sistema SHALL permitir modificar: número de WhatsApp, CV, etiquetas de especialización, y estado académico
4. WHEN un usuario intenta editar datos críticos THEN el sistema SHALL prevenir la edición de: email, nombre real, y foto de CI
5. WHEN un usuario guarda cambios en el perfil THEN el sistema SHALL validar los datos antes de actualizar
6. WHEN un especialista cambia sus etiquetas THEN el sistema SHALL actualizar inmediatamente los contratos para los que recibe notificaciones
7. WHEN un usuario actualiza su número de WhatsApp THEN el sistema SHALL requerir una nueva verificación por parte del admin
8. WHEN cambios requieren verificación THEN el sistema SHALL notificar al admin y SHALL marcar el campo como "pendiente de verificación" hasta la confirmación

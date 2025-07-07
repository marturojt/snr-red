# SNR.red - Historias de Usuario

**Versión:** 1.0  
**Fecha:** 7 de Enero, 2025  
**Metodología:** Agile/Scrum con criterios de aceptación

---

## 📖 Introducción

Las historias de usuario de SNR.red están organizadas por **épicas** y **personas**, con criterios de aceptación claros y estimaciones de esfuerzo. Cada historia sigue el formato estándar:

**"Como [persona], quiero [funcionalidad] para [beneficio]"**

### Personas del Proyecto
- 👤 **Usuario Anónimo**: Persona que usa el servicio sin registrarse
- 🔵 **Usuario Free**: Usuario registrado con plan gratuito
- 🟡 **Usuario Premium**: Usuario con suscripción de pago
- 🔴 **Administrador**: Usuario con permisos de gestión del sistema

### Estados de Implementación
- ✅ **Implementado**: Funcionalidad completada y probada
- 🔄 **En Progreso**: Actualmente en desarrollo
- ⏳ **Planificado**: En el backlog, próxima implementación
- 🔮 **Futuro**: Planificado para versiones posteriores

---

## 🏗️ Épica 1: Gestión de URLs

### Historia 1.1: Acortar URL como Usuario Anónimo ✅
**Como** usuario anónimo,  
**quiero** acortar una URL larga,  
**para** compartirla de forma más fácil y limpia.

**Criterios de Aceptación:**
- [ ] Puedo pegar una URL válida en el campo de entrada
- [ ] El sistema genera automáticamente un código corto único
- [ ] Recibo la URL acortada inmediatamente
- [ ] La URL generada funciona correctamente al hacer clic
- [ ] El código corto tiene 6-8 caracteres alfanuméricos
- [ ] Se genera un QR code automáticamente

**Estimación:** 5 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 1.2: Código Personalizado ✅
**Como** usuario registrado,  
**quiero** crear un código personalizado para mi URL,  
**para** que sea más memorable y profesional.

**Criterios de Aceptación:**
- [ ] Puedo especificar un código personalizado opcional
- [ ] El sistema valida que el código no esté en uso
- [ ] Solo acepta caracteres alfanuméricos y guiones
- [ ] Longitud mínima de 3 caracteres, máxima de 20
- [ ] Muestra error si el código ya existe

**Estimación:** 3 puntos  
**Prioridad:** Media  
**Estado:** ✅ Implementado

### Historia 1.3: Gestión de URLs Personales ✅
**Como** usuario registrado,  
**quiero** ver todas mis URLs acortadas,  
**para** poder gestionar y organizar mis enlaces.

**Criterios de Aceptación:**
- [ ] Veo lista de todas mis URLs con información básica
- [ ] Puedo ordenar por fecha, clics, o nombre
- [ ] Puedo buscar por URL original o código corto
- [ ] Puedo editar el título y descripción
- [ ] Puedo desactivar/activar URLs
- [ ] Puedo eliminar URLs que ya no necesito

**Estimación:** 8 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 1.4: Protección por Contraseña 🔮
**Como** usuario premium,  
**quiero** proteger mis URLs con contraseña,  
**para** controlar quién puede acceder al contenido.

**Criterios de Aceptación:**
- [ ] Puedo agregar contraseña opcional al crear URL
- [ ] Los visitantes deben ingresar contraseña antes de redirigir
- [ ] Puedo cambiar o remover la contraseña después
- [ ] La página de contraseña tiene branding personalizable
- [ ] Registro intentos fallidos de contraseña

**Estimación:** 13 puntos  
**Prioridad:** Baja  
**Estado:** 🔮 Futuro

---

## 🔐 Épica 2: Autenticación y Usuarios

### Historia 2.1: Registro de Usuario ✅
**Como** visitante,  
**quiero** crear una cuenta,  
**para** acceder a funcionalidades adicionales.

**Criterios de Aceptación:**
- [ ] Puedo registrarme con email y contraseña
- [ ] El sistema valida formato de email
- [ ] Contraseña debe tener al menos 8 caracteres
- [ ] Recibo confirmación de registro exitoso
- [ ] Soy redirigido automáticamente al dashboard
- [ ] El plan inicial es "free"

**Estimación:** 5 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 2.2: Inicio de Sesión ✅
**Como** usuario registrado,  
**quiero** iniciar sesión,  
**para** acceder a mis URLs y configuraciones.

**Criterios de Aceptación:**
- [ ] Puedo login con email y contraseña
- [ ] El sistema recuerda mi sesión por 7 días
- [ ] Recibo mensaje de error si credenciales incorrectas
- [ ] Soy redirigido a la página que intentaba acceder
- [ ] Puedo cerrar sesión desde cualquier página

**Estimación:** 3 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 2.3: Gestión de Perfil ✅
**Como** usuario registrado,  
**quiero** editar mi perfil,  
**para** mantener actualizada mi información.

**Criterios de Aceptación:**
- [ ] Puedo cambiar mi nombre
- [ ] Puedo cambiar mi contraseña
- [ ] Debo confirmar contraseña actual para cambios
- [ ] Puedo ver mi plan actual
- [ ] Puedo ver estadísticas básicas de mi cuenta

**Estimación:** 5 puntos  
**Prioridad:** Media  
**Estado:** ✅ Implementado

### Historia 2.4: Upgrade a Premium ⏳
**Como** usuario free,  
**quiero** actualizar a plan premium,  
**para** acceder a funcionalidades avanzadas.

**Criterios de Aceptación:**
- [ ] Veo comparación clara entre planes
- [ ] Puedo iniciar proceso de pago con Stripe
- [ ] Recibo confirmación de upgrade exitoso
- [ ] Acceso inmediato a funcionalidades premium
- [ ] Recibo factura por email
- [ ] Puedo cancelar suscripción en cualquier momento

**Estimación:** 21 puntos  
**Prioridad:** Alta  
**Estado:** ⏳ Planificado (Fase 4)

---

## 📊 Épica 3: Analytics y Reportes

### Historia 3.1: Estadísticas Básicas ✅
**Como** usuario registrado,  
**quiero** ver estadísticas de mis URLs,  
**para** entender su rendimiento.

**Criterios de Aceptación:**
- [ ] Veo número total de clics por URL
- [ ] Veo fecha del último clic
- [ ] Veo gráfico simple de clics en el tiempo
- [ ] Puedo filtrar por rango de fechas
- [ ] Información se actualiza en tiempo real

**Estimación:** 8 puntos  
**Prioridad:** Media  
**Estado:** ✅ Implementado

### Historia 3.2: Analytics Avanzados ⏳
**Como** usuario premium,  
**quiero** ver analytics detallados,  
**para** tomar decisiones informadas sobre mi contenido.

**Criterios de Aceptación:**
- [ ] Veo ubicación geográfica de visitantes
- [ ] Veo tipos de dispositivos (móvil, desktop, tablet)
- [ ] Veo navegadores utilizados
- [ ] Veo fuentes de referencia (social, search, direct)
- [ ] Puedo exportar datos en CSV/PDF
- [ ] Gráficos interactivos con drill-down

**Estimación:** 21 puntos  
**Prioridad:** Alta  
**Estado:** ⏳ Planificado (Fase 3)

### Historia 3.3: Reportes Programados 🔮
**Como** usuario premium,  
**quiero** recibir reportes automáticos,  
**para** estar informado sin revisar manualmente.

**Criterios de Aceptación:**
- [ ] Puedo configurar reportes semanales/mensuales
- [ ] Reportes incluyen métricas clave y tendencias
- [ ] Recibo reportes por email en PDF
- [ ] Puedo personalizar qué métricas incluir
- [ ] Puedo pausar/reanudar reportes

**Estimación:** 13 puntos  
**Prioridad:** Baja  
**Estado:** 🔮 Futuro

---

## 🎨 Épica 4: Códigos QR

### Historia 4.1: Generación Automática de QR ✅
**Como** usuario,  
**quiero** que se genere automáticamente un QR code,  
**para** poder compartir la URL fácilmente.

**Criterios de Aceptación:**
- [ ] Cada URL genera automáticamente un QR code
- [ ] Puedo descargar el QR en formato PNG
- [ ] El QR code funciona correctamente al escanearlo
- [ ] Tamaño predeterminado apropiado para impresión
- [ ] QR code se genera inmediatamente al crear URL

**Estimación:** 5 puntos  
**Prioridad:** Media  
**Estado:** ✅ Implementado

### Historia 4.2: Personalización de QR 🔮
**Como** usuario premium,  
**quiero** personalizar el diseño del QR code,  
**para** que coincida con mi marca.

**Criterios de Aceptación:**
- [ ] Puedo cambiar colores del QR code
- [ ] Puedo agregar logo en el centro
- [ ] Puedo elegir diferentes tamaños
- [ ] Puedo previsualizar cambios antes de guardar
- [ ] Puedo descargar en múltiples formatos (PNG, SVG, PDF)

**Estimación:** 13 puntos  
**Prioridad:** Baja  
**Estado:** 🔮 Futuro

---

## 👨‍💼 Épica 5: Administración

### Historia 5.1: Dashboard de Admin ✅
**Como** administrador,  
**quiero** ver métricas generales del sistema,  
**para** monitorear la salud de la plataforma.

**Criterios de Aceptación:**
- [ ] Veo número total de usuarios, URLs, y clics
- [ ] Veo estadísticas de crecimiento
- [ ] Veo URLs más populares
- [ ] Veo usuarios más activos
- [ ] Veo métricas en tiempo real
- [ ] Puedo filtrar por períodos de tiempo

**Estimación:** 13 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 5.2: Gestión de Usuarios ✅
**Como** administrador,  
**quiero** gestionar usuarios del sistema,  
**para** mantener la plataforma segura y funcional.

**Criterios de Aceptación:**
- [ ] Puedo ver lista de todos los usuarios
- [ ] Puedo buscar usuarios por email o nombre
- [ ] Puedo filtrar por plan y estado
- [ ] Puedo editar información de usuario
- [ ] Puedo cambiar plan de usuario
- [ ] Puedo desactivar/activar usuarios
- [ ] Puedo promover usuarios a admin

**Estimación:** 21 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 5.3: Moderación de URLs ✅
**Como** administrador,  
**quiero** moderar URLs del sistema,  
**para** prevenir abuso y contenido inapropiado.

**Criterios de Aceptación:**
- [ ] Puedo ver todas las URLs del sistema
- [ ] Puedo buscar por URL original o código
- [ ] Puedo desactivar URLs problemáticas
- [ ] Puedo ver estadísticas de cada URL
- [ ] Puedo filtrar por estado y tipo de usuario
- [ ] Puedo eliminar URLs permanentemente

**Estimación:** 13 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 5.4: Moderación Automática ⏳
**Como** administrador,  
**quiero** que el sistema detecte automáticamente contenido problemático,  
**para** reducir la carga de moderación manual.

**Criterios de Aceptación:**
- [ ] Sistema detecta URLs de malware/phishing
- [ ] Blacklist de dominios peligrosos
- [ ] Alertas automáticas para URLs sospechosas
- [ ] Queue de moderación para revisión manual
- [ ] Logs de acciones de moderación automática

**Estimación:** 21 puntos  
**Prioridad:** Media  
**Estado:** ⏳ Planificado (Fase 5)

---

## 💰 Épica 6: Pagos y Suscripciones

### Historia 6.1: Checkout Premium ⏳
**Como** usuario free,  
**quiero** un proceso de pago simple,  
**para** actualizar rápidamente a premium.

**Criterios de Aceptación:**
- [ ] Proceso de checkout claro y seguro
- [ ] Integración con Stripe
- [ ] Soporte para tarjetas de crédito principales
- [ ] Confirmación inmediata de pago
- [ ] Activación automática de beneficios premium
- [ ] Recibo de pago por email

**Estimación:** 21 puntos  
**Prioridad:** Alta  
**Estado:** ⏳ Planificado (Fase 4)

### Historia 6.2: Gestión de Suscripción ⏳
**Como** usuario premium,  
**quiero** gestionar mi suscripción,  
**para** tener control sobre mis pagos.

**Criterios de Aceptación:**
- [ ] Puedo ver detalles de mi suscripción actual
- [ ] Puedo cambiar método de pago
- [ ] Puedo cancelar suscripción
- [ ] Puedo reactivar suscripción cancelada
- [ ] Veo historial de pagos
- [ ] Recibo notificaciones de próximos pagos

**Estimación:** 13 puntos  
**Prioridad:** Media  
**Estado:** ⏳ Planificado (Fase 4)

### Historia 6.3: Facturación Automática ⏳
**Como** usuario premium,  
**quiero** renovación automática de mi plan,  
**para** no perder acceso a funcionalidades.

**Criterios de Aceptación:**
- [ ] Renovación automática mensual/anual
- [ ] Notificación 3 días antes del pago
- [ ] Manejo de pagos fallidos con reintentos
- [ ] Período de gracia de 3 días
- [ ] Downgrade automático si no se puede cobrar
- [ ] Facturas detalladas por email

**Estimación:** 21 puntos  
**Prioridad:** Media  
**Estado:** ⏳ Planificado (Fase 4)

---

## 🔧 Épica 7: Configuración y Preferencias

### Historia 7.1: Configuración de Usuario ⏳
**Como** usuario registrado,  
**quiero** personalizar mi experiencia,  
**para** usar la plataforma según mis preferencias.

**Criterios de Aceptación:**
- [ ] Puedo elegir tema (claro/oscuro)
- [ ] Puedo configurar notificaciones por email
- [ ] Puedo establecer zona horaria
- [ ] Puedo configurar idioma de la interfaz
- [ ] Cambios se aplican inmediatamente
- [ ] Configuración se sincroniza entre dispositivos

**Estimación:** 8 puntos  
**Prioridad:** Baja  
**Estado:** ⏳ Planificado (Fase 6)

### Historia 7.2: Configuración de URLs ⏳
**Como** usuario premium,  
**quiero** establecer configuraciones predeterminadas,  
**para** acelerar la creación de URLs.

**Criterios de Aceptación:**
- [ ] Puedo establecer configuración por defecto
- [ ] Incluye título, descripción, y etiquetas
- [ ] Puedo crear plantillas de configuración
- [ ] Configuración se aplica a nuevas URLs
- [ ] Puedo sobrescribir configuración por URL

**Estimación:** 13 puntos  
**Prioridad:** Baja  
**Estado:** ⏳ Planificado (Fase 6)

---

## 🌐 Épica 8: API y Integraciones

### Historia 8.1: API Pública 🔮
**Como** desarrollador,  
**quiero** acceder a una API pública,  
**para** integrar el acortador en mi aplicación.

**Criterios de Aceptación:**
- [ ] Endpoints RESTful para crear/gestionar URLs
- [ ] Autenticación con API keys
- [ ] Rate limiting apropiado
- [ ] Documentación completa con ejemplos
- [ ] SDKs para lenguajes populares
- [ ] Sandbox para pruebas

**Estimación:** 34 puntos  
**Prioridad:** Baja  
**Estado:** 🔮 Futuro (Fase 7)

### Historia 8.2: Webhooks 🔮
**Como** desarrollador,  
**quiero** recibir notificaciones de eventos,  
**para** mantener mi aplicación sincronizada.

**Criterios de Aceptación:**
- [ ] Webhooks para eventos de URLs (clic, creación, eliminación)
- [ ] Configuración de endpoints desde UI
- [ ] Reintentos automáticos en caso de fallo
- [ ] Logs de entregas de webhooks
- [ ] Verificación de firma para seguridad

**Estimación:** 21 puntos  
**Prioridad:** Baja  
**Estado:** 🔮 Futuro (Fase 7)

---

## 📱 Épica 9: Experiencia Mobile

### Historia 9.1: Responsive Design ✅
**Como** usuario móvil,  
**quiero** que la aplicación funcione bien en mi dispositivo,  
**para** poder usarla desde cualquier lugar.

**Criterios de Aceptación:**
- [ ] Interfaz se adapta a pantallas pequeñas
- [ ] Navegación optimizada para touch
- [ ] Carga rápida en conexiones lentas
- [ ] Funcionalidades principales accesibles
- [ ] Texto legible sin zoom

**Estimación:** 8 puntos  
**Prioridad:** Alta  
**Estado:** ✅ Implementado

### Historia 9.2: PWA (Progressive Web App) ⏳
**Como** usuario frecuente,  
**quiero** instalar la aplicación en mi dispositivo,  
**para** acceso rápido sin navegador.

**Criterios de Aceptación:**
- [ ] Puede instalarse desde navegador
- [ ] Funciona offline para funciones básicas
- [ ] Notificaciones push para eventos importantes
- [ ] Icono en home screen
- [ ] Splash screen personalizada

**Estimación:** 21 puntos  
**Prioridad:** Media  
**Estado:** ⏳ Planificado (Fase 6)

---

## 🔍 Épica 10: Búsqueda y Filtrado

### Historia 10.1: Búsqueda Básica ✅
**Como** usuario con muchas URLs,  
**quiero** buscar mis enlaces,  
**para** encontrar rápidamente lo que necesito.

**Criterios de Aceptación:**
- [ ] Puedo buscar por URL original
- [ ] Puedo buscar por código corto
- [ ] Puedo buscar por título/descripción
- [ ] Búsqueda es case-insensitive
- [ ] Resultados se actualizan mientras escribo

**Estimación:** 5 puntos  
**Prioridad:** Media  
**Estado:** ✅ Implementado

### Historia 10.2: Filtros Avanzados ⏳
**Como** usuario premium,  
**quiero** filtrar mis URLs por múltiples criterios,  
**para** organizar mejor mi contenido.

**Criterios de Aceptación:**
- [ ] Filtro por rango de fechas
- [ ] Filtro por número de clics
- [ ] Filtro por estado (activo/inactivo)
- [ ] Filtro por etiquetas
- [ ] Combinación de múltiples filtros
- [ ] Guardar filtros favoritos

**Estimación:** 13 puntos  
**Prioridad:** Media  
**Estado:** ⏳ Planificado (Fase 6)

---

## 📚 Criterios de Aceptación Generales

### Criterios Técnicos Transversales
- [ ] **Performance**: Páginas cargan en <3 segundos
- [ ] **Accesibilidad**: Cumple estándares WCAG 2.1 AA
- [ ] **SEO**: Meta tags apropiados y estructura semántica
- [ ] **Seguridad**: Validación en frontend y backend
- [ ] **Cross-browser**: Funciona en Chrome, Firefox, Safari, Edge
- [ ] **Responsive**: Funciona en móvil, tablet, desktop

### Criterios de UX
- [ ] **Feedback**: Mensajes claros de éxito/error
- [ ] **Loading**: Indicadores de carga para operaciones lentas
- [ ] **Confirmación**: Dialogs para acciones destructivas
- [ ] **Navegación**: Breadcrumbs y navegación clara
- [ ] **Help**: Tooltips y documentación contextual

---

## 🎯 Priorización por Valor de Negocio

### Prioridad 1 (MVP - Implementado)
- [x] Acortamiento básico de URLs
- [x] Registro y login de usuarios
- [x] Gestión básica de URLs
- [x] Analytics básicos
- [x] Panel de administración

### Prioridad 2 (Próximas 8 semanas)
- [ ] Analytics avanzados con gráficos
- [ ] Integración de pagos con Stripe
- [ ] Moderación automática básica
- [ ] Configuración de usuario

### Prioridad 3 (Próximos 6 meses)
- [ ] PWA y experiencia mobile mejorada
- [ ] Funcionalidades premium avanzadas
- [ ] API pública con documentación
- [ ] Integraciones con terceros

### Prioridad 4 (Futuro)
- [ ] Personalización avanzada de QR
- [ ] Análisis con machine learning
- [ ] Funcionalidades enterprise
- [ ] Internacionalización

---

## 📊 Métricas de Éxito

### Métricas por Historia
```yaml
Acortamiento_URLs:
  - urls_created_per_day: >100
  - success_rate: >99%
  - average_response_time: <500ms

Registro_Usuarios:
  - conversion_rate: >15%
  - completion_rate: >90%
  - time_to_complete: <2min

Premium_Upgrade:
  - conversion_rate: >5%
  - churn_rate: <10%
  - customer_lifetime_value: >$50

Analytics:
  - daily_active_users: >70%
  - feature_adoption: >60%
  - data_accuracy: >95%
```

### Métricas de Satisfacción
```yaml
User_Satisfaction:
  - nps_score: >50
  - support_tickets: <5%
  - user_retention_30d: >80%

Technical_Performance:
  - uptime: >99.9%
  - error_rate: <1%
  - page_load_time: <3s
```

---

## 🔄 Proceso de Validación

### Definition of Done
Cada historia debe cumplir:
- [ ] Criterios de aceptación completados
- [ ] Código reviewed y aprobado
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Documentación actualizada
- [ ] Deployment exitoso en staging
- [ ] Validación de stakeholders
- [ ] Métricas de performance cumplidas

### Proceso de Testing
```yaml
Testing_Strategy:
  - unit_tests: >80% coverage
  - integration_tests: happy_path + error_cases
  - e2e_tests: critical_user_journeys
  - performance_tests: load + stress
  - security_tests: penetration + vulnerability
  - usability_tests: user_interviews + a/b_testing
```

---

**Estado del documento:** ✅ Completo  
**Próxima revisión:** Al finalizar cada Sprint  
**Versión:** 1.0-complete-user-stories  
**Total historias:** 31 (8 implementadas, 23 pendientes)

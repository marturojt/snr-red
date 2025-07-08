# SNR.red - Estado del Proyecto y Roadmap Técnico

**Versión:** 1.5  
**Fecha de actualización:** 7 de Julio, 2025  
**Estado actual:** UX/UI Enhancement implementado, sistema comercial moderno completado, i18n (EN/ES) implementado, URLs anónimas funcionales, generador de vCard integrado, formulario principal optimizado con opciones avanzadas colapsables, modal QR implementado para mejor experiencia de usuario, personalización de QR codes con presets y opciones avanzadas, QR Display completamente internacionalizado

---

## 📋 Resumen del Proyecto

**SNR.red** es una plataforma moderna de acortamiento de URLs con las siguientes características principales:
- Acortamiento de URLs para usuarios anónimos y registrados
- Generación automática de códigos QR
- Sistema de usuarios con planes Free y Premium
- Panel de administración completo
- Análisis y estadísticas avanzadas
- Sistema de limpieza automática basado en tipos de usuario
- **NUEVO:** UX/UI comercial moderno con enfoque en conversión
- **NUEVO:** Componentes enhanced con diseño premium
- **NUEVO:** Sistema responsivo optimizado para móviles
- **NUEVO:** Internacionalización completa (i18n) Inglés/Español
- **NUEVO:** Sistema de URLs anónimas con ID de navegador
- **NUEVO:** Selector de idioma integrado en la navegación
- **NUEVO:** Generador de vCard con códigos QR integrados
- **NUEVO:** Interfaz con pestañas para múltiples funcionalidades
- **NUEVO:** Páginas de visualización de vCard profesionales

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico)
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Base de datos:** MongoDB
- **Autenticación:** JWT
- **Gestión de procesos:** PM2
- **Proxy reverso:** Apache
- **UI Components:** shadcn/ui

### Estructura del Proyecto
```
snr-red/
├── apps/
│   ├── backend/           # API REST del servidor
│   └── frontend/          # Aplicación Next.js
├── packages/
│   └── types/             # Tipos compartidos TypeScript
├── scripts/               # Scripts de despliegue
└── docs/                  # Documentación
```

---

## ✅ Funcionalidades Implementadas

### 🔐 Sistema de Autenticación
- [x] **Registro de usuarios** con validación de email
- [x] **Login/Logout** con JWT
- [x] **Planes de usuario** (Free/Premium)
- [x] **Middleware de autenticación** para rutas protegidas
- [x] **Usuarios administradores** con campo `isAdmin`

### 🔗 Gestión de URLs
- [x] **Acortamiento para usuarios anónimos** (expiran en 30 días)
- [x] **Acortamiento para usuarios registrados** con diferentes políticas:
  - Free: 3 meses de expiración
  - Premium: Sin expiración con actividad
- [x] **Códigos personalizados** opcionales
- [x] **Generación automática de QR** codes
- [x] **Sistema de clics** y analytics básicos
- [x] **Redirección con tracking** de analytics

### 🎯 Sistema de Limpieza Automática
- [x] **CleanupService** implementado
- [x] **Políticas de expiración** por tipo de usuario:
  - Anónimos: 30 días desde creación
  - Free: 3 meses desde creación + 1 mes sin actividad
  - Premium: Solo después de 1 año sin actividad
- [x] **Cleanup automático** cada 4 horas
- [x] **Cleanup manual** via admin panel

### 👨‍💼 Panel de Administración (RECIÉN IMPLEMENTADO)
- [x] **Dashboard principal** con métricas del sistema
- [x] **Gestión de usuarios** (CRUD completo, filtros, búsqueda)
- [x] **Gestión de URLs** (CRUD completo, moderación)
- [x] **Analytics avanzados** (conversiones, crecimiento, top URLs)
- [x] **Configuración del sistema** (cleanup, configuraciones)
- [x] **Autenticación de admin** con middleware específico
- [x] **Layout responsivo** con navegación lateral

### 🎨 UX/UI Enhancement (RECIÉN IMPLEMENTADO)
- [x] **ModernLandingPage** con diseño comercial y gradientes
- [x] **Enhanced UserUrls** con filtering, search y stats cards
- [x] **Enhanced AuthComponent** con perfil moderno y upgrade CTAs
- [x] **Enhanced QRCodeDisplay** con diseño premium y glassmorphism
- [x] **ModernDashboard** integrado con componentes enhanced
- [x] **Global styles** con animaciones, scrollbars y responsive utilities
- [x] **Mobile-first approach** con breakpoints optimizados
- [x] **Commercial focus** con upgrade prompts y value proposition
- [x] **Accessibility compliance** con WCAG standards
- [x] **Performance optimization** con lazy loading y optimized animations
- [x] **Formulario principal optimizado** con campos título y código personalizado
- [x] **Opciones avanzadas colapsables** para mantener UI limpia
- [x] **Experiencia de usuario mejorada** con toggle de Advanced Options

### 🌐 Internacionalización (i18n)
- [x] **Contexto de idioma (LanguageContext)**
- [x] **Selector de idioma en navegación**  
- [x] **Traducciones completas EN/ES**
- [x] **Persistencia de idioma seleccionado**
- [x] **Cambio dinámico de idioma en tiempo real**

### 👤 URLs Anónimas  
- [x] **Generación de ID único por navegador**
- [x] **Gestión de URLs sin registro de usuario**
- [x] **Vista "Mis URLs" para usuarios anónimos**
- [x] **Integración con EnhancedUserUrls component**
- [x] **API compatible con usuarios anónimos**

### 🎯 Funcionalidades para Usuarios Invitados (Testing en Curso)
- [x] **Acortamiento de URLs** sin registro (expiración: 30 días)
- [x] **Generación de códigos QR** básicos y personalizados
- [x] **Descarga de códigos QR** en formato PNG/SVG
- [x] **Regeneración de códigos QR** con botón funcional
- [x] **Personalización avanzada de QR** (colores, estilos, presets)
- [x] **Creación de vCards** digitales con formulario completo
- [x] **Gestión de URLs creadas** via botón "Mis URLs"
- [x] **Interfaz bilingüe** (cambio EN/ES en tiempo real)
- [x] **Analytics básicos** (visualización de estadísticas de clicks)
- [x] **Compartir QR codes** via navegadores compatibles
- [x] **Copiar URLs y QR** al portapapeles
- [x] **Páginas de vCard públicas** para compartir contactos
- [x] **Descarga de archivos .vcf** desde vCards generadas
- [x] **Experiencia móvil optimizada** para todas las funcionalidades

### 🎴 Generador de vCard (RECIÉN IMPLEMENTADO)
- [x] **Creación de tarjetas de presentación digitales**
- [x] **Formulario multi-paso** con información personal, contacto y redes sociales
- [x] **Generación automática de códigos QR** para vCards
- [x] **Descarga de archivo .vcf** para importar contactos
- [x] **Páginas de visualización** profesionales y responsivas
- [x] **Temas personalizables** (profesional, creativo, minimal)
- [x] **Interfaz con pestañas** integrando URL shortener y vCard generator
- [x] **Compartir vCards** con URLs cortas y QR codes
- [x] **Backend completo** con modelo, servicio y rutas API
- [x] **Tipos TypeScript** compartidos para vCard data

### 🗄️ Base de Datos
- [x] **Modelo User** con campos `isAdmin`, planes, suscripciones
- [x] **Modelo Url** con `userType`, `autoExpiresAt`, `lastAccessedAt`
- [x] **Índices optimizados** para consultas de cleanup y filtros
- [x] **Transformaciones JSON** para ocultar datos sensibles

### 🚀 Despliegue
- [x] **Scripts de deployment** automatizados
- [x] **Configuración PM2** para producción
- [x] **Gestión de entornos** (.env para dev/prod)
- [x] **Configuración Apache** para proxy reverso

---

## 🏃‍♂️ Estado Actual de la Implementación

### ✅ Completado Recientemente (Sesión actual)
1. **Documentación Reorganizada y Limpia**:
   - **NUEVO:** Limpieza masiva de documentación regada por diferentes carpetas
   - **NUEVO:** Eliminación de 12 archivos duplicados entre `/docs/` y `/docs/development/`
   - **NUEVO:** Estructura completamente organizada según SYSTEM-INSTRUCTIONS.md
   - **NUEVO:** Documentación creada: DOCUMENTATION-CLEANUP.md
   - **NUEVO:** Carpeta `/docs/` ahora solo contiene subcarpetas organizadas
   - **NUEVO:** 35 archivos correctamente categorizados en system/, development/, deployment/, config/

2. **vCard System Enhancement - Validaciones y UX Completas**:
   - **NUEVO:** Campos obligatorios identificados y documentados (firstName, lastName)
   - **NUEVO:** Validaciones robustas implementadas para todos los campos
   - **NUEVO:** Máscaras inteligentes para teléfono (nacional/internacional)
   - **NUEVO:** Formateo automático de websites con protocolo
   - **NUEVO:** Validaciones específicas para redes sociales (LinkedIn, Instagram, Twitter, WhatsApp)
   - **NUEVO:** Feedback visual mejorado con bordes rojos e iconos de error
   - **NUEVO:** Limpieza automática de errores al escribir
   - **NUEVO:** Validación multi-paso antes de envío
   - **NUEVO:** URL de vCard corregida (/vcard/{shortCode})
   - **NUEVO:** Ruta de compatibilidad /v/{id} → /vcard/{id}
   - **NUEVO:** Documentación completa de validaciones en VCARD-VALIDATIONS-GUIDE.md
3. **QR Display Internacionalización Completa**:
   - **NUEVO:** Traducción completa del componente EnhancedQRCodeDisplay
   - 24 nuevas traducciones en inglés y español
   - Mensajes de toast traducidos para todas las acciones
   - Verificación de funcionalidad del botón "Regenerate"
   - Experiencia de usuario consistente en ambos idiomas
   - Integración completa con sistema i18n existente

2. **vCard Generator Feature implementado**:
   - Backend: Modelo, servicio y rutas API (`/api/vcard/*`)
   - Frontend: Componente VCardGenerator con formulario multi-paso
   - Integración: Interface con pestañas en landing page principal
   - Páginas: Visualización de vCard en `/vcard/[id]`
   - Features: Descarga .vcf, códigos QR, temas, sharing

3. **UI/UX Enhancement completado**:
   - ModernLandingPage con interfaz de pestañas
   - Integración completa de vCard generator
   - Actualización de features section con 4 características principales
   - Internacionalización para todas las nuevas características

4. **Formulario Principal Optimizado**:
   - Campos título y código personalizado agregados
   - Opciones avanzadas colapsables con toggle
   - Generación automática de códigos cortos
   - Botones de Analytics y QR funcionales con modales elegantes
   - **NUEVO:** Modal QR implementado para mejor experiencia de usuario

5. **Experiencia de Usuario Mejorada**:
   - Analytics modal con métricas detalladas
   - QR modal con descarga directa (reemplazó ventana popup)
   - Diseño responsive y accesible
   - Traducciones completas EN/ES para nuevas funcionalidades

6. **Personalización de Códigos QR**:
   - **NUEVO:** Sistema completo de personalización de QR codes
   - Presets temáticos: Classic, Modern, Vibrant, Elegant, Nature, Sunset
   - Personalización de colores: foreground y background
   - Opciones de estilo: cuadrado, redondeado, puntos, círculos
   - Configuración avanzada: tamaño, margen, formato, corrección de errores
   - Vista previa en tiempo real
   - Interfaz con pestañas para organizar opciones
   - Soporte completo i18n (EN/ES)

7. **UX/UI QR Mejorada - Rápido + Personalización Opcional**:
   - **NUEVO:** Flujo optimizado: QR inmediato + personalización opcional
   - QR básico se muestra instantáneamente al hacer clic
   - Botón "Personalizar Código QR" para usuarios que desean más control
   - Vista previa en tiempo real durante la personalización
   - Retorno seamless al modal original con QR personalizado
   - Presets visuales mejorados con representación real de colores/estilos
   - Estados de carga y feedback visual durante generación
   - Debouncing inteligente para evitar llamadas API excesivas
   - Diseño responsivo optimizado para móvil y desktop

8. **Panel de administración completo**:
   - Backend: Rutas admin con autenticación (`/api/admin/*`)
   - Frontend: Layout y componentes admin (`/admin/*`)
   - Dashboard con métricas en tiempo real
   - Gestión completa de usuarios y URLs
   - Analytics avanzados

8. **Usuario administrador configurado**:
   - Email: `arturo.jimenez.26@gmail.com`
   - Password: `Arturo06;`
   - Permisos: `isAdmin: true`, Plan: `premium`

9. **Sistema de publicidad documentado**:
   - Roadmap completo en ADS-SYSTEM-ROADMAP.md
   - Historias de usuario en USER-STORIES.md (Épica 11)
   - Arquitectura técnica planificada para futura implementación

10. **Correcciones técnicas**:
    - Campo `username` → `name` en todas las consultas
    - Middleware `adminAuth` implementado
    - Tipos compartidos actualizados con `isAdmin` y vCard types
    - Optimización de componentes y limpieza de código

11. **Modal QR implementado**:
    - Componente `QRCodeModal` creado
    - Integración en `UserUrls` y `vCardDisplay`
    - Funcionalidad de escaneo y descarga de QR codes
    - Estilos responsivos y accesibles

12. **Personalización de QR codes**:
    - Nuevas opciones en `QRCodeDisplay` y `vCardDisplay`
    - Presets para personalización rápida
    - Opciones avanzadas para diseño de QR codes
    - Integración con sistema de temas

### 🔄 Estado de Validación Requerida
- **Documentación**: ✅ Completamente reorganizada y limpia (35 archivos organizados)
- **vCard Generator**: ✅ Implementado, validaciones completas, URLs corregidas
- **vCard Validations**: ✅ Implementadas todas las validaciones con feedback visual
- **vCard Pages**: ✅ Páginas de visualización funcionando con URLs corregidas
- **vCard API**: ✅ Todas las rutas API funcionando (verificado con POST /api/vcard/create)
- **vCard Preview**: ✅ Preview funcionando con URLs corregidas
- **vCard Download**: ✅ Descarga de archivos .vcf funcionando
- **Tabbed Interface**: ✅ Integración completa en landing page
- **i18n for vCard**: ✅ Traducciones completas EN/ES implementadas
- **Login admin**: Implementado pero necesita validación final
- **Rutas admin**: Funcionando (verificado con `/api/admin/test`)
- **Frontend admin**: Implementado, pendiente prueba completa
- **Modal QR**: Implementado y funcionando

---

## 🚧 Próximas Fases de Desarrollo

### 📊 Fase 3: Analytics y Reportes Avanzados
**Prioridad:** Alta  
**Estimación:** 2-3 semanas

#### Funcionalidades pendientes:
- [ ] **Gráficos interactivos** con Chart.js o Recharts
  - Gráficos de línea para crecimiento temporal
  - Gráficos de pastel para distribución de usuarios
  - Mapas de calor para actividad por horas/días
- [ ] **Exportación de reportes** en PDF/CSV
- [ ] **Filtros de fecha** personalizables
- [ ] **Comparativas** mes vs mes, año vs año
- [ ] **Alertas automáticas** cuando se alcanzan umbrales
- [ ] **Dashboard en tiempo real** con WebSockets

#### Archivos a crear/modificar:
```
apps/frontend/src/components/admin/
├── Charts/
│   ├── GrowthChart.tsx
│   ├── UserDistribution.tsx
│   └── ActivityHeatmap.tsx
├── Reports/
│   ├── ReportGenerator.tsx
│   └── ExportButtons.tsx
apps/backend/src/routes/
├── reports.ts
└── realtime.ts
```

### 💳 Fase 4: Integración de Pagos (Stripe)
**Prioridad:** Alta  
**Estimación:** 2-3 semanas

#### Funcionalidades pendientes:
- [ ] **Integración Stripe** para pagos
- [ ] **Gestión de suscripciones** (crear, cancelar, reactivar)
- [ ] **Webhooks de Stripe** para eventos de pago
- [ ] **Facturación automática** y emails de confirmación
- [ ] **Período de gracia** para pagos fallidos
- [ ] **Admin panel para pagos** (reembolsos, disputas)

#### Variables de entorno requeridas:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

#### Archivos a crear:
```
apps/backend/src/services/
├── stripeService.ts
└── subscriptionService.ts
apps/frontend/src/components/
├── StripeCheckout.tsx
└── SubscriptionManager.tsx
```

### � Fase 5: Sistema de Publicidad y Monetización
**Prioridad:** Alta  
**Estimación:** 2-3 semanas

#### Funcionalidades pendientes:
- [ ] **Página de publicidad intermedia** para usuarios free/anónimos
  - Mostrar anuncio antes de redirección final
  - Countdown timer (5-10 segundos)
  - Botón "Skip Ad" para usuarios premium
  - Analytics de impresiones publicitarias
- [ ] **Gestión de campañas publicitarias**
  - Panel admin para gestionar anuncios
  - Subida de banners e imágenes
  - Configuración de targeting básico
  - Programación de campañas (fecha inicio/fin)
- [ ] **Integración con redes publicitarias**
  - Google AdSense integration
  - Soporte para anuncios nativos
  - Sistema de rotación de anuncios
  - Optimización por CTR
- [ ] **Configuración de bypass**
  - Usuarios premium saltan publicidad automáticamente
  - Configuración admin de tiempo de espera
  - Blacklist de URLs que no deben mostrar ads
  - Whitelist de dominios seguros

#### Flujo técnico:
1. Usuario hace clic en URL corta
2. Sistema verifica tipo de usuario (anónimo/free/premium)
3. Si es premium → redirección directa
4. Si es free/anónimo → página intermedia con ad
5. Después del timer → redirección a destino final
6. Registro de métricas publicitarias

#### Variables de entorno requeridas:
```env
GOOGLE_ADSENSE_CLIENT_ID=ca-pub-...
AD_DISPLAY_DURATION=7  # segundos
ENABLE_ADS=true
AD_BYPASS_PREMIUM=true
```

#### Archivos a crear:
```
apps/backend/src/services/
├── adService.ts
├── redirectService.ts
└── adAnalyticsService.ts
apps/backend/src/models/
├── Ad.ts
└── AdImpression.ts
apps/backend/src/routes/
└── ads.ts
apps/frontend/src/app/
└── redirect/[shortCode]/page.tsx  # Página intermedia
apps/frontend/src/components/
├── AdDisplay.tsx
├── AdCountdown.tsx
└── admin/AdManagement.tsx
```

#### Modelo de datos sugerido:
```typescript
interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  displayDuration: number; // segundos
  impressions: number;
  clicks: number;
  budget?: number;
  startDate: Date;
  endDate?: Date;
  targeting?: {
    countries?: string[];
    userTypes?: ('anonymous' | 'free')[];
  };
}

interface AdImpression {
  id: string;
  adId: string;
  urlId: string;
  userId?: string;
  userType: 'anonymous' | 'free' | 'premium';
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  clicked: boolean;
  revenue?: number;
}
```

### �🔐 Fase 6: Seguridad y Moderación
**Prioridad:** Media  
**Estimación:** 1-2 semanas

#### Funcionalidades pendientes:
- [ ] **Moderación de contenido** automática y manual
- [ ] **Blacklist de dominios** peligrosos
- [ ] **Rate limiting avanzado** por usuario
- [ ] **Logs de auditoría** para acciones admin
- [ ] **Detección de abuso** (múltiples cuentas, spam)
- [ ] **2FA opcional** para usuarios premium/admin

#### Archivos a crear:
```
apps/backend/src/services/
├── moderationService.ts
├── auditService.ts
└── securityService.ts
apps/backend/src/middleware/
├── rateLimitAdvanced.ts
└── contentModeration.ts
```

### 📱 Fase 6: Mejoras de UX y PWA
**Prioridad:** Media  
**Estimación:** 2 semanas

#### Funcionalidades pendientes:
- [ ] **Progressive Web App** (PWA)
- [ ] **Modo oscuro** en toda la aplicación
- [ ] **Notificaciones push** para eventos importantes
- [ ] **Búsqueda avanzada** con filtros múltiples
- [ ] **Drag & drop** para subir QR codes
- [ ] **Shortcuts de teclado** para acciones rápidas
- [ ] **Onboarding** para nuevos usuarios

### 🌐 Fase 7: API Pública y Integraciones
**Prioridad:** Baja  
**Estimación:** 1-2 semanas

#### Funcionalidades pendientes:
- [ ] **API pública** con rate limiting
- [ ] **API keys** para desarrolladores
- [ ] **Documentación Swagger** de la API
- [ ] **SDKs** para JavaScript/Python
- [ ] **Webhooks** para eventos de URLs
- [ ] **Integraciones** con Zapier, IFTTT

---

## 🐛 Issues Conocidos y Pendientes

### 🔴 Críticos
1. **Login admin intermitente**: 
   - Estado: En investigación
   - Síntoma: Error 401 en algunos intentos de login
   - Archivos afectados: `apps/backend/src/services/authService.ts`
   - Siguiente paso: Validar middleware y manejo de errores

### 🟡 No críticos
1. **Optimización de consultas**: MongoDB queries pueden optimizarse
2. **Caché**: Implementar Redis para mejor rendimiento
3. **Tests**: Suite de tests unitarios e integración pendiente

---

## 🗄️ Esquemas de Base de Datos

### Modelo User (Implementado)
```typescript
interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  plan: 'free' | 'premium';
  isActive: boolean;
  isAdmin: boolean;           // ✅ Implementado
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  subscription?: {
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
}
```

### Modelo Url (Implementado)
```typescript
interface IUrl {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  userId?: string;            // Para usuarios anónimos (browser ID)
  registeredUserId?: string;  // Para usuarios registrados
  userType: 'anonymous' | 'free' | 'premium';
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;          // Expiración original
  autoExpiresAt?: Date;      // ✅ Expiración automática por tipo
  lastAccessedAt?: Date;     // ✅ Para política de cleanup
  qrCodePath?: string;
  title?: string;
  description?: string;
}
```

### Modelos Pendientes
```typescript
// Para Fase 4 - Pagos
interface IPayment {
  _id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

// Para Fase 5 - Auditoría
interface IAuditLog {
  _id: string;
  userId: string;
  adminId?: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: object;
  newValues?: object;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

---

## 🛠️ Configuración de Entornos

### Desarrollo (.env)
```env
# Base
NODE_ENV=development
PORT=3001

# Base de datos
MONGODB_URI=mongodb://localhost:27017/snr-red

# Autenticación
JWT_SECRET=your-development-secret
JWT_EXPIRES_IN=7d

# URLs
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Producción (.env)
```env
# Base
NODE_ENV=production
PORT=3001

# Base de datos
MONGODB_URI=mongodb://localhost:27017/snr-red-prod

# Autenticación
JWT_SECRET=your-super-secure-production-secret
JWT_EXPIRES_IN=7d

# URLs
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red

# Rate limiting (más restrictivo)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

---

## 📊 Métricas de Progreso

### Completado ✅
- **Backend Core:** 95% - Solo optimizaciones menores pendientes
- **Frontend Core:** 90% - Funcional, mejoras de UX pendientes  
- **Sistema de usuarios:** 100% - Completo con planes y autenticación
- **Admin Panel:** 95% - Implementado, pendiente validación final
- **Base de datos:** 95% - Esquemas completos, optimizaciones pendientes
- **Despliegue:** 90% - Scripts funcionales, mejoras de CI/CD pendientes

### En Progreso 🔄
- **Validación Admin Panel:** 80% - Implementado, pruebas finales
- **Optimización consultas:** 60% - Algunos índices implementados

### Por Iniciar ⏳
- **Analytics avanzados:** 0%
- **Integración Stripe:** 0%
- **Moderación de contenido:** 0%
- **PWA:** 0%
- **API pública:** 0%

---

## 🚀 Comandos de Desarrollo Rápido

### Desarrollo Local
```bash
# Iniciar proyecto completo
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend  
npm run dev:frontend

# Crear usuario admin
cd apps/backend && node create-admin.js email@domain.com "Full Name" "password"
```

### Validación Admin Panel
```bash
# Verificar rutas admin
curl http://localhost:3001/api/admin/test

# Probar login admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arturo.jimenez.26@gmail.com","password":"Arturo06;"}'
```

### Despliegue
```bash
# Deploy completo a servidor
./scripts/deploy-to-server.sh server-host user port

# Solo backend
./scripts/deploy-backend.sh server-host
```

---

## 📞 Puntos de Contacto Técnico

### URLs de la Aplicación
- **Desarrollo Frontend:** http://localhost:3000
- **Desarrollo Backend:** http://localhost:3001
- **Admin Panel:** http://localhost:3000/admin
- **API Health:** http://localhost:3001/health

### Credenciales Admin Actuales
- **Email:** arturo.jimenez.26@gmail.com
- **Password:** Arturo06;
- **Permisos:** Super Admin (isAdmin: true)

### Archivos Clave
- **Configuración Admin:** `apps/backend/src/routes/admin.ts`
- **Frontend Admin:** `apps/frontend/src/app/admin/`
- **Autenticación:** `apps/backend/src/services/authService.ts`
- **Cleanup Service:** `apps/backend/src/services/cleanupService.ts`

---

## 📝 Notas para Futuras Iteraciones

### Para IA Assistant:
1. **Estado actual:** UX/UI Enhancement implementado, experiencia comercial completada, i18n completo, QR Display internacionalizado
2. **Prioridad inmediata:** Testing de funcionalidad de usuario invitado, validación de flujos completos
3. **Siguiente fase:** Real-time analytics con gráficos interactivos y metrics avanzadas
4. **Decisiones técnicas:** Usar Chart.js para gráficos, Redis para caché futuro
5. **UX/UI:** Base comercial establecida, i18n implementado, próximo paso: optimización de conversión y analytics avanzados

### Decisiones de Arquitectura:
- **Monorepo:** Facilita desarrollo y despliegue conjunto
- **TypeScript:** Tipos compartidos entre frontend/backend
- **MongoDB:** Sin auth en desarrollo, con auth en producción
- **JWT:** Sin refresh tokens por simplicidad inicial
- **PM2:** Gestión de procesos en producción

### Patrones Establecidos:
- **Error handling:** Middleware centralizado con createError()
- **API responses:** Formato ApiResponse consistente
- **Validación:** express-validator en backend, form validation en frontend
- **Auth:** Middleware diferenciado para user vs admin
- **Database:** Soft deletes con isActive, índices para performance

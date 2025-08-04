# SNR.red - System Instructions para AI Assistant

**Versión:** 2.3  
**Fecha:** 8 de Enero, 2025  
**Propósito:** Guías para mantener documentación actualizada y seguimiento consistente del proyecto

---

## 🌙 ÚLTIMO UPDATE - Dark Mode por Defecto & VCard I18n (Enero 2025)

### ✅ Completado - Dark Mode por Defecto
- **ThemeProvider Context:** Mejorado con tema oscuro por defecto
- **Script Inline:** Agregado en layout.tsx para evitar flash inicial
- **Inicialización Robusta:** Sin useEffects redundantes
- **Resolución de Tema:** Optimizada para mejor rendimiento
- **Documentación:** DARK-THEME-DEFAULT-HOTFIX.md creada

### ✅ Completado - VCard Internacionalización Completa
- **VCardGenerator:** Completamente traducido (EN/ES)
- **50+ Traducciones:** Agregadas en LanguageContext.tsx
- **Validaciones I18n:** Todos los mensajes de error traducidos
- **Placeholders I18n:** Todos los campos del formulario traducidos
- **Toasts I18n:** Todas las notificaciones traducidas
- **Páginas vCard:** Visualización traducida
- **Documentación:** VCARD-I18N-IMPLEMENTATION.md creada

### ✅ Completado - Build Estricto y Limpieza
- **Tipos Centralizados:** Uso exclusivo de @url-shortener/types
- **Interfaces Duplicadas:** Eliminadas de página de vCard
- **Errores ESLint:** Corregidos (Image components, tipos)
- **Build Exitoso:** Compilación sin errores
- **Código Limpio:** Refactorización completa

### 📊 Estado Actual
- **Frontend:** 100% funcional con dark mode por defecto y VCard I18n
- **Backend:** 100% funcional
- **Dark Mode:** ✅ COMPLETAMENTE FUNCIONAL - Tema oscuro por defecto
- **VCard I18n:** ✅ COMPLETAMENTE TRADUCIDO - 50+ claves EN/ES
- **Documentación:** Actualizada con nuevas implementaciones
- **QA:** Completado - build estricto exitoso

---

## 📁 ORGANIZACIÓN DE DOCUMENTACIÓN

### Estructura de Carpetas

**📂 /docs/system/** - Documentación del sistema y instrucciones
- `SYSTEM-INSTRUCTIONS.md` - Este archivo (instrucciones para AI)
- `PROJECT-STATUS.md` - Estado actual del proyecto
- `TECHNICAL-TRACKING-GUIDE.md` - Guía de seguimiento técnico
- `DATA-MODEL.md` - Modelos de datos y esquemas
- `USER-STORIES.md` - Historias de usuario y requerimientos

**📂 /docs/development/** - Documentación de desarrollo y cambios
- `CHANGELOG-*.md` - Logs de cambios específicos
- `QR-*.md` - Documentación de funcionalidades QR
- `*-IMPLEMENTATION*.md` - Guías de implementación
- `*-ENHANCEMENT*.md` - Mejoras y optimizaciones
- `QA-*.md` - Documentación de quality assurance
- `*-FEATURE*.md` - Documentación de nuevas funcionalidades

**📂 /docs/deployment/** - Documentación de deployment y producción
- `DEPLOYMENT*.md` - Guías de deployment
- `PRODUCTION.md` - Configuración de producción
- `LINUX-DEPLOYMENT.md` - Deployment en Linux

**📂 /docs/config/** - Archivos de configuración
- `apache-*.conf` - Configuraciones de Apache
- `mongod.conf` - Configuración de MongoDB

---

## 🤖 Instrucciones para AI Assistant

### PROTOCOLO DE ACTUALIZACIÓN OBLIGATORIO

**IMPORTANTE:** Cada vez que realices cambios en el proyecto SNR.red, DEBES actualizar la documentación siguiendo este protocolo:

### 1. 📋 ANTES DE CUALQUIER CAMBIO

#### Verificación de Estado Actual
```bash
# SIEMPRE revisar estos archivos primero:
1. docs/system/PROJECT-STATUS.md
2. docs/system/TECHNICAL-TRACKING-GUIDE.md
3. docs/system/DATA-MODEL.md
4. docs/system/USER-STORIES.md
5. docs/system/SYSTEM-INSTRUCTIONS.md (este archivo)
```

#### Preguntas Obligatorias
- ¿Qué estado tiene el proyecto actualmente?
- ¿Cuál es la prioridad inmediata?
- ¿Qué fase estamos implementando?
- ¿Hay issues críticos pendientes?
- ¿Qué credenciales/configuraciones necesito?

### 2. 🔄 DURANTE LOS CAMBIOS

#### Tracking de Modificaciones
Mantén un registro mental de:
- [ ] Archivos nuevos creados
- [ ] Archivos modificados
- [ ] Funcionalidades implementadas
- [ ] Bugs corregidos
- [ ] Configuraciones cambiadas
- [ ] Dependencias agregadas/actualizadas

#### Patrones de Código Establecidos
Respeta SIEMPRE estos patrones:
- **Error handling:** Middleware centralizado con createError()
- **API responses:** Formato ApiResponse consistente
- **Validación:** express-validator en backend, form validation en frontend
- **Auth:** Middleware diferenciado para user vs admin
- **Database:** Soft deletes con isActive, índices para performance
- **TypeScript:** Tipos compartidos entre frontend/backend

### 3. 📝 DESPUÉS DE CADA CAMBIO

#### Actualización OBLIGATORIA de Documentación

**A. Actualizar PROJECT-STATUS.md**
```markdown
# Campos a actualizar:
- Fecha de actualización
- Estado actual del proyecto
- Funcionalidades implementadas (mover de pendientes a completadas)
- Issues resueltos/nuevos
- Próximos pasos
- Comandos de verificación
- Archivos clave modificados
```

**B. Actualizar TECHNICAL-TRACKING-GUIDE.md**
```markdown
# Campos a actualizar:
- Progreso general (barras de progreso)
- Estado de funcionalidades
- Roadmap de desarrollo
- Issues conocidos
- Archivos a crear/modificar
- Comandos de desarrollo
- Métricas de progreso
```

**C. Actualizar DATA-MODEL.md (si aplica)**
```markdown
# Actualizar solo si hay cambios en:
- Esquemas de base de datos
- Nuevas colecciones
- Campos agregados/modificados
- Índices nuevos
- Relaciones entre modelos
- Políticas de datos
```

**D. Actualizar USER-STORIES.md (si aplica)**
```markdown
# Actualizar solo si hay cambios en:
- Historias completadas (cambiar estado)
- Nuevas historias agregadas
- Criterios de aceptación modificados
- Estimaciones actualizadas
- Prioridades cambiadas
```

**E. Crear documentación en /docs/development/ (si aplica)**
```markdown
# Crear archivos específicos para:
- Nuevas funcionalidades implementadas
- Cambios significativos en UX/UI
- Fixes importantes de bugs
- Implementaciones técnicas complejas
- Mejoras de rendimiento
- Actualizaciones de QA
```

### 4. 🎯 REGLAS DE CONSISTENCIA

#### Formato de Fechas
- **Siempre usar:** "7 de Enero, 2025"
- **Zona horaria:** Implícita (local del proyecto)

#### Estados de Funcionalidades
- ✅ **Implementado:** Completado y probado
- 🔄 **En Progreso:** Actualmente en desarrollo
- ⏳ **Planificado:** En el backlog, próxima implementación
- 🔮 **Futuro:** Planificado para versiones posteriores

#### Versionado de Documentos
- **Formato:** v1.0, v1.1, v2.0
- **Criterio:** Cambios mayores = versión mayor, cambios menores = versión menor

#### Archivos Clave a Referenciar
```typescript
// SIEMPRE mantener actualizadas estas referencias:
Backend_Core: [
  'apps/backend/src/routes/admin.ts',
  'apps/backend/src/services/authService.ts',
  'apps/backend/src/services/cleanupService.ts',
  'apps/backend/src/middleware/adminAuth.ts'
]

Frontend_Core: [
  'apps/frontend/src/components/admin/',
  'apps/frontend/src/app/admin/',
  'apps/frontend/src/components/AuthComponent.tsx'
]

Configuration: [
  'apps/backend/create-admin.js',
  'apps/backend/ecosystem.config.js',
  'scripts/deploy-to-server.sh'
]
```

### 5. 📊 MÉTRICAS A MANTENER

#### Progreso por Área
```yaml
# Actualizar SIEMPRE después de cambios:
Backend_Core: "X% (descripción del estado)"
Frontend_Core: "X% (descripción del estado)"
Admin_Panel: "X% (descripción del estado)"
Analytics: "X% (descripción del estado)"
Pagos: "X% (descripción del estado)"
```

#### Contadores de Funcionalidades
```yaml
# Mantener actualizados:
Completadas: X funcionalidades
En_Progreso: X funcionalidades
Pendientes: X funcionalidades
Issues_Críticos: X issues
Issues_Menores: X issues
```

### 6. 🚀 COMANDOS DE VERIFICACIÓN ESTÁNDAR

#### Verificación Post-Cambio
```bash
# SIEMPRE ejecutar para verificar que todo funciona:
npm run dev                    # Verificar que todo inicia
npm run build                  # Verificar que todo compila
npm run lint                   # Verificar que no hay errores de linting
```

#### Verificación de Admin Panel
```bash
# Si cambios relacionados con admin:
curl http://localhost:3001/api/admin/test
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"arturo.jimenez.26@gmail.com","password":"Arturo06;"}'
```

### 7. 🔐 CREDENCIALES Y CONFIGURACIÓN

#### Credenciales Admin
```yaml
# SIEMPRE usar estas credenciales para pruebas:
Email: arturo.jimenez.26@gmail.com
Password: Arturo06;
Permisos: Super Admin (isAdmin: true)
Plan: premium
```

#### URLs de Desarrollo
```yaml
# SIEMPRE verificar estas URLs:
Frontend: http://localhost:3000
Backend: http://localhost:3001
Admin_Panel: http://localhost:3000/admin
Health_Check: http://localhost:3001/health
```

### 8. 📞 PUNTOS DE CONTACTO TÉCNICO

#### Información del Proyecto
```yaml
Repositorio: https://github.com/marturojt/snr-red.git
Rama_Principal: main
Rama_Producción: prod
Dominio: snr.red
```

#### Estructura de Comandos
```bash
# Desarrollo
npm run dev                    # Iniciar desarrollo completo
npm run dev:backend           # Solo backend
npm run dev:frontend          # Solo frontend

# Build
npm run build                 # Build completo
npm run build:types          # Solo tipos
npm run build:backend        # Solo backend
npm run build:frontend       # Solo frontend

# Deployment
./scripts/deploy-to-server.sh [host] [user] [port]
```

### 9. 🎯 FLUJO DE TRABAJO ESTÁNDAR

#### Proceso para Implementar Nueva Funcionalidad

1. **Preparación**
   - [ ] Leer PROJECT-STATUS.md para entender estado actual
   - [ ] Identificar en qué fase/épica entra la funcionalidad
   - [ ] Verificar que no hay issues críticos bloqueantes

2. **Implementación**
   - [ ] Seguir patrones establecidos
   - [ ] Mantener consistencia con arquitectura existente
   - [ ] Actualizar tipos compartidos si es necesario

3. **Testing**
   - [ ] Probar funcionalidad implementada
   - [ ] Verificar que no se rompió nada existente
   - [ ] Ejecutar comandos de verificación

4. **Documentación**
   - [ ] Actualizar PROJECT-STATUS.md
   - [ ] Actualizar TECHNICAL-TRACKING-GUIDE.md
   - [ ] Actualizar otros documentos si aplica
   - [ ] Actualizar versiones de documentos

5. **Validación**
   - [ ] Revisar que toda la documentación esté consistente
   - [ ] Verificar que los próximos pasos estén claros
   - [ ] Confirmar que las métricas estén actualizadas

### 10. 🔄 HISTÓRICO DE CAMBIOS

#### Template para Log de Cambios
```markdown
### Cambios - [Fecha]
**Funcionalidades Implementadas:**
- [x] Funcionalidad 1
- [x] Funcionalidad 2

**Issues Resueltos:**
- [x] Issue 1: Descripción
- [x] Issue 2: Descripción

**Archivos Modificados:**
- archivo1.ts: Descripción del cambio
- archivo2.tsx: Descripción del cambio

**Próximos Pasos:**
- [ ] Siguiente tarea 1
- [ ] Siguiente tarea 2

**Tiempo Estimado para Próxima Fase:** X días/semanas
```

### 11. 🚨 ALERTAS Y RECORDATORIOS

#### Alertas Críticas
- 🔴 **NUNCA** cambiar credenciales admin sin actualizar documentación
- 🔴 **NUNCA** modificar esquemas de DB sin actualizar DATA-MODEL.md
- 🔴 **NUNCA** implementar funcionalidades sin actualizar USER-STORIES.md
- 🔴 **NUNCA** deployar sin actualizar documentación

#### Recordatorios Importantes
- 🟡 Actualizar progreso en barras visuales
- 🟡 Mantener comandos de verificación actualizados
- 🟡 Revisar que las fechas estén correctas
- 🟡 Verificar que los enlaces a archivos sean válidos

### 12. 📚 REFERENCIAS RÁPIDAS

#### Documentos por Tipo de Cambio
```yaml
Backend_Changes:
  - docs/system/PROJECT-STATUS.md (siempre)
  - docs/system/TECHNICAL-TRACKING-GUIDE.md (siempre)
  - docs/system/DATA-MODEL.md (si hay cambios en DB)
  - docs/development/CHANGELOG-*.md (crear si es cambio significativo)

Frontend_Changes:
  - docs/system/PROJECT-STATUS.md (siempre)
  - docs/system/TECHNICAL-TRACKING-GUIDE.md (siempre)
  - docs/system/USER-STORIES.md (si se completan historias)
  - docs/development/*-ENHANCEMENT*.md (si es mejora UX/UI)

New_Features:
  - Todos los documentos de /docs/system/
  - Crear documentación específica en /docs/development/
  - Verificar que la funcionalidad esté en USER-STORIES.md
  - Actualizar roadmap y métricas

Bug_Fixes:
  - docs/system/PROJECT-STATUS.md (issues conocidos)
  - docs/system/TECHNICAL-TRACKING-GUIDE.md (issues conocidos)
  - docs/development/CHANGELOG-*.md (si es fix crítico)

Deployment_Changes:
  - docs/deployment/DEPLOYMENT*.md (actualizar guías)
  - docs/deployment/PRODUCTION.md (si afecta producción)
  - docs/config/*.conf (si cambian configuraciones)
```

#### Secciones Clave por Documento
```yaml
PROJECT-STATUS.md:
  - Fecha de actualización
  - Estado actual
  - Funcionalidades implementadas
  - Issues conocidos
  - Próximos pasos

TECHNICAL-TRACKING-GUIDE.md:
  - Dashboard de estado
  - Roadmap de desarrollo
  - Issues conocidos
  - Objetivos a corto plazo

DATA-MODEL.md:
  - Esquemas de colecciones
  - Índices y relaciones
  - Políticas de datos

USER-STORIES.md:
  - Estados de historias
  - Criterios de aceptación
  - Métricas de éxito
```

---

## 🤝 PROTOCOLO DE HANDOFF

### Para Futuras Sesiones de IA

#### Al Retomar el Proyecto
1. **Leer SIEMPRE estos archivos en orden:**
   - docs/system/PROJECT-STATUS.md (estado actual)
   - docs/system/TECHNICAL-TRACKING-GUIDE.md (roadmap técnico)
   - docs/system/USER-STORIES.md (funcionalidades)
   - docs/system/DATA-MODEL.md (arquitectura de datos)
   - docs/system/SYSTEM-INSTRUCTIONS.md (este archivo)

2. **Verificar Estado del Sistema:**
   - Ejecutar `npm run dev` para verificar que todo funciona
   - Probar login admin con credenciales documentadas
   - Revisar issues críticos pendientes

3. **Identificar Próximos Pasos:**
   - Revisar sección "Prioridad inmediata" en PROJECT-STATUS.md
   - Verificar roadmap actual en TECHNICAL-TRACKING-GUIDE.md
   - Confirmar que no hay cambios pendientes de documentar

#### Al Finalizar Sesión
1. **Actualizar TODO:**
   - Todos los documentos relevantes
   - Fechas y versiones
   - Estado actual del proyecto
   - Próximos pasos claros

2. **Verificar Consistencia:**
   - Que todas las referencias estén actualizadas
   - Que las métricas sean consistentes
   - Que los comandos funcionen

3. **Dejar Nota para Siguiente Sesión:**
   - Estado actual claro
   - Prioridades inmediatas
   - Issues conocidos
   - Próximos pasos específicos

---

## 📋 CHECKLIST DE ACTUALIZACIÓN

### ✅ Checklist Post-Cambio (OBLIGATORIO)

**Documentación:**
- [ ] docs/system/PROJECT-STATUS.md actualizado
- [ ] docs/system/TECHNICAL-TRACKING-GUIDE.md actualizado
- [ ] docs/system/DATA-MODEL.md actualizado (si aplica)
- [ ] docs/system/USER-STORIES.md actualizado (si aplica)
- [ ] docs/development/ - Crear documentación específica (si aplica)
- [ ] docs/deployment/ - Actualizar guías de deployment (si aplica)
- [ ] docs/config/ - Actualizar configuraciones (si aplica)
- [ ] Fechas actualizadas en todos los documentos
- [ ] Versiones de documentos incrementadas

**Funcionalidades:**
- [ ] Estados de funcionalidades actualizados
- [ ] Métricas de progreso actualizadas
- [ ] Issues movidos a sección correcta
- [ ] Próximos pasos claramente definidos

**Configuración:**
- [ ] Comandos de verificación probados
- [ ] Credenciales verificadas
- [ ] URLs de desarrollo funcionales
- [ ] Archivos clave referenciados correctamente

**Validación:**
- [ ] Toda la documentación es consistente
- [ ] No hay referencias rotas
- [ ] Información técnica es precisa
- [ ] Próximos pasos son alcanzables

---

**Estado del documento:** ✅ Activo  
**Aplicabilidad:** TODAS las sesiones de desarrollo  
**Revisión:** Al agregar nuevos tipos de cambios  
**Versión:** 2.3-dark-mode-default-vcard-i18n-completo

---

### 🔄 IMPORTANTE: CUMPLIMIENTO OBLIGATORIO

**Este documento define el protocolo OBLIGATORIO para mantener la documentación del proyecto SNR.red actualizada. Como AI Assistant, DEBO seguir estas instrucciones en CADA sesión de trabajo para garantizar la continuidad y calidad del proyecto.**

**Recordatorio:** La documentación actualizada es tan importante como el código funcional. Un proyecto sin documentación actualizada es un proyecto sin futuro mantenible.

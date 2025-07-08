# SNR.red Admin Panel

Este es el panel de administración para SNR.red, una plataforma moderna de acortamiento de URLs con generación de códigos QR y análisis avanzado.

## Características del Admin Panel

### 🏠 Dashboard Principal
- **Estadísticas del sistema**: URLs totales, usuarios activos, clics totales
- **Métricas de crecimiento**: Estadísticas diarias, semanales y mensuales
- **URLs más populares**: Ranking de URLs por número de clics
- **Salud del sistema**: Indicadores de rendimiento y actividad

### 👥 Gestión de Usuarios
- **Lista de usuarios**: Visualización paginada con filtros y búsqueda
- **Detalles de usuario**: Información completa del perfil
- **Administración de planes**: Cambiar entre Free y Premium
- **Control de estado**: Activar/desactivar cuentas de usuario
- **Eliminación de usuarios**: Borrado completo con URLs asociadas

### 🔗 Gestión de URLs
- **Inventario de URLs**: Listado completo con filtros avanzados
- **Detalles de URL**: Información completa incluyendo estadísticas
- **Administración de estado**: Activar/desactivar URLs
- **Control de expiración**: Modificar fechas de vencimiento
- **Eliminación de URLs**: Borrado individual o masivo

### 📊 Análisis Avanzado
- **Métricas de conversión**: Tasa de usuarios premium
- **Análisis de crecimiento**: Tendencias de usuarios y URLs
- **Rendimiento del sistema**: Tasa de URLs activas, clics promedio
- **Estadísticas detalladas**: Insights profundos del uso de la plataforma

### ⚙️ Configuración del Sistema
- **Estado del servidor**: Monitoreo de servicios críticos
- **Configuración de limpieza**: Gestión de URLs expiradas
- **Configuración de URLs**: Parámetros de códigos cortos
- **Configuración de usuarios**: Políticas de registro y planes

### 🔐 Seguridad
- **Autenticación de admin**: Middleware de verificación
- **Control de acceso**: Roles y permisos
- **Monitoreo de actividad**: Logs de acciones administrativas
- **Protección contra abuso**: Rate limiting y validaciones

## Arquitectura Técnica

### Backend (Node.js/Express)
```
apps/backend/src/
├── routes/admin.ts          # Rutas del admin panel
├── middleware/adminAuth.ts  # Autenticación de admin
├── models/User.ts          # Modelo de usuario (con isAdmin)
├── services/              # Servicios de negocio
└── create-admin.js        # Script para crear admin
```

### Frontend (Next.js/React)
```
apps/frontend/src/
├── app/admin/              # Páginas del admin
│   ├── page.tsx           # Dashboard principal
│   ├── users/page.tsx     # Gestión de usuarios
│   ├── urls/page.tsx      # Gestión de URLs
│   ├── analytics/page.tsx # Análisis avanzado
│   ├── settings/page.tsx  # Configuración
│   └── security/page.tsx  # Seguridad
└── components/admin/       # Componentes del admin
    ├── AdminLayout.tsx    # Layout principal
    ├── AdminDashboard.tsx # Dashboard
    ├── UserManagement.tsx # Gestión de usuarios
    ├── UrlManagement.tsx  # Gestión de URLs
    ├── AdminAnalytics.tsx # Análisis
    └── AdminSettings.tsx  # Configuración
```

## Instalación y Configuración

### 1. Crear Usuario Administrador
```bash
cd apps/backend
node create-admin.js admin@snr.red "Admin User" "secure_password"
```

### 2. Variables de Entorno
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/snr-red
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Ejecutar el Proyecto
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## Acceso al Admin Panel

### URL de Acceso
- **Desarrollo**: `http://localhost:3000/admin`
- **Producción**: `https://snr.red/admin`

### Credenciales
- Usar las credenciales creadas con el script `create-admin.js`
- Solo usuarios con `isAdmin: true` pueden acceder

### Flujo de Autenticación
1. Login con credenciales de admin
2. Verificación del token JWT
3. Validación del campo `isAdmin`
4. Acceso a funciones administrativas

## Funcionalidades por Implementar

### 🚀 Próximas Características
- [ ] **Notificaciones**: Sistema de alertas y notificaciones
- [ ] **Reportes**: Generación de reportes en PDF/CSV
- [ ] **Logs de actividad**: Auditoría completa de acciones
- [ ] **Respaldos**: Gestión de backups automáticos
- [ ] **Configuración avanzada**: Editor de configuraciones
- [ ] **Monitoreo en tiempo real**: Dashboard con actualizaciones live
- [ ] **Moderación de contenido**: Revisión y filtrado de URLs
- [ ] **Integración con Stripe**: Gestión de pagos y suscripciones
- [ ] **API de administración**: Endpoints para automatización
- [ ] **Roles y permisos**: Sistema granular de acceso

### 🔧 Mejoras Técnicas
- [ ] **Paginación avanzada**: Mejores controles de navegación
- [ ] **Filtros dinámicos**: Búsqueda más sofisticada
- [ ] **Exportación de datos**: Descarga de información
- [ ] **Gráficos interactivos**: Visualizaciones más ricas
- [ ] **Modo oscuro**: Tema alternativo
- [ ] **PWA**: Aplicación web progresiva
- [ ] **WebSockets**: Actualizaciones en tiempo real
- [ ] **Cache inteligente**: Optimización de rendimiento

## Estructura de Datos

### Usuario Admin
```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  plan: 'premium';      // Admins tienen plan premium
  isAdmin: true;        // Campo requerido
  isActive: true;       // Siempre activo
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
```

### Estadísticas del Sistema
```typescript
interface SystemStats {
  urls: {
    total: number;
    active: number;
    expired: number;
    today: number;
    week: number;
    month: number;
  };
  users: {
    total: number;
    active: number;
    free: number;
    premium: number;
    today: number;
    week: number;
    month: number;
  };
  clicks: {
    total: number;
  };
  topUrls: TopUrl[];
}
```

## Seguridad

### Medidas de Protección
1. **Autenticación JWT**: Tokens seguros con expiración
2. **Middleware de admin**: Verificación en cada endpoint
3. **Rate limiting**: Protección contra ataques
4. **Validación de datos**: Sanitización de inputs
5. **CORS configurado**: Acceso controlado desde frontend
6. **Encriptación**: Passwords hasheados con bcrypt

### Buenas Prácticas
- ✅ Usar HTTPS en producción
- ✅ Mantener JWT_SECRET seguro
- ✅ Logs de actividad administrativa
- ✅ Acceso restringido por IP (opcional)
- ✅ Sesiones con timeout automático
- ✅ Validación de permisos en cada acción

## Contribución

### Desarrollo
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/admin-enhancement`
3. Commit cambios: `git commit -m 'Add admin feature'`
4. Push a la rama: `git push origin feature/admin-enhancement`
5. Crear Pull Request

### Estructura de Commits
```
feat: add user management dashboard
fix: resolve admin authentication bug
docs: update admin panel documentation
style: improve admin UI components
refactor: optimize admin API endpoints
test: add admin panel test suite
```

## Soporte

Para soporte técnico o reportar bugs:
- **Email**: admin@snr.red
- **GitHub Issues**: [SNR.red Issues](https://github.com/marturojt/snr-red/issues)
- **Documentación**: [SNR.red Docs](https://docs.snr.red)

---

**SNR.red Admin Panel** - Gestión profesional para tu plataforma de acortamiento de URLs.

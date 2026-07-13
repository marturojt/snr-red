# SNR.red - URL Shortener

Un acortador de URLs moderno y rápido construido con Next.js y Node.js.

🌐 **Dominio de producción**: [snr.red](https://snr.red)

## 🚀 Características

- **🔗 Acortador de URLs**: Crea URLs cortas y fáciles de compartir
- **📱 Generador de QR**: Genera códigos QR automáticamente para cada URL
- **📊 Analytics Detallados**: 
  - Tracking de clics totales y únicos
  - Geolocalización por país
  - Análisis por dispositivo y navegador
  - Gráficos de clics a lo largo del tiempo
- **⚙️ Opciones Avanzadas**:
  - Códigos personalizados
  - Fechas de expiración
  - Títulos y descripciones
- **🎨 UI Moderna**: Interfaz construida con shadcn/ui y Tailwind CSS

## 🏗️ Arquitectura del Monorepo

```
snr-red/
├── apps/
│   ├── frontend/          # Next.js app
│   └── backend/           # Node.js API
├── packages/
│   └── types/             # Tipos TypeScript compartidos
└── package.json           # Configuración del workspace
```

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos y visualizaciones
- **Sonner** - Notificaciones toast
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Type safety
- **MongoDB** - Base de datos
- **Mongoose** - ODM
- **QRCode** - Generación de códigos QR
- **Express Rate Limit** - Rate limiting
- **Helmet** - Seguridad

### Compartido
- **Workspace Types** - Tipos TypeScript compartidos

## 🚀 Instalación y Desarrollo

### Prerequisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB >= 5.0.0

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd snr-red

# Instalar dependencias del monorepo
npm install

# Construir tipos compartidos
npm run build --workspace=@url-shortener/types
```

### Configuración de Variables de Entorno

#### Backend (`apps/backend/.env`)
```bash
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/url-shortener
JWT_SECRET=your-super-secret-jwt-key
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`apps/frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Desarrollo

```bash
# Iniciar todos los servicios
npm run dev

# O iniciar servicios individuales
npm run dev:frontend
npm run dev:backend
```

Los servicios estarán disponibles en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🗄️ Base de Datos

### MongoDB Setup
```bash
# Iniciar MongoDB localmente
mongod

# O usar Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Modelos de Datos

#### URL
```typescript
{
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  qrCodeUrl?: string;
  isActive: boolean;
  userId?: string;
  title?: string;
  description?: string;
  expiresAt?: Date;
  createdAt: Date;
}
```

#### Analytics
```typescript
{
  urlId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
}
```

## 📡 API Endpoints

### URLs
- `POST /api/urls` - Crear URL corta
- `GET /api/urls/:shortCode` - Obtener detalles de URL
- `GET /api/urls/check/:shortCode` - Verificar disponibilidad
- `PUT /api/urls/:id` - Actualizar URL
- `DELETE /api/urls/:id` - Eliminar URL

### Analytics
- `GET /api/analytics/:id` - Obtener estadísticas de URL
- `DELETE /api/analytics/:id` - Eliminar datos analíticos

### QR Codes
- `POST /api/qr/generate` - Generar código QR
- `POST /api/qr/generate/dataurl` - Generar QR como data URL
- `GET /api/qr/:filename` - Servir archivo QR
- `DELETE /api/qr/:filename` - Eliminar código QR

### Redirección
- `GET /:shortCode` - Redirigir a URL original (con tracking)

### API pública v1 (para consumir desde otros proyectos)
Autenticada con **API keys** (header `X-API-Key`), gestionadas desde el dashboard (pestaña *API Keys*).
- `POST /api/v1/urls` - Acortar URL
- `GET /api/v1/urls` - Listar tus URLs
- `GET /api/v1/urls/:shortCode` - Detalle
- `DELETE /api/v1/urls/:shortCode` - Eliminar
- `GET /api/v1/urls/:shortCode/analytics` - Estadísticas

Referencia completa: [docs/development/API-V1-REFERENCE.md](docs/development/API-V1-REFERENCE.md).

## 🔧 Scripts Disponibles

### Root (Monorepo)
```bash
npm run dev          # Iniciar frontend y backend
npm run build        # Construir todos los workspaces
npm run lint         # Lint todos los workspaces
npm run type-check   # Type checking todos los workspaces
```

### Frontend
```bash
npm run dev --workspace=frontend
npm run build --workspace=frontend
npm run start --workspace=frontend
```

### Backend
```bash
npm run dev --workspace=backend
npm run build --workspace=backend
npm run start --workspace=backend
```

## 🚀 Deployment

### Script de Deployment Automático
```bash
./scripts/deploy-to-server.sh
```

### Configuración Manual

#### Backend (Node.js)
1. Configurar variables de entorno de producción
2. Construir el proyecto: `npm run build --workspace=backend`
3. Iniciar: `npm run start --workspace=backend`

#### Frontend (Next.js)
1. Configurar variables de entorno de producción
2. Construir el proyecto: `npm run build --workspace=frontend`
3. Iniciar: `npm run start --workspace=frontend`

#### MongoDB
En producción, MongoDB debe escuchar solo en `127.0.0.1` y (recomendado) con
autenticación habilitada. No lo expongas al exterior.

**Configuración en producción:**
```yaml
# /etc/mongod.conf
net:
  bindIp: 127.0.0.1
security:
  authorization: enabled
```
El backend además aborta el arranque en `NODE_ENV=production` si `JWT_SECRET`
no es un valor aleatorio de >= 32 caracteres o si falta `MONGODB_URI`.

**Variables de entorno:**
```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/snr-red-prod

# Frontend
NEXT_PUBLIC_API_URL=https://api.snr.red/api
```

Ver [DEPLOYMENT-NO-AUTH.md](docs/DEPLOYMENT-NO-AUTH.md) para detalles completos.

### Docker (Opcional)
```bash
# Backend
cd apps/backend
docker build -t url-shortener-backend .

# Frontend
cd apps/frontend
docker build -t url-shortener-frontend .
```

## 🔒 Seguridad

- Rate limiting en todas las rutas API
- Validación de entrada con express-validator
- Helmet.js para headers de seguridad
- CORS configurado
- Sanitización de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🎯 Roadmap

- [ ] Sistema de autenticación de usuarios
- [ ] Dashboard de administración
- [ ] Dominios personalizados
- [ ] Bulk URL shortening
- [ ] API webhooks
- [ ] Integración con servicios externos
- [ ] Temas personalizables
- [ ] Exportación de analytics

## 📞 Soporte

Si tienes preguntas o problemas, puedes:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

---

Construido con ❤️ usando Next.js, Node.js y MongoDB

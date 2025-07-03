# Configuración de Despliegue para snr.red

Esta guía te ayudará a desplegar tu acortador de URLs en producción usando el dominio `snr.red`.

## 🎯 Arquitectura de Producción

```
snr.red (Frontend - Vercel)
    ↓
api.snr.red (Backend - Railway/DigitalOcean)
    ↓
MongoDB Atlas (Base de datos)
```

## 🚀 Paso a Paso: Despliegue

### 1. Base de Datos (MongoDB Atlas)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea un nuevo cluster
3. Configura usuario y contraseña
4. Whitelista IPs (0.0.0.0/0 para desarrollo, específicas para producción)
5. Obtén la connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/url-shortener
   ```

### 2. Backend (Railway/DigitalOcean)

#### Opción A: Railway (Recomendado)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway add --database mongodb
railway deploy
```

#### Variables de entorno para Railway:
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/url-shortener
JWT_SECRET=tu-clave-super-secreta-de-produccion
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
QR_CODE_SIZE=200
QR_CODE_FORMAT=png
ANALYTICS_RETENTION_DAYS=365
```

### 3. Frontend (Vercel)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy desde la carpeta frontend
cd apps/frontend
vercel

# O conectar repositorio de GitHub en vercel.com
```

#### Variables de entorno para Vercel:
```bash
NEXT_PUBLIC_API_URL=https://api.snr.red
NEXT_PUBLIC_APP_URL=https://snr.red
```

### 4. Configuración DNS

En tu proveedor de DNS (Cloudflare, GoDaddy, etc.):

```
# Tipo  Nombre  Valor
A       @       [IP de Vercel o CNAME a vercel]
CNAME   api     [URL del backend en Railway]
CNAME   www     snr.red
```

#### Si usas Cloudflare:
1. Agrega tu dominio a Cloudflare
2. Configura los nameservers
3. Activa SSL/TLS (Full Strict)
4. Configura Page Rules para redirects

## 🔧 Configuraciones Específicas

### Dockerfile para el Backend (si usas Docker)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/types/package*.json ./packages/types/

# Instalar dependencias
RUN npm ci --only=production

# Copiar código
COPY packages/types/ ./packages/types/
COPY apps/backend/ ./apps/backend/

# Construir tipos compartidos
RUN cd packages/types && npm run build

# Construir backend
RUN cd apps/backend && npm run build

EXPOSE 3001

CMD ["npm", "run", "start:backend"]
```

### Configuración de Nginx (si usas servidor propio)

```nginx
# /etc/nginx/sites-available/snr.red
server {
    listen 80;
    server_name snr.red www.snr.red;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name snr.red www.snr.red;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend (proxy a Vercel o servir estáticos)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name api.snr.red;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Backend API
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Seguridad en Producción

### 1. Variables de Entorno Seguras
- Usa JWT secrets fuertes (32+ caracteres)
- Nunca commitees archivos .env
- Usa servicios de secrets management

### 2. Rate Limiting
```javascript
// Configuración más estricta para producción
RATE_LIMIT_WINDOW_MS=900000  // 15 minutos
RATE_LIMIT_MAX_REQUESTS=50   // 50 requests por IP
```

### 3. CORS
```javascript
// Solo permitir tu dominio
FRONTEND_URL=https://snr.red
```

### 4. Headers de Seguridad
El backend ya incluye Helmet.js para headers seguros.

## 📊 Monitoring

### 1. Logs
- Railway: Built-in logging
- DigitalOcean: Configure logging service

### 2. Uptime Monitoring
- [Uptime Robot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)

### 3. Error Tracking
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)

## 🚨 Checklist de Despliegue

- [ ] MongoDB Atlas configurado
- [ ] Backend deployado con variables correctas
- [ ] Frontend deployado en Vercel
- [ ] DNS configurado (A, CNAME records)
- [ ] SSL certificados activos
- [ ] Rate limiting configurado
- [ ] Backup strategy definida
- [ ] Monitoring configurado
- [ ] Error tracking activo
- [ ] Performance testing completado

## 🔄 CI/CD (Opcional)

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to snr.red

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:backend
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 🆘 Troubleshooting

### Errores Comunes

1. **CORS errors**: Verificar FRONTEND_URL en backend
2. **MongoDB connection**: Verificar IP whitelist y credentials
3. **Build failures**: Verificar que tipos compartidos estén construidos
4. **SSL issues**: Verificar certificados y DNS propagation

### Health Checks

- Backend: `https://api.snr.red/health`
- Frontend: `https://snr.red`

---

¡Listo para hacer snr.red viral! 🚀

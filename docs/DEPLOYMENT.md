# Configuración de Despliegue para snr.red

Esta guía te ayudará a desplegar tu acortador de URLs en producción usando el dominio `snr.red`.

## 🎯 Arquitectura de Producción

```
snr.red (Frontend - Vercel)
    ↓
api.snr.red (Backend - Tu Servidor Linux)
    ↓
MongoDB Local (En el mismo servidor)
```

## 🚀 Paso a Paso: Despliegue

### 1. Base de Datos (MongoDB Local)

#### Configuración en tu servidor Linux:

```bash
# MongoDB ya está instalado, configurar para producción
sudo systemctl enable mongod
sudo systemctl start mongod

# Crear usuario para la base de datos
mongosh
use snr-red-prod
db.createUser({
  user: "snrred_user",
  pwd: "tu_password_seguro",
  roles: [
    { role: "readWrite", db: "snr-red-prod" }
  ]
})
exit

# Habilitar autenticación (opcional pero recomendado)
sudo nano /etc/mongod.conf
# Descomentar y configurar:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

#### Connection string para tu aplicación:
```
mongodb://snrred_user:tu_password_seguro@localhost:27017/snr-red-prod
```

#### Alternativa: MongoDB Atlas (si prefieres cloud)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea un nuevo cluster
3. Configura usuario y contraseña
4. Whitelista IPs (0.0.0.0/0 para desarrollo, específicas para producción)
5. Obtén la connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/url-shortener
   ```

### 2. Backend (Tu Servidor Linux con PM2)

#### Opción A: Despliegue Automatizado (Recomendado)

Usa el script de despliegue automatizado que maneja todo el proceso:

```bash
# Desde tu máquina local, ejecutar:
./scripts/deploy-to-server.sh freejolitos
```

El script automáticamente:
- Clona o actualiza el repositorio en `/var/www/snr-red`
- Instala dependencias y construye el proyecto
- Configura variables de entorno (si no existen)
- Inicia la aplicación con PM2
- Configura PM2 para auto-start

#### Opción B: Despliegue Manual

```bash
# En tu servidor como usuario okami
cd /var/www
sudo mkdir -p snr-red
sudo chown okami:okami snr-red
cd snr-red

# Clonar repositorio
git clone git@github.com:marturojt/snr-red.git .

# Instalar dependencias
npm ci

# Construir el proyecto
npm run build

# Configurar variables de entorno
cp apps/backend/.env.example apps/backend/.env
nano apps/backend/.env
```

#### Variables de entorno para tu servidor:
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://snrred_user:tu_password_seguro@localhost:27017/snr-red-prod
JWT_SECRET=tu-clave-super-secreta-de-produccion-32-chars-min
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
QR_CODE_SIZE=200
QR_CODE_FORMAT=png
ANALYTICS_RETENTION_DAYS=730
```

#### Iniciar con PM2:
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicación
pm2 start apps/backend/ecosystem.config.js --env production

# Configurar PM2 para inicio automático
pm2 startup
pm2 save
```

#### Opción B: Railway (para referencia)
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
A       @       [IP de Vercel para frontend]
A       api     [IP de tu servidor Linux]
CNAME   www     snr.red
```

#### Si usas Cloudflare:
1. Agrega tu dominio a Cloudflare
2. Configura los nameservers
3. Activa SSL/TLS (Full Strict)
4. Configura Page Rules para redirects

#### Configuración específica para tu servidor:
```
# Apuntar api.snr.red a tu servidor
A       api     [TU_SERVIDOR_IP]
```

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

### Configuración de Apache (para tu servidor)

```apache
# /etc/apache2/sites-available/snr.red.conf
<VirtualHost *:80>
    ServerName snr.red
    ServerAlias www.snr.red
    Redirect permanent / https://snr.red/
</VirtualHost>

<VirtualHost *:80>
    ServerName api.snr.red
    Redirect permanent / https://api.snr.red/
</VirtualHost>

<VirtualHost *:443>
    ServerName snr.red
    ServerAlias www.snr.red
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/snr.red/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/snr.red/privkey.pem
    
    # Proxy al frontend (Vercel) o servir estáticos locales
    ProxyPass / https://tu-frontend.vercel.app/
    ProxyPassReverse / https://tu-frontend.vercel.app/
    ProxyPreserveHost On
</VirtualHost>

<VirtualHost *:443>
    ServerName api.snr.red
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/snr.red/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/snr.red/privkey.pem
    
    # Proxy al backend local
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
    ProxyPreserveHost On
    
    # Headers para CORS y seguridad
    Header always set Access-Control-Allow-Origin "https://snr.red"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</VirtualHost>
```

### Configuración de Nginx (alternativa)

```nginx
# /etc/nginx/sites-available/snr.red
server {
    listen 80;
    server_name snr.red www.snr.red api.snr.red;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name snr.red www.snr.red;
    
    ssl_certificate /etc/letsencrypt/live/snr.red/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/snr.red/privkey.pem;
    
    # Frontend (proxy a Vercel)
    location / {
        proxy_pass https://tu-frontend.vercel.app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.snr.red;
    
    ssl_certificate /etc/letsencrypt/live/snr.red/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/snr.red/privkey.pem;
    
    # Backend API (local)
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://snr.red" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
```

## 🔒 Seguridad en Producción

### 1. MongoDB Local - Configuración Segura
```bash
# Habilitar autenticación en MongoDB
sudo nano /etc/mongod.conf

# Agregar/descomentar:
security:
  authorization: enabled

# Configurar firewall para MongoDB (solo conexiones locales)
sudo ufw allow from 127.0.0.1 to any port 27017
sudo ufw deny 27017

# Restart MongoDB
sudo systemctl restart mongod
```

### 2. Variables de Entorno Seguras
- Usa JWT secrets fuertes (32+ caracteres)
- Nunca commitees archivos .env
- Usa servicios de secrets management
- Configura .env con permisos restrictivos: `chmod 600 apps/backend/.env`

### 3. Rate Limiting
```javascript
// Configuración más estricta para producción
RATE_LIMIT_WINDOW_MS=900000  // 15 minutos
RATE_LIMIT_MAX_REQUESTS=50   // 50 requests por IP
```

### 4. CORS
```javascript
// Solo permitir tu dominio
FRONTEND_URL=https://snr.red
```

### 5. Firewall del Servidor
```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # Backend (solo si necesario desde exterior)

# Denegar acceso directo a MongoDB desde exterior
sudo ufw deny 27017
```

### 6. Headers de Seguridad
El backend ya incluye Helmet.js para headers seguros.

## 📊 Monitoring

### 1. Logs
- PM2: `pm2 logs` o `pm2 logs snr-red-backend`
- MongoDB: `/var/log/mongodb/mongod.log`
- Apache: `/var/log/apache2/error.log` y `/var/log/apache2/access.log`
- Sistema: `journalctl -u mongod` para MongoDB service logs

### 2. Uptime Monitoring
- [Uptime Robot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- Configurar alerts para `https://api.snr.red/health`

### 3. Error Tracking
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)

### 4. Monitoreo del Servidor
```bash
# Instalar herramientas de monitoreo
sudo apt install htop iotop nethogs

# PM2 monitoring
pm2 monit

# MongoDB stats
mongosh
db.stats()
db.serverStatus()
```

## 🚨 Checklist de Despliegue

- [ ] MongoDB local configurado con autenticación
- [ ] Usuario de base de datos creado
- [ ] Backend clonado en `/var/www/snr-red`
- [ ] Variables de entorno configuradas en `.env`
- [ ] Dependencias instaladas (`npm ci`)
- [ ] Proyecto construido (`npm run build`)
- [ ] PM2 configurado y aplicación iniciada
- [ ] Apache/Nginx configurado como proxy reverso
- [ ] SSL certificados instalados (Let's Encrypt)
- [ ] Frontend deployado en Vercel
- [ ] DNS configurado (A records para api.snr.red)
- [ ] Firewall configurado (UFW)
- [ ] Rate limiting configurado
- [ ] Backup strategy definida
- [ ] Monitoring configurado
- [ ] Error tracking activo
- [ ] Performance testing completado
- [ ] PM2 configurado para auto-start (`pm2 startup`, `pm2 save`)

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
2. **MongoDB connection**: 
   - Verificar que MongoDB esté corriendo: `sudo systemctl status mongod`
   - Verificar conexión: `mongosh mongodb://localhost:27017`
   - Verificar usuario y permisos de base de datos
3. **Build failures**: Verificar que tipos compartidos estén construidos
4. **SSL issues**: Verificar certificados y DNS propagation
5. **PM2 issues**: 
   - `pm2 logs` para ver errores
   - `pm2 restart snr-red-backend`
   - Verificar que el puerto 3001 esté libre

### Health Checks

- Backend: `https://api.snr.red/health`
- Frontend: `https://snr.red`
- MongoDB local: `mongosh mongodb://localhost:27017`
- PM2 status: `pm2 status`

### Comandos Útiles

```bash
# Verificar servicios
sudo systemctl status mongod
sudo systemctl status apache2
pm2 status

# Logs importantes
pm2 logs
sudo tail -f /var/log/mongodb/mongod.log
sudo tail -f /var/log/apache2/error.log

# Reiniciar servicios
sudo systemctl restart mongod
sudo systemctl restart apache2
pm2 restart all

# Verificar puertos
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :27017
```

---

¡Listo para hacer snr.red viral! 🚀

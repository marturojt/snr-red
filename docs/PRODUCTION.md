# Configuración de Producción - snr.red

## URLs y Dominios
- **Dominio principal**: https://snr.red
- **API**: https://api.snr.red
- **Administración**: https://admin.snr.red (futuro)

## Variables de Entorno de Producción

### Backend (api.snr.red)
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://snrred_user:SECURE_PASSWORD_HERE@localhost:27017/snr-red-prod
JWT_SECRET=SUPER_SECURE_JWT_SECRET_FOR_PRODUCTION_32_CHARS_MIN
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red

# Rate limiting más estricto para producción
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# QR Code settings
QR_CODE_SIZE=200
QR_CODE_FORMAT=png

# Analytics
ANALYTICS_RETENTION_DAYS=730  # 2 años en producción
```

### Frontend (snr.red)
```bash
NEXT_PUBLIC_API_URL=https://api.snr.red
NEXT_PUBLIC_APP_URL=https://snr.red
```

## Configuración DNS Completa

```
# Dominio: snr.red
# Tipo    Nombre    Valor                          TTL
A         @         76.76.19.19 (Vercel IP)       300
A         api       TU_SERVIDOR_IP                 300
CNAME     www       snr.red                        300

# Opcional para futuro
CNAME     admin     admin-subdomain.vercel.app     300
CNAME     docs      snr-red-docs.vercel.app        300
```

## Características de Producción

### Rendimiento
- CDN activado (Vercel/Cloudflare)
- Compresión gzip habilitada
- Cache headers optimizados
- Imágenes QR optimizadas

### Seguridad
- SSL/TLS forzado
- Headers de seguridad (HSTS, CSP)
- Rate limiting por IP
- Validación de entrada estricta
- Logs de seguridad

### Monitoreo
- Uptime monitoring
- Error tracking (Sentry)
- Performance monitoring
- Analytics de uso

### Backup
- Base de datos: backup automático cada 6 horas
- Archivos QR: respaldo en cloud storage
- Configuraciones en git

## Métricas de Producción

### Performance Targets
- Time to First Byte (TTFB): < 200ms
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

### Availability
- Uptime target: 99.9%
- Error rate: < 0.1%
- Response time: < 500ms (95th percentile)

## Configuración de Cloudflare (Recomendado)

### DNS
```
Type: A
Name: @
Content: 76.76.19.19
Proxy: ✅ Proxied

Type: CNAME  
Name: api
Content: your-backend.railway.app
Proxy: ❌ DNS only

Type: CNAME
Name: www
Content: snr.red
Proxy: ✅ Proxied
```

### Page Rules
1. `*snr.red/*` → Always Use HTTPS
2. `snr.red/*` → Cache Level: Standard
3. `api.snr.red/*` → Cache Level: Bypass

### Security Settings
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- Min TLS Version: 1.2
- Opportunistic Encryption: On
- TLS 1.3: On

## Scripts de Mantenimiento

### Limpiar datos expirados
```bash
# Ejecutar semanalmente
node scripts/cleanup-expired-urls.js
```

### Backup manual
```bash
# Base de datos
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d)

# Archivos QR
tar -czf qr-backup-$(date +%Y%m%d).tar.gz uploads/qr/
```

### Health checks
```bash
# Backend
curl https://api.snr.red/health

# Frontend  
curl https://snr.red

# Base de datos
npm run db:health
```

## Logs y Debugging

### Locaciones de logs
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Functions → Logs
- **MongoDB**: Atlas → Monitoring → Logs

### Log levels en producción
```bash
LOG_LEVEL=info  # error, warn, info, debug
```

## Rollback Plan

En caso de problemas:

1. **Frontend**: Revert en Vercel dashboard
2. **Backend**: `railway rollback` o revert commit + redeploy
3. **Base de datos**: Restore desde backup más reciente

## Escalabilidad

### Cuando escalar
- CPU > 80% por 5+ minutos
- Memoria > 85%
- Response time > 1s
- Error rate > 1%

### Opciones de escalado
- **Railway**: Aumentar plan, añadir replicas
- **Vercel**: Escalado automático
- **MongoDB**: Aumentar tier, sharding

## Configuración de MongoDB Local

### Configuración de Producción
```bash
# Archivo de configuración: /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1  # Solo conexiones locales

security:
  authorization: enabled  # Habilitar autenticación

processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid
  timeZoneInfo: /usr/share/zoneinfo
```

### Usuario de Base de Datos
```javascript
// Crear usuario para la aplicación
use snr-red-prod
db.createUser({
  user: "snrred_user",
  pwd: "SECURE_PASSWORD_HERE",
  roles: [
    { role: "readWrite", db: "snr-red-prod" }
  ]
})
```

### Configuración de Backup
```bash
# Script de backup diario
#!/bin/bash
# /home/okami/scripts/backup-mongo.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/okami/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://snrred_user:PASSWORD@localhost:27017/snr-red-prod" \
  --out="$BACKUP_DIR/backup_$DATE"

# Mantener solo los últimos 7 backups
find $BACKUP_DIR -type d -name "backup_*" -mtime +7 -exec rm -rf {} \;
```

### Configuración de Seguridad
```bash
# Firewall - Solo permitir conexiones locales a MongoDB
sudo ufw deny 27017
sudo ufw allow from 127.0.0.1 to any port 27017

# Permisos de archivos
sudo chmod 600 /etc/mongod.conf
sudo chown mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /var/log/mongodb
```

---

🚀 **snr.red está listo para conquistar el mundo de URLs cortas!**

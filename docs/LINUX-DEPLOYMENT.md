# Guía de Despliegue: Linux Server + PM2 + Apache + MongoDB Local

Esta guía te ayudará a desplegar snr.red en tu servidor Linux con la arquitectura específica que mencionaste.

## 🏗️ Arquitectura de Despliegue

```
Internet
    ↓
Apache (Proxy Inverso + SSL)
    ↓
PM2 (Node.js Backend) ← → MongoDB (Local)
    ↑
Vercel (Frontend)
```

## 🚀 Paso a Paso

### 1. Preparar el Servidor

```bash
# En tu servidor Linux (Ubuntu/Debian)
wget https://raw.githubusercontent.com/marturojt/snr-red/main/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

### 2. Configurar MongoDB

```bash
# Crear usuario de aplicación
mongo
> use snr-red
> db.createUser({
    user: "sns-app",
    pwd: "tu-password-seguro",
    roles: ["readWrite", "dbAdmin"]
  })
> exit
```

### 3. Desplegar Backend

```bash
# Desde tu máquina local
./scripts/deploy-to-server.sh [IP-DEL-SERVIDOR] [USUARIO]

# Ejemplo:
./scripts/deploy-to-server.sh 192.168.1.100 ubuntu
```

### 4. Configurar Variables de Entorno

```bash
# En el servidor, editar .env
ssh usuario@servidor
cd /var/www/snr-red/backend
nano .env
```

```bash
# Contenido del .env en producción
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://sns-app:tu-password@localhost:27017/snr-red
JWT_SECRET=tu-jwt-secret-super-seguro-de-32-caracteres-minimo
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
QR_CODE_SIZE=200
QR_CODE_FORMAT=png
ANALYTICS_RETENTION_DAYS=730
```

### 5. Configurar Apache Virtual Host

```bash
# Copiar configuración
sudo cp /path/to/docs/apache-vhost.conf /etc/apache2/sites-available/snr.red.conf

# Habilitar sitio
sudo a2ensite snr.red.conf
sudo systemctl reload apache2
```

### 6. Obtener Certificados SSL

```bash
# Usar Let's Encrypt
sudo certbot --apache -d snr.red -d api.snr.red -d www.snr.red

# Programar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Iniciar Aplicación con PM2

```bash
cd /var/www/snr-red/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Para inicio automático
```

### 8. Configurar DNS

En tu proveedor DNS:
```
A     @       IP-DE-TU-SERVIDOR
CNAME api     snr.red
CNAME www     snr.red
```

### 9. Desplegar Frontend en Vercel

```bash
cd apps/frontend
vercel --prod

# Variables de entorno en Vercel:
NEXT_PUBLIC_API_URL=https://api.snr.red
NEXT_PUBLIC_APP_URL=https://snr.red
```

## 🔧 Comandos de Administración

### PM2
```bash
pm2 status                    # Ver estado
pm2 logs snr-red-api         # Ver logs
pm2 restart snr-red-api      # Reiniciar
pm2 stop snr-red-api         # Detener
pm2 delete snr-red-api       # Eliminar
pm2 monit                    # Monitor en tiempo real
```

### MongoDB
```bash
systemctl status mongod      # Estado del servicio
mongo snr-red               # Conectar a base de datos
tail -f /var/log/mongodb/mongod.log  # Ver logs
```

### Apache
```bash
systemctl status apache2     # Estado
systemctl reload apache2     # Recargar configuración
tail -f /var/log/apache2/snr.red_ssl_error.log  # Ver logs
```

### Logs Centralizados
```bash
# Ver todos los logs importantes
tail -f /var/log/snr-red/*.log
tail -f /var/log/apache2/snr.red*.log
pm2 logs snr-red-api
```

## 📊 Monitoreo y Mantenimiento

### 1. Health Checks
```bash
# Backend
curl https://api.snr.red/health

# Frontend
curl https://snr.red

# Base de datos
mongo --eval "db.adminCommand('ismaster')"
```

### 2. Backups Automatizados
```bash
# Crear script de backup
cat > /usr/local/bin/sns-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db snr-red --out /backups/mongodb/$DATE
tar -czf /backups/files/snr-red-files-$DATE.tar.gz /var/www/snr-red
find /backups -type f -mtime +30 -delete  # Limpiar backups >30 días
EOF

chmod +x /usr/local/bin/sns-backup.sh

# Programar en cron (diario a las 2 AM)
echo "0 2 * * * /usr/local/bin/sns-backup.sh" | crontab -
```

### 3. Actualizaciones
```bash
# Actualizar aplicación
./scripts/deploy-to-server.sh [IP-SERVIDOR] [USUARIO]

# El script automáticamente:
# - Hace backup de la versión anterior
# - Despliega la nueva versión
# - Reinicia PM2
# - Verifica que funcione
```

## 🔒 Seguridad

### Firewall (UFW)
```bash
sudo ufw status
sudo ufw allow from [IP-VERCEL] to any port 3001  # Solo si es necesario
```

### Fail2Ban
```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### Actualizaciones de Seguridad
```bash
# Configurar actualizaciones automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## 🚨 Troubleshooting

### App no inicia
```bash
pm2 logs snr-red-api
# Verificar .env, permisos, MongoDB connection
```

### Error 502 Bad Gateway
```bash
# Verificar que PM2 esté corriendo
pm2 status

# Verificar configuración Apache
sudo apache2ctl configtest
```

### MongoDB Connection Failed
```bash
# Verificar servicio
systemctl status mongod

# Verificar usuario y permisos
mongo snr-red -u sns-app -p
```

### SSL Issues
```bash
# Verificar certificados
sudo certbot certificates

# Renovar si es necesario
sudo certbot renew --dry-run
```

## 📈 Performance

### Optimización Apache
```apache
# En apache-vhost.conf
# Habilitar compresión
LoadModule deflate_module modules/mod_deflate.so
<Location />
    SetOutputFilter DEFLATE
    SetEnvIfNoCase Request_URI \\.(?:gif|jpe?g|png)$ no-gzip dont-vary
    SetEnvIfNoCase Request_URI \\.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
</Location>

# Habilitar cache
LoadModule expires_module modules/mod_expires.so
<Location />
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</Location>
```

### Optimización PM2
```javascript
// En ecosystem.config.js
module.exports = {
  apps: [{
    name: 'snr-red-api',
    script: 'dist/index.js',
    instances: 'max',  // Usa todos los cores
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

---

¡Tu snr.red estará listo para manejar millones de URLs! 🚀

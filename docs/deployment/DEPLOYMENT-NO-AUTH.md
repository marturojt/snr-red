# Deployment SNR.RED - Sin Autenticación MongoDB

Esta configuración utiliza MongoDB sin autenticación para simplificar el deployment y evitar problemas de configuración de usuarios y roles.

## Configuración MongoDB

### 1. Configurar MongoDB sin autenticación

En el servidor, editar `/etc/mongod.conf`:

```yaml
# Deshabilitar autenticación
security:
  authorization: disabled
```

### 2. Reiniciar MongoDB

```bash
sudo systemctl restart mongod
sudo systemctl enable mongod
```

### 3. Verificar que MongoDB esté funcionando

```bash
# Verificar estado
sudo systemctl status mongod

# Probar conexión
mongosh --eval "db.adminCommand('ismaster')"
```

## Variables de Entorno

### Backend (.env)

```bash
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/snr-red-prod
JWT_SECRET=super-secure-random-jwt-secret-32-chars-minimum
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# QR Code settings
QR_CODE_SIZE=200
QR_CODE_FORMAT=png

# Analytics retention (days)
ANALYTICS_RETENTION_DAYS=730
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.snr.red/api
NEXT_PUBLIC_BASE_URL=https://snr.red
```

## Deployment

### 1. Ejecutar script de deployment

```bash
./scripts/deploy-to-server.sh
```

### 2. Verificar servicios

```bash
# En el servidor
ssh freejolitos

# Verificar PM2
pm2 list

# Verificar logs
pm2 logs snr-red-api --lines 20
pm2 logs snr-red-frontend --lines 20

# Verificar MongoDB
mongosh --eval "use snr-red-prod; db.urls.count()"
```

## Seguridad

### Consideraciones importantes:

1. **MongoDB sin autenticación**: Solo recomendado si el servidor tiene firewall configurado correctamente
2. **Acceso a MongoDB**: Debe estar limitado a localhost únicamente
3. **Backup**: Configurar backups automáticos de la base de datos
4. **Monitoreo**: Implementar monitoreo de acceso y uso

### Configuración de Firewall

```bash
# Asegurar que MongoDB solo sea accesible desde localhost
sudo ufw deny 27017
sudo ufw allow from 127.0.0.1 to any port 27017
```

### Backup automático

```bash
# Crear script de backup
cat > /home/okami/backup-mongodb.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/okami/backups/mongodb"
mkdir -p "$BACKUP_DIR"

mongodump --db snr-red-prod --out "$BACKUP_DIR/snr-red-prod_$DATE"
find "$BACKUP_DIR" -name "snr-red-prod_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/snr-red-prod_$DATE"
EOF

chmod +x /home/okami/backup-mongodb.sh

# Añadir a crontab (backup diario a las 2 AM)
echo "0 2 * * * /home/okami/backup-mongodb.sh" | crontab -
```

## Troubleshooting

### Problemas comunes:

1. **MongoDB no inicia**: Verificar logs en `/var/log/mongodb/mongod.log`
2. **Conexión rechazada**: Verificar que MongoDB esté escuchando en localhost:27017
3. **Permisos**: Asegurar que el usuario `mongodb` tenga permisos en `/var/lib/mongodb`

### Comandos útiles:

```bash
# Verificar configuración de MongoDB
cat /etc/mongod.conf | grep -A 3 -B 3 security

# Verificar puertos abiertos
netstat -tulpn | grep :27017

# Verificar datos en MongoDB
mongosh --eval "use snr-red-prod; db.urls.find().limit(5).pretty()"

# Reiniciar todos los servicios
sudo systemctl restart mongod
pm2 restart all
```

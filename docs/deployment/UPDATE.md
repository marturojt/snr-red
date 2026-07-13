# Actualización del servidor — SNR.red

Pasos para desplegar una nueva versión de SNR.red en producción.

## Acceso al servidor

```bash
ssh okami@108.175.12.64 -p10022     # misma VM que el resto de soluciones
sudo su - snrred
```

> **Recordatorio clave:** las variables `NEXT_PUBLIC_*` del frontend se inyectan
> en **build-time**. Si cambiaste alguna, hay que **rebuild** del frontend — no
> basta con reiniciar pm2. El backend no tiene migraciones: Mongoose crea
> colecciones e índices automáticamente al arrancar.

---

## Actualización completa (backend + frontend)

```bash
cd /home/snrred/app
git pull origin dev
npm ci                       # por si cambiaron dependencias
```

### Backend

```bash
cd /home/snrred/app
npm run build:types && npm run build:backend
exit   # volver a root
sudo systemctl restart snr-red-api
sudo systemctl status snr-red-api
```

### Frontend

```bash
sudo su - snrred
cd /home/snrred/app/apps/frontend

# Solo si cambiaron las variables públicas; si no, conserva el .env.production actual
tee .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.snr.red/api
NEXT_PUBLIC_APP_URL=https://snr.red
NEXT_PUBLIC_FEATURE_VCARDS=false
NEXT_PUBLIC_FEATURE_QR=false
EOF

cd /home/snrred/app
npm run build:frontend
pm2 restart snr-red-web
pm2 status
exit
```

---

## Solo backend

```bash
sudo su - snrred
cd /home/snrred/app
git pull origin dev
npm ci
npm run build:types && npm run build:backend
exit
sudo systemctl restart snr-red-api
sudo systemctl status snr-red-api
```

---

## Solo frontend

```bash
sudo su - snrred
cd /home/snrred/app
git pull origin dev
npm ci
cd apps/frontend
# (re-escribe .env.production solo si cambiaron variables públicas)
cd /home/snrred/app
npm run build:frontend
pm2 restart snr-red-web
exit
```

---

## Cambios de esquema / datos

MongoDB con Mongoose **no usa migraciones**: los esquemas e índices (incluidos los
TTL de expiración y retención de analytics) se aplican al arrancar el backend. Si
una versión introduce un cambio de datos que requiere backfill, se documenta aquí
con el script `mongosh` correspondiente.

| Versión | Qué hace | Acción manual |
|---|---|---|
| Fase 1 | API keys (`apikeys`), ownership, endurecimiento de seguridad | Ninguna — los índices se crean solos |

> Nota: al introducir API keys, las URLs anónimas y de usuarios existentes siguen
> funcionando igual. No hay backfill necesario.

---

## Verificación post-actualización

```bash
# Servicios
sudo systemctl status snr-red-api
sudo su - snrred -c "pm2 status"

# Logs en tiempo real
sudo journalctl -u snr-red-api -f
sudo su - snrred -c "pm2 logs snr-red-web --lines 50"

# Salud
curl -s https://api.snr.red/health
curl -s -o /dev/null -w "%{http_code}\n" https://snr.red

# Un short link real debe seguir redirigiendo (ajusta el código)
curl -sI https://snr.red/EJEMPLO_CODE | head -1
```

---

## Reiniciar servicios individualmente

```bash
# Backend (API + redirects)
sudo systemctl restart snr-red-api

# Frontend
sudo su - snrred -c "pm2 restart snr-red-web"

# MongoDB (raro)
sudo systemctl restart mongod
```

---

## Ver logs

```bash
# Backend (últimas 100 líneas)
sudo journalctl -u snr-red-api -n 100 --no-pager

# Frontend
sudo su - snrred -c "pm2 logs snr-red-web --lines 100 --nostream"

# Apache
sudo tail -100 /var/log/apache2/snr.red_ssl_error.log
sudo tail -100 /var/log/apache2/api.snr.red_ssl_error.log
```

---

## Rollback rápido

```bash
sudo su - snrred
cd /home/snrred/app
git log --oneline -5            # localizar el commit estable anterior
git checkout <COMMIT_ESTABLE>
npm ci
npm run build:types && npm run build:backend && npm run build:frontend
exit
sudo systemctl restart snr-red-api
sudo su - snrred -c "pm2 restart snr-red-web"
```

# Despliegue en Servidor Debian — SNR.red

Guía completa para desplegar **SNR.red** (acortador de URLs) en un servidor Debian
(probado en Debian 12/13). Sigue las mismas convenciones que el resto de soluciones
en la VM: **backend en systemd**, **frontend Next.js en pm2**, Apache como reverse
proxy con certbot, y firewall con ufw.

## Arquitectura en producción

```
Internet → Apache (80/443)
   ├── snr.red / www.snr.red
   │      ├── /                    → proxy → Next.js :3000   (frontend — pm2)
   │      └── /<shortCode>         → 301   → api.snr.red/redirect/<shortCode>
   └── api.snr.red
          └── /                    → proxy → Express :3001   (backend — systemd)

Express :3001        ← systemd service: snr-red-api
Next.js :3000        ← pm2: snr-red-web
MongoDB :27017       ← systemd service: mongod (solo 127.0.0.1)
```

- **Short links** viven en `https://snr.red/<code>`. Apache reescribe los códigos
  al backend, que registra el clic y hace el `301` al destino.
- **Dashboard y API** conviven: el navegador usa `api.snr.red` (JWT + `x-user-id`),
  y las integraciones server-to-server usan API keys sobre `api.snr.red/api/v1`.

---

## 1. Requisitos del servidor

**SO:** Debian 12 Bookworm o Debian 13 Trixie
**Mínimo:** 1 vCPU, 2 GB RAM, 20 GB disco (holgado para MongoDB + analytics).

**Dependencias base:**

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential curl wget git gnupg unzip \
  apache2 certbot python3-certbot-apache \
  ufw
```

---

## 2. Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # v22.x
npm --version    # >= 10
```

---

## 3. MongoDB 7

```bash
# Repo oficial de MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian $(. /etc/os-release; echo $VERSION_CODENAME)/mongodb-org/7.0 main" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

> Si el repo de MongoDB no publica aún tu `VERSION_CODENAME` (p.ej. `trixie`),
> usa el codename estable más cercano (`bookworm`) en la línea del repo.

### 3.1 Habilitar autenticación y bindear a localhost

```bash
# Crear usuario admin y usuario de aplicación (antes de activar auth)
mongosh <<'EOF'
use admin
db.createUser({ user: "admin", pwd: "TU_PASSWORD_ADMIN", roles: ["root"] })
use snr-red-prod
db.createUser({ user: "snr_app", pwd: "TU_PASSWORD_APP", roles: [{ role: "readWrite", db: "snr-red-prod" }] })
EOF
```

Editar `/etc/mongod.conf`:

```yaml
net:
  bindIp: 127.0.0.1     # nunca exponer al exterior
  port: 27017
security:
  authorization: enabled
```

```bash
sudo systemctl restart mongod
```

La cadena de conexión resultante (irá en el `.env` del backend):
`mongodb://snr_app:TU_PASSWORD_APP@127.0.0.1:27017/snr-red-prod?authSource=snr-red-prod`

---

## 4. Usuario de aplicación y código

```bash
sudo useradd -m -s /bin/bash snrred
```

Si el repo es privado y root tiene SSH key en GitHub:

```bash
sudo mkdir -p /home/snrred/.ssh
sudo cp /root/.ssh/id_rsa /root/.ssh/id_rsa.pub /root/.ssh/known_hosts /home/snrred/.ssh/ 2>/dev/null || true
sudo chown -R snrred:snrred /home/snrred/.ssh
sudo chmod 700 /home/snrred/.ssh && sudo chmod 600 /home/snrred/.ssh/id_rsa 2>/dev/null || true
```

Clonar y construir (los tres workspaces: types → backend → frontend):

```bash
sudo su - snrred

git clone git@github.com:marturojt/snr-red.git /home/snrred/app
cd /home/snrred/app
git checkout dev

npm ci
```

> El build del frontend se hace **después** de crear su `.env.production`
> (paso 6), porque las variables `NEXT_PUBLIC_*` se inyectan en build-time.

---

## 5. Backend (Express — systemd)

### 5.1 Archivo de entorno

```bash
tee /home/snrred/app/apps/backend/.env << 'EOF'
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://snr_app:TU_PASSWORD_APP@127.0.0.1:27017/snr-red-prod?authSource=snr-red-prod
JWT_SECRET=GENERA_CON_openssl_rand_-hex_32
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red

# Rate limit global (por IP) en /api/
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Rate limit de la API pública (por API key) en /api/v1
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=120

# QR y retención de analytics
QR_CODE_SIZE=200
QR_CODE_FORMAT=png
ANALYTICS_RETENTION_DAYS=365
EOF

chmod 600 /home/snrred/app/apps/backend/.env
```

Genera el `JWT_SECRET` (obligatorio: el backend **aborta el arranque en producción**
si falta o mide menos de 32 chars):

```bash
openssl rand -hex 32
```

### 5.2 Build del backend

```bash
cd /home/snrred/app
npm run build:types && npm run build:backend
# genera apps/backend/dist/index.js
exit   # salir del usuario snrred
```

### 5.3 Servicio systemd

```bash
sudo tee /etc/systemd/system/snr-red-api.service << 'EOF'
[Unit]
Description=SNR.red API (Express)
After=network.target mongod.service

[Service]
User=snrred
Group=snrred
WorkingDirectory=/home/snrred/app/apps/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now snr-red-api
sudo systemctl status snr-red-api
curl -s http://127.0.0.1:3001/health   # {"status":"OK",...}
```

> El backend lee `apps/backend/.env` vía `dotenv` desde su `WorkingDirectory`,
> por eso no se usa `EnvironmentFile`.

---

## 6. Frontend (Next.js — pm2)

### 6.1 Entorno de build (CRÍTICO: build-time)

```bash
sudo su - snrred
cd /home/snrred/app/apps/frontend

tee .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.snr.red/api
NEXT_PUBLIC_APP_URL=https://snr.red
NEXT_PUBLIC_FEATURE_VCARDS=false
NEXT_PUBLIC_FEATURE_QR=false
EOF
```

> `NEXT_PUBLIC_API_URL` **debe** incluir el sufijo `/api`. vCard/QR quedan ocultos
> (Fase 1 = core + API); ponlos en `true` cuando quieras habilitarlos.

### 6.2 Build

```bash
cd /home/snrred/app
npm run build:frontend
```

### 6.3 Iniciar con pm2

```bash
exit   # a root
sudo npm install -g pm2

sudo su - snrred
cd /home/snrred/app/apps/frontend
# `next start` escucha en el puerto 3000 por defecto. Para otro puerto: PORT=xxxx
pm2 start npm --name snr-red-web -- start
pm2 save
exit

# Arranque automático con el sistema
sudo pm2 startup systemd -u snrred --hp /home/snrred
# Ejecuta el comando que pm2 imprima
```

Verificar:

```bash
sudo su - snrred -c "pm2 status"
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000   # 200
```

---

## 7. Apache como reverse proxy

### 7.1 Módulos

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl
sudo systemctl restart apache2
```

### 7.2 VirtualHost HTTP (para certbot) — snr.red + api.snr.red

```bash
sudo tee /etc/apache2/sites-available/snr-red.conf << 'EOF'
<VirtualHost *:80>
    ServerName snr.red
    ServerAlias www.snr.red api.snr.red
    Redirect permanent / https://snr.red/
</VirtualHost>
EOF

sudo a2ensite snr-red.conf
sudo systemctl reload apache2
```

### 7.3 Certificado SSL (incluye el subdominio api)

```bash
sudo certbot certonly --apache -d snr.red -d www.snr.red -d api.snr.red
```

### 7.4 VirtualHost HTTPS

El proyecto trae la plantilla en `docs/config/apache-snr.red.conf` (ya con la
regla de reescritura de short codes corregida). Cópiala y actívala:

```bash
sudo cp /home/snrred/app/docs/config/apache-snr.red.conf \
        /etc/apache2/sites-available/snr-red-ssl.conf
sudo a2ensite snr-red-ssl.conf
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Puntos clave de esa config (verifícalos):
- **snr.red (:443)** → proxy a `http://127.0.0.1:3000`, y una `RewriteRule` que
  manda los short codes (3–20 chars, excluyendo `admin`, `vcard`, `v`, `api`,
  `health`, `_next`, assets) a `https://api.snr.red/redirect/$1`.
- **api.snr.red (:443)** → proxy a `http://127.0.0.1:3001`. CORS lo maneja Express.
- Rutas de certificados apuntando a `/etc/letsencrypt/live/snr.red/`.

El certificado se renueva solo:

```bash
sudo systemctl status certbot.timer
```

---

## 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'   # 80 + 443
# NO exponer: 3000, 3001, 27017
sudo ufw enable
sudo ufw status
```

---

## 9. (Opcional) Crear un usuario admin

Regístralo desde la API y márcalo admin en Mongo:

```bash
curl -s -X POST https://api.snr.red/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"TU_EMAIL","password":"TU_PASSWORD","name":"Admin"}'

mongosh "mongodb://snr_app:TU_PASSWORD_APP@127.0.0.1:27017/snr-red-prod?authSource=snr-red-prod" \
  --eval "db.users.updateOne({email:'TU_EMAIL'}, {\$set:{isAdmin:true, plan:'premium'}})"
```

Luego entra a `https://snr.red` (dashboard) y `https://snr.red/admin` (panel).

---

## 10. Verificación post-despliegue

```bash
# Servicios
sudo systemctl status snr-red-api mongod
sudo su - snrred -c "pm2 status"

# Logs
sudo journalctl -u snr-red-api -f
sudo su - snrred -c "pm2 logs snr-red-web"

# Salud del API y del sitio
curl -s https://api.snr.red/health
curl -s -o /dev/null -w "%{http_code}\n" https://snr.red

# Flujo API keys end-to-end (registra, crea key, acorta, redirige)
TOKEN=$(curl -s -X POST https://api.snr.red/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke@snr.red","password":"secret123","name":"Smoke"}' | \
  node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.token))")
KEY=$(curl -s -X POST https://api.snr.red/api/keys -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"smoke"}' | \
  node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.token))")
curl -s -X POST https://api.snr.red/api/v1/urls -H "X-API-Key: $KEY" \
  -H 'Content-Type: application/json' -d '{"originalUrl":"https://example.com"}'
```

---

## 11. Variables de entorno — resumen

### Backend (`apps/backend/.env`)
| Variable | Descripción | Obligatoria |
|---|---|---|
| `MONGODB_URI` | Conexión a MongoDB (con auth) | ✅ |
| `JWT_SECRET` | Secreto JWT — random, >= 32 chars | ✅ |
| `BASE_URL` | Base de los short links (`https://snr.red`) | ✅ |
| `FRONTEND_URL` | Origen permitido para CORS | ✅ |
| `PORT` | Puerto del backend (3001) | ✅ |
| `API_RATE_LIMIT_*` | Rate limit de la API pública por key | ⚠️ |

### Frontend (`apps/frontend/.env.production`, build-time)
| Variable | Descripción | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.snr.red/api` (incluye `/api`) | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://snr.red` | ✅ |
| `NEXT_PUBLIC_FEATURE_VCARDS` | Mostrar vCard (`false` en Fase 1) | ⚠️ |
| `NEXT_PUBLIC_FEATURE_QR` | Mostrar QR (`false` en Fase 1) | ⚠️ |

---

## 12. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Backend no arranca, log dice `FATAL: JWT_SECRET...` | Secreto ausente/débil en prod | Poner `JWT_SECRET` random >= 32 chars |
| `502 Bad Gateway` en snr.red | Frontend caído | `pm2 status` / `pm2 restart snr-red-web` |
| `502 Bad Gateway` en api.snr.red | Backend caído | `systemctl status snr-red-api` |
| Llamadas del navegador van a `/urls` y dan 404 | Falta `/api` en `NEXT_PUBLIC_API_URL` | Corregir `.env.production` y **rebuild** |
| Cambié `NEXT_PUBLIC_*` y no toma efecto | Son build-time | Rebuild del frontend, no basta reiniciar pm2 |
| `/admin` redirige al backend | Regla de rewrite mal | Verificar exclusiones en `apache-snr.red.conf` |
| Mongo rechaza conexión | Auth mal / URI incorrecta | Revisar `authSource` y credenciales |
| Short link da 404 | Código no existe o `isActive:false` | Normal si expiró; ver colección `urls` |
| CORS error en browser | `FRONTEND_URL` != origen real | Debe ser exactamente `https://snr.red` |
| certbot falla al validar | Vhost SSL activado antes del cert | Obtener cert con el vhost HTTP, luego activar SSL |
```

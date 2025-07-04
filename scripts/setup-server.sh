#!/bin/bash

# Script de configuración para servidor Linux - snr.red
# Ejecutar como usuario okami con sudo

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 Configurando servidor para snr.red..."

# 1. Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_status "Sistema actualizado"

# 2. Instalar dependencias
echo "🔧 Instalando dependencias..."
sudo apt install -y curl wget git apache2 certbot python3-certbot-apache ufw fail2ban

# 3. Instalar Node.js (v18 LTS)
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs
print_status "Node.js $(node --version) instalado"

# 4. Instalar MongoDB
echo "🗄️  Instalando MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor | sudo tee /usr/share/keyrings/mongodb.gpg > /dev/null
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar y habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
print_status "MongoDB instalado y configurado"

# 5. Instalar PM2
echo "⚙️  Instalando PM2..."
npm install -g pm2
pm2 startup
print_status "PM2 instalado"

# 6. Configurar directorios
echo "📁 Configurando directorios..."
sudo mkdir -p /var/www/snr-red/backend
sudo mkdir -p /var/log/snr-red
sudo chown -R okami:www-data /var/www/snr-red
sudo chown -R okami:www-data /var/log/snr-red
sudo chmod -R 755 /var/www/snr-red
sudo chmod -R 755 /var/log/snr-red
print_status "Directorios configurados"

# 7. Configurar Apache
echo "🌐 Configurando Apache..."
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers

# Deshabilitar sitio por defecto
sudo a2dissite 000-default
sudo systemctl reload apache2
print_status "Apache configurado"

# 8. Configurar Firewall
echo "🔒 Configurando firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 27017/tcp  # MongoDB (solo local)
print_status "Firewall configurado"

# 9. Configurar Fail2Ban
echo "🛡️  Configurando Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[apache-auth]
enabled = true

[apache-badbots]
enabled = true

[apache-noscript]
enabled = true

[apache-overflows]
enabled = true
EOF

systemctl restart fail2ban
print_status "Fail2Ban configurado"

# 10. Optimizar MongoDB
echo "⚡ Optimizando MongoDB..."
cat > /etc/mongod.conf << EOF
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
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: enabled
EOF

systemctl restart mongod
print_status "MongoDB optimizado"

# 11. Crear usuario de MongoDB
echo "👤 Configurando usuario de MongoDB..."
mongo << EOF
use admin
db.createUser({
  user: "sns-admin",
  pwd: "$(openssl rand -base64 32)",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

use snr-red
db.createUser({
  user: "snr-app",
  pwd: "$(openssl rand -base64 32)",
  roles: ["readWrite", "dbAdmin"]
})
EOF

print_warning "⚠️  Guarda las contraseñas generadas para MongoDB"

echo ""
print_status "🎉 Servidor configurado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Copiar archivos del backend a /var/www/snr-red/backend/"
echo "2. Configurar variables de entorno en .env"
echo "3. Instalar dependencias: cd /var/www/snr-red/backend && npm ci --only=production"
echo "4. Construir aplicación: npm run build"
echo "5. Configurar virtual host de Apache"
echo "6. Obtener certificados SSL: certbot --apache -d snr.red -d api.snr.red"
echo "7. Iniciar con PM2: pm2 start ecosystem.config.js"
echo "8. Configurar DNS para apuntar a este servidor"
echo ""
echo "🔧 Comandos útiles:"
echo "- Ver logs de PM2: pm2 logs"
echo "- Reiniciar app: pm2 restart sns-red-api"
echo "- Ver estado: pm2 status"
echo "- Logs de Apache: tail -f /var/log/apache2/snr.red_ssl_error.log"
echo "- Logs de MongoDB: tail -f /var/log/mongodb/mongod.log"

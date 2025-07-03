#!/bin/bash

# Script para deployar backend a servidor Linux con PM2
# Usage: ./scripts/deploy-to-server.sh [server-ip] [user]

set -e

SERVER_IP=${1:-"your-server-ip"}
SERVER_USER=${2:-"root"}
BACKEND_PATH="/var/www/snr-red/backend"

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

if [ "$SERVER_IP" = "your-server-ip" ]; then
    print_error "Por favor proporciona la IP del servidor"
    echo "Usage: ./scripts/deploy-to-server.sh [server-ip] [user]"
    echo "Example: ./scripts/deploy-to-server.sh 192.168.1.100 ubuntu"
    exit 1
fi

echo "🚀 Desplegando snr.red backend a $SERVER_IP..."

# 1. Construir types compartidos
echo "🔧 Construyendo tipos compartidos..."
cd packages/types
npm run build
cd ../..
print_status "Tipos construidos"

# 2. Construir backend
echo "🏗️  Construyendo backend..."
cd apps/backend
npm run build
cd ../..
print_status "Backend construido"

# 3. Crear archivo temporal con archivos necesarios
echo "📦 Preparando archivos para transfer..."
tar -czf /tmp/snr-red-backend.tar.gz \
    apps/backend/dist \
    apps/backend/package.json \
    apps/backend/package-lock.json \
    apps/backend/ecosystem.config.js \
    apps/backend/.env.example \
    packages/types/dist

print_status "Archivos preparados"

# 4. Transferir archivos al servidor
echo "📤 Transfiriendo archivos al servidor..."
scp /tmp/snr-red-backend.tar.gz $SERVER_USER@$SERVER_IP:/tmp/
print_status "Archivos transferidos"

# 5. Desplegar en el servidor
echo "🚀 Desplegando en el servidor..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    set -e
    
    # Detener aplicación si está corriendo
    pm2 stop snr-red-api 2>/dev/null || true
    
    # Backup de la versión anterior
    if [ -d /var/www/snr-red/backend ]; then
        mv /var/www/snr-red/backend /var/www/snr-red/backend.backup.$(date +%Y%m%d-%H%M%S)
    fi
    
    # Crear directorio y extraer archivos
    mkdir -p /var/www/snr-red/backend
    cd /var/www/snr-red/backend
    tar -xzf /tmp/snr-red-backend.tar.gz --strip-components=2
    
    # Mover archivos de tipos compartidos
    mkdir -p node_modules/@url-shortener/types
    cp -r packages/types/dist/* node_modules/@url-shortener/types/
    
    # Configurar .env si no existe
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "⚠️  Recuerda configurar las variables de entorno en .env"
    fi
    
    # Instalar dependencias de producción
    npm ci --only=production
    
    # Crear directorios necesarios
    mkdir -p uploads/qr
    chown -R www-data:www-data uploads
    
    # Iniciar con PM2
    pm2 start ecosystem.config.js
    pm2 save
    
    # Limpiar archivo temporal
    rm /tmp/snr-red-backend.tar.gz
    
    echo "✅ Despliegue completado"
EOF

# 6. Verificar despliegue
echo "🧪 Verificando despliegue..."
sleep 5

# Check si el servidor responde
if curl -f http://$SERVER_IP:3001/health > /dev/null 2>&1; then
    print_status "Backend está funcionando correctamente"
else
    print_warning "Backend podría estar iniciándose, verifica los logs con: ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"
fi

# 7. Limpiar archivos temporales locales
rm /tmp/snr-red-backend.tar.gz

echo ""
print_status "🎉 Despliegue completado!"
echo ""
echo "📋 Comandos útiles para el servidor:"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 logs snr-red-api'"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 restart snr-red-api'"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 monit'"
echo ""
echo "🌐 URLs de prueba:"
echo "   Backend: http://$SERVER_IP:3001/health"
echo "   API: http://$SERVER_IP:3001/api/urls/shorten"
echo ""
echo "📝 No olvides:"
echo "   1. Configurar virtual host de Apache"
echo "   2. Obtener certificados SSL"
echo "   3. Configurar DNS"
echo "   4. Configurar variables de entorno en .env"

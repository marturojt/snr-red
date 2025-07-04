#!/bin/bash

# Script para deployar backend a servidor Linux con PM2
# Usage: ./scripts/deploy-to-server-fixed.sh [server-ip-or-host] [user] [port]

set -e

SERVER_HOST=${1:-"your-server-ip"}
SERVER_USER=${2:-"okami"}
SERVER_PORT=${3:-"22"}
BACKEND_PATH="/var/www/snr-red/backend"

# Si el primer parámetro parece ser un host SSH configurado, usar configuración SSH
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]] && ! [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Es un hostname, usar configuración SSH (sin especificar puerto)
    SSH_HOST="$SERVER_HOST"
    SCP_HOST="$SERVER_HOST"
    HEALTH_CHECK_HOST="$SERVER_HOST"
else
    # Es una IP, usar configuración manual con puerto
    SSH_HOST="$SERVER_USER@$SERVER_HOST"
    SCP_HOST="$SERVER_USER@$SERVER_HOST"
    HEALTH_CHECK_HOST="$SERVER_HOST"
    
    # Agregar puerto si no es el estándar
    if [ "$SERVER_PORT" != "22" ]; then
        SSH_OPTIONS="-p $SERVER_PORT"
        SCP_OPTIONS="-P $SERVER_PORT"
    else
        SSH_OPTIONS=""
        SCP_OPTIONS=""
    fi
fi

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

if [ "$SERVER_HOST" = "your-server-ip" ]; then
    print_error "Por favor proporciona la IP del servidor o nombre del host SSH"
    echo "Usage: ./scripts/deploy-to-server-fixed.sh [server-ip-or-host] [user] [port]"
    echo "Examples:"
    echo "  ./scripts/deploy-to-server-fixed.sh freejolitos                    # Usar configuración SSH"
    echo "  ./scripts/deploy-to-server-fixed.sh 192.168.1.100 okami 10022     # IP con puerto personalizado"
    echo "  ./scripts/deploy-to-server-fixed.sh 192.168.1.100 okami           # IP con puerto estándar (22)"
    exit 1
fi

echo "🚀 Desplegando snr.red backend a $SERVER_HOST..."

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

# Crear directorio temporal para organizar archivos
TEMP_DIR="/tmp/snr-red-deploy"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR/backend
mkdir -p $TEMP_DIR/types

# Copiar archivos del backend manteniendo estructura
cp -r apps/backend/dist $TEMP_DIR/backend/
cp apps/backend/package.json $TEMP_DIR/backend/
cp apps/backend/ecosystem.config.js $TEMP_DIR/backend/
cp apps/backend/.env.example $TEMP_DIR/backend/

# Copiar package-lock.json solo si existe
if [ -f "apps/backend/package-lock.json" ]; then
    cp apps/backend/package-lock.json $TEMP_DIR/backend/
    print_status "Incluyendo package-lock.json"
else
    print_warning "package-lock.json no encontrado, se usará npm install en el servidor"
fi

# Copiar tipos compartidos
cp -r packages/types/dist $TEMP_DIR/types/

# Crear el tar desde el directorio temporal (evita warnings de macOS)
cd $TEMP_DIR
tar --no-xattrs -czf /tmp/snr-red-backend.tar.gz backend types
cd - > /dev/null

# Limpiar directorio temporal
rm -rf $TEMP_DIR

print_status "Archivos preparados"

# 4. Transferir archivos al servidor
echo "📤 Transfiriendo archivos al servidor..."
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]] && ! [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Usar configuración SSH del archivo ~/.ssh/config
    scp /tmp/snr-red-backend.tar.gz $SCP_HOST:/tmp/
else
    # Usar IP con puerto específico
    scp $SCP_OPTIONS /tmp/snr-red-backend.tar.gz $SCP_HOST:/tmp/
fi
print_status "Archivos transferidos"

# 5. Desplegar en el servidor
echo "🚀 Desplegando en el servidor..."

# Crear script para ejecutar en el servidor
cat > /tmp/deploy-script.sh << 'DEPLOY_SCRIPT'
set -e

# Detener aplicación si está corriendo
pm2 stop snr-red-api 2>/dev/null || true

# Backup de la versión anterior (con sudo para permisos)
if [ -d /var/www/snr-red/backend ]; then
    sudo mv /var/www/snr-red/backend /var/www/snr-red/backend.backup.$(date +%Y%m%d-%H%M%S)
fi

# Crear directorio y extraer archivos (con sudo para permisos)
sudo mkdir -p /var/www/snr-red/backend
cd /tmp
tar -xzf snr-red-backend.tar.gz

# Copiar archivos manteniendo estructura correcta
sudo cp -r backend/* /var/www/snr-red/backend/

# Crear directorio para node_modules/@url-shortener si no existe
sudo mkdir -p /var/www/snr-red/backend/node_modules/@url-shortener

# Copiar tipos compartidos a node_modules (si el directorio existe)
if [ -d "types" ]; then
    sudo cp -r types /var/www/snr-red/backend/node_modules/@url-shortener/ 2>/dev/null || true
fi

# Cambiar al directorio de trabajo
cd /var/www/snr-red/backend

# Configurar permisos para el usuario okami
sudo chown -R okami:www-data /var/www/snr-red/backend
sudo chmod -R 755 /var/www/snr-red/backend

# Configurar .env si no existe
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  Archivo .env creado desde .env.example - Recuerda configurar las variables de entorno"
    else
        echo "⚠️  Archivo .env.example no encontrado - Creando .env básico"
        cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://snrred_user:your_password@localhost:27017/snr-red-prod
JWT_SECRET=change-this-in-production-32-chars-minimum
BASE_URL=https://snr.red
FRONTEND_URL=https://snr.red
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
QR_CODE_SIZE=200
QR_CODE_FORMAT=png
ANALYTICS_RETENTION_DAYS=730
ENVEOF
    fi
    echo "📝 Por favor configura las variables de entorno en /var/www/snr-red/backend/.env"
fi

# Instalar dependencias de producción
if [ -f package-lock.json ]; then
    echo "📦 Usando npm ci (package-lock.json encontrado)"
    npm ci --only=production
else
    echo "📦 Usando npm install (package-lock.json no encontrado)"
    npm install --only=production
fi

# Crear directorios necesarios para uploads
mkdir -p uploads/qr
sudo chown -R okami:www-data uploads
sudo chmod -R 755 uploads

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save

# Limpiar archivos temporales
rm /tmp/snr-red-backend.tar.gz
rm /tmp/deploy-script.sh

echo "✅ Despliegue completado"
DEPLOY_SCRIPT

# Transferir y ejecutar script
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]] && ! [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    scp /tmp/deploy-script.sh $SCP_HOST:/tmp/
    ssh $SSH_HOST 'bash /tmp/deploy-script.sh'
else
    scp $SCP_OPTIONS /tmp/deploy-script.sh $SCP_HOST:/tmp/
    ssh $SSH_OPTIONS $SSH_HOST 'bash /tmp/deploy-script.sh'
fi

# 6. Verificar despliegue
echo "🧪 Verificando despliegue..."
sleep 5

# Check si el servidor responde (solo si tenemos una IP específica)
if [[ "$HEALTH_CHECK_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    if curl -f http://$HEALTH_CHECK_HOST:3001/health > /dev/null 2>&1; then
        print_status "Backend está funcionando correctamente"
    else
        print_warning "Backend podría estar iniciándose, verifica los logs"
    fi
else
    print_warning "Health check omitido para hostname configurado. Verifica manualmente."
fi

# 7. Limpiar archivos temporales locales
rm -f /tmp/snr-red-backend.tar.gz
rm -f /tmp/deploy-script.sh

echo ""
print_status "🎉 Despliegue completado!"
echo ""
echo "📋 Comandos útiles para el servidor:"
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]] && ! [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "   ssh $SERVER_HOST 'pm2 status'"
    echo "   ssh $SERVER_HOST 'pm2 logs snr-red-api'"
    echo "   ssh $SERVER_HOST 'pm2 restart snr-red-api'"
    echo "   ssh $SERVER_HOST 'pm2 monit'"
else
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 status'"
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 logs snr-red-api'"
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 restart snr-red-api'"
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 monit'"
fi
echo ""
echo "🌐 URLs de prueba:"
echo "   Backend: http://$HEALTH_CHECK_HOST:3001/health"
echo "   API: http://$HEALTH_CHECK_HOST:3001/api/urls/shorten"
echo ""
echo "📝 No olvides:"
echo "   1. Configurar virtual host de Apache"
echo "   2. Obtener certificados SSL"
echo "   3. Configurar DNS"
echo "   4. Configurar variables de entorno en .env"

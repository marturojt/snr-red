#!/bin/bash

# =============================================================================
# SNR.RED - URL Shortener Deployment Script
# =============================================================================
# 
# Este script deploya automáticamente el proyecto SNR.RED a un servidor Linux
# Configuración: MongoDB sin autenticación para simplificar el deployment
# 
# Uso: ./deploy-to-server.sh
# 
# Requisitos:
# - MongoDB instalado en el servidor (sin autenticación)
# - Node.js y npm instalados
# - PM2 para gestión de procesos
# - Apache configurado como reverse proxy
# 
# =============================================================================

# Script para deployar backend a servidor Linux con PM2
# Usage: ./scripts/deploy-to-serve    # Restaurar .env si había backup
    if [ -f "/tmp/snr-red-backend-env-backup" ]; then
        sudo cp /tmp/snr-red-backend-env-backup apps/backend/.env
echo "📋 Comandos útiles para el servidor:"
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]] && ! [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "   ssh $SERVER_HOST 'pm2 status'"
    echo "   ssh $SERVER_HOST 'pm2 logs'"
    echo "   ssh $SERVER_HOST 'pm2 restart snr-red-api'"
    echo "   ssh $SERVER_HOST 'pm2 restart snr-red-frontend'"
    echo "   ssh $SERVER_HOST 'pm2 monit'"
else
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 status'"
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 logs'"
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 restart snr-red-api'"
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 restart snr-red-frontend'"
    echo "   ssh $SSH_OPTIONS $SSH_HOST 'pm2 monit'"
fi
echo ""
echo "🌐 URLs de prueba:"
echo "   Frontend: http://$HEALTH_CHECK_HOST:3000"
echo "   Backend: http://$HEALTH_CHECK_HOST:3001/health"
echo "   API: http://$HEALTH_CHECK_HOST:3001/api/urls/shorten"/tmp/snr-red-backend-env-backup
        echo "🔒 .env backend restaurado"
    fi
    
    if [ -f "/tmp/snr-red-frontend-env-backup" ]; then
        sudo cp /tmp/snr-red-frontend-env-backup apps/frontend/.env.local
        sudo rm /tmp/snr-red-frontend-env-backup
        echo "🔒 .env frontend restaurado"
    fi

server-ip-or-host] [user] [port] [git-repo-url]

set -e

SERVER_HOST=${1:-"your-server-ip"}
SERVER_USER=${2:-"okami"}
SERVER_PORT=${3:-"22"}
GIT_REPO=${4:-"git@github.com:marturojt/snr-red.git"}
BACKEND_PATH="/var/www/snr-red"

# Si el primer parámetro parece ser un host SSH configurado, usar configuración SSH
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]] && ! [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Es un hostname, usar configuración SSH (sin especificar puerto)
    SSH_HOST="$SERVER_HOST"
    SCP_HOST="$SERVER_HOST"
    # Para verificación de health, intentamos obtener la IP real o usar el hostname
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
    echo "Usage: ./scripts/deploy-to-server.sh [server-ip-or-host] [user] [port] [git-repo-url]"
    echo "Examples:"
    echo "  ./scripts/deploy-to-server.sh freejolitos                                           # Usar configuración SSH"
    echo "  ./scripts/deploy-to-server.sh freejolitos okami 22 git@github.com:marturojt/snr-red.git    # Con repo específico"
    echo "  ./scripts/deploy-to-server.sh 192.168.1.100 okami 10022                           # IP con puerto personalizado"
    exit 1
fi

echo "🚀 Desplegando snr.red backend a $SERVER_HOST..."
echo "📍 Repositorio: $GIT_REPO"

# 1. Verificar y preparar servidor
echo "� Verificando estado del servidor..."

# Crear script para ejecutar en el servidor
cat > /tmp/deploy-script.sh << DEPLOY_SCRIPT
#!/bin/bash
set -e

GIT_REPO="$GIT_REPO"
BACKEND_PATH="$BACKEND_PATH"

echo "🔍 Verificando repositorio en el servidor..."

# Verificar si el repositorio ya existe
if [ -d "\$BACKEND_PATH/.git" ]; then
    echo "📦 Repositorio existente encontrado - Actualizando..."
    cd \$BACKEND_PATH
    
    # Detener aplicación si está corriendo
    pm2 stop snr-red-api 2>/dev/null || true
    
    # Hacer backup de .env si existe
    if [ -f "apps/backend/.env" ]; then
        sudo cp apps/backend/.env /tmp/snr-red-backend-env-backup
        echo "🔒 Backup de .env backend creado"
    fi
    
    if [ -f "apps/frontend/.env.local" ]; then
        sudo cp apps/frontend/.env.local /tmp/snr-red-frontend-env-backup
        echo "🔒 Backup de .env frontend creado"
    fi
    
    # Actualizar código desde la rama prod
    git fetch origin
    git reset --hard origin/prod
    
    # Restaurar .env si había backup
    if [ -f "/tmp/snr-red-env-backup" ]; then
        sudo cp /tmp/snr-red-env-backup apps/backend/.env
        sudo rm /tmp/snr-red-env-backup
        echo "� .env restaurado"
    fi
    
else
    echo "🆕 Primera instalación - Clonando repositorio..."
    
    # Crear directorio y clonar
    sudo mkdir -p \$(dirname \$BACKEND_PATH)
    if [ -d "\$BACKEND_PATH" ]; then
        sudo mv \$BACKEND_PATH \$BACKEND_PATH.backup.\$(date +%Y%m%d-%H%M%S)
    fi
    
    sudo git clone -b prod \$GIT_REPO \$BACKEND_PATH
    sudo chown -R $SERVER_USER:www-data \$BACKEND_PATH
    cd \$BACKEND_PATH
fi

echo "📦 Instalando dependencias..."
# Instalar dependencias del monorepo
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

echo "🔧 Construyendo proyecto..."
# Construir tipos, backend y frontend
npm run build:types
npm run build:backend
npm run build:frontend

# Configurar .env si no existe
if [ ! -f "apps/backend/.env" ]; then
    echo "⚙️  Configurando variables de entorno backend..."
    cp apps/backend/.env.example apps/backend/.env
    
    # Configurar valores por defecto para producción
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' apps/backend/.env
    sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/snr-red-prod|' apps/backend/.env
    sed -i 's|BASE_URL=.*|BASE_URL=https://snr.red|' apps/backend/.env
    sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://snr.red|' apps/backend/.env
    sed -i 's/RATE_LIMIT_MAX_REQUESTS=100/RATE_LIMIT_MAX_REQUESTS=50/' apps/backend/.env
    sed -i 's/ANALYTICS_RETENTION_DAYS=365/ANALYTICS_RETENTION_DAYS=730/' apps/backend/.env
    
    echo "📝 Archivo .env backend configurado con valores de producción"
fi

# Configurar .env.local para frontend si no existe
if [ ! -f "apps/frontend/.env.local" ]; then
    echo "⚙️  Configurando variables de entorno frontend..."
    cat > apps/frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://api.snr.red/api
NEXT_PUBLIC_APP_URL=https://snr.red
EOF
    echo "📝 Archivo .env.local frontend configurado"
fi

# Crear directorios necesarios
echo "📁 Creando directorios de uploads y logs..."
mkdir -p apps/backend/uploads/qr
sudo mkdir -p /var/log/snr-red
sudo chown -R $SERVER_USER:www-data apps/backend/uploads
sudo chown -R $SERVER_USER:www-data /var/log/snr-red
sudo chmod -R 755 apps/backend/uploads
sudo chmod -R 755 /var/log/snr-red

# Configurar permisos
sudo chown -R $SERVER_USER:www-data \$BACKEND_PATH
sudo chmod -R 755 \$BACKEND_PATH

echo "🚀 Iniciando aplicaciones con PM2..."

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    sudo npm install -g pm2
fi

# Detener aplicaciones existentes
pm2 stop snr-red-api 2>/dev/null || true
pm2 stop snr-red-frontend 2>/dev/null || true

# Iniciar backend
echo "🔧 Iniciando backend..."
cd apps/backend
pm2 start ecosystem.config.js --env production

# Iniciar frontend
echo "🌐 Iniciando frontend..."
cd ../frontend
pm2 start ecosystem.config.js --env production

# Configurar PM2 para auto-start
pm2 startup 2>/dev/null || true
pm2 save

echo "✅ Despliegue completado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Editar /var/www/snr-red/apps/backend/.env con tus credenciales"
echo "   2. Reiniciar aplicaciones: pm2 restart snr-red-api snr-red-frontend"
echo "   3. Verificar logs: pm2 logs"
echo "   4. Verificar estado: pm2 status"
DEPLOY_SCRIPT

# 5. Ejecutar script de despliegue en el servidor
echo "🚀 Ejecutando despliegue en el servidor..."

# Copiar script al servidor y ejecutarlo
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]] && ! [[ "$SERVER_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Usar configuración SSH del archivo ~/.ssh/config
    scp /tmp/deploy-script.sh $SSH_HOST:/tmp/
    ssh $SSH_HOST "chmod +x /tmp/deploy-script.sh && /tmp/deploy-script.sh && rm /tmp/deploy-script.sh"
else
    # Usar IP con puerto específico
    scp $SCP_OPTIONS /tmp/deploy-script.sh $SSH_HOST:/tmp/
    ssh $SSH_OPTIONS $SSH_HOST "chmod +x /tmp/deploy-script.sh && /tmp/deploy-script.sh && rm /tmp/deploy-script.sh"
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
rm /tmp/deploy-script.sh

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

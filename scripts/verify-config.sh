#!/bin/bash

# =============================================================================
# SNR.RED - Verificación de Configuración
# =============================================================================
# 
# Este script verifica que la configuración esté correcta en el servidor
# 
# Uso: ./verify-config.sh
# 
# =============================================================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Verificar conexión al servidor
SERVER_HOST="freejolitos"

print_section "Verificando Conexión al Servidor"
if ssh -o ConnectTimeout=5 "$SERVER_HOST" "echo 'Conexión exitosa'" 2>/dev/null; then
    print_status "Conexión SSH exitosa"
else
    print_error "No se pudo conectar al servidor $SERVER_HOST"
    exit 1
fi

# Verificar servicios en el servidor
print_section "Verificando Servicios en el Servidor"

# MongoDB
print_info "Verificando MongoDB..."
if ssh "$SERVER_HOST" "systemctl is-active mongod" 2>/dev/null | grep -q "active"; then
    print_status "MongoDB está ejecutándose"
    
    # Verificar configuración de MongoDB
    if ssh "$SERVER_HOST" "cat /etc/mongod.conf | grep -q 'authorization: disabled'" 2>/dev/null; then
        print_status "MongoDB configurado sin autenticación"
    else
        print_warning "MongoDB podría tener autenticación habilitada"
    fi
    
    # Probar conexión a MongoDB
    if ssh "$SERVER_HOST" "mongosh --eval 'db.adminCommand(\"ismaster\")' --quiet" >/dev/null 2>&1; then
        print_status "Conexión a MongoDB exitosa"
    else
        print_error "No se pudo conectar a MongoDB"
    fi
else
    print_error "MongoDB no está ejecutándose"
fi

# Node.js
print_info "Verificando Node.js..."
NODE_VERSION=$(ssh "$SERVER_HOST" "node --version" 2>/dev/null || echo "No instalado")
if [[ "$NODE_VERSION" == "No instalado" ]]; then
    print_error "Node.js no está instalado"
else
    print_status "Node.js $NODE_VERSION instalado"
fi

# PM2
print_info "Verificando PM2..."
if ssh "$SERVER_HOST" "which pm2" >/dev/null 2>&1; then
    print_status "PM2 está instalado"
    
    # Verificar procesos PM2
    PM2_PROCESSES=$(ssh "$SERVER_HOST" "pm2 list --no-colors" 2>/dev/null | grep -E "snr-red-api|snr-red-frontend" | wc -l)
    if [[ "$PM2_PROCESSES" -eq 2 ]]; then
        print_status "Procesos PM2 ejecutándose ($PM2_PROCESSES/2)"
    else
        print_warning "Solo $PM2_PROCESSES procesos PM2 ejecutándose (esperados: 2)"
    fi
else
    print_error "PM2 no está instalado"
fi

# Apache
print_info "Verificando Apache..."
if ssh "$SERVER_HOST" "systemctl is-active apache2" 2>/dev/null | grep -q "active"; then
    print_status "Apache está ejecutándose"
    
    # Verificar configuración de virtual host
    if ssh "$SERVER_HOST" "test -f /etc/apache2/sites-enabled/snr.red.conf" 2>/dev/null; then
        print_status "Virtual host snr.red.conf configurado"
    else
        print_warning "Virtual host snr.red.conf no encontrado"
    fi
else
    print_error "Apache no está ejecutándose"
fi

# Verificar aplicación
print_section "Verificando Aplicación"

# Verificar archivos .env
print_info "Verificando archivos .env..."
if ssh "$SERVER_HOST" "test -f /var/www/snr-red/apps/backend/.env" 2>/dev/null; then
    print_status "Backend .env encontrado"
    
    # Verificar MongoDB URI
    MONGODB_URI=$(ssh "$SERVER_HOST" "grep MONGODB_URI /var/www/snr-red/apps/backend/.env" 2>/dev/null || echo "No encontrado")
    if [[ "$MONGODB_URI" == *"mongodb://localhost:27017"* ]]; then
        print_status "MongoDB URI configurado correctamente (sin autenticación)"
    else
        print_warning "MongoDB URI: $MONGODB_URI"
    fi
else
    print_error "Backend .env no encontrado"
fi

if ssh "$SERVER_HOST" "test -f /var/www/snr-red/apps/frontend/.env.local" 2>/dev/null; then
    print_status "Frontend .env.local encontrado"
else
    print_warning "Frontend .env.local no encontrado"
fi

# Verificar conectividad de la aplicación
print_section "Verificando Conectividad"

# Verificar backend API
print_info "Probando backend API..."
if ssh "$SERVER_HOST" "curl -s -f https://api.snr.red/api/health" >/dev/null 2>&1; then
    print_status "Backend API responde correctamente"
else
    print_warning "Backend API no responde o endpoint /health no existe"
fi

# Verificar frontend
print_info "Probando frontend..."
if ssh "$SERVER_HOST" "curl -s -f https://snr.red" >/dev/null 2>&1; then
    print_status "Frontend responde correctamente"
else
    print_error "Frontend no responde"
fi

# Verificar base de datos
print_section "Verificando Base de Datos"

print_info "Verificando base de datos snr-red-prod..."
URL_COUNT=$(ssh "$SERVER_HOST" "mongosh --eval 'use snr-red-prod; db.urls.count()' --quiet" 2>/dev/null || echo "Error")
if [[ "$URL_COUNT" =~ ^[0-9]+$ ]]; then
    print_status "Base de datos accesible - $URL_COUNT URLs registradas"
else
    print_warning "No se pudo acceder a la base de datos"
fi

print_section "Verificación Completada"
echo -e "\n${BLUE}Para más detalles, consulta:${NC}"
echo -e "${BLUE}  - Logs del backend: ssh $SERVER_HOST 'pm2 logs snr-red-api'${NC}"
echo -e "${BLUE}  - Logs del frontend: ssh $SERVER_HOST 'pm2 logs snr-red-frontend'${NC}"
echo -e "${BLUE}  - Estado de MongoDB: ssh $SERVER_HOST 'systemctl status mongod'${NC}"
echo -e "${BLUE}  - Configuración: docs/DEPLOYMENT-NO-AUTH.md${NC}"

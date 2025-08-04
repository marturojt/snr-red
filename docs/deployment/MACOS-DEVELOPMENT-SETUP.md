# SNR.red - macOS Development Environment Setup

**Versión:** 1.0  
**Fecha de creación:** 7 de Julio, 2025  
**Propósito:** Guía completa para configurar el entorno de desarrollo de SNR.red en macOS

---

## 📋 Resumen

Este documento describe el proceso completo para configurar el entorno de desarrollo de SNR.red en macOS, incluyendo la instalación de dependencias, configuración de variables de entorno, y validación del funcionamiento.

## 🛠️ Requisitos del Sistema

### Versiones Verificadas
- **macOS:** 15.x (Sequoia) o superior
- **Node.js:** v22.9.0 
- **npm:** 11.3.0
- **MongoDB:** Community Edition 8.0
- **Homebrew:** Actualizado

### Hardware Recomendado
- **RAM:** 8GB mínimo, 16GB recomendado
- **Almacenamiento:** 2GB libres para dependencias
- **Procesador:** Intel/Apple Silicon compatible

---

## 🏗️ Proceso de Instalación

### 1. Verificar Node.js y npm
```bash
node --version  # Debe mostrar v22.9.0 o superior
npm --version   # Debe mostrar 11.3.0 o superior
```

### 2. Instalar MongoDB Community Edition
```bash
# Verificar Homebrew
brew --version

# Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community@8.0

# Iniciar MongoDB como servicio
brew services start mongodb/brew/mongodb-community

# Verificar instalación
mongosh --version
```

### 3. Clonar y Configurar el Proyecto
```bash
# Clonar repositorio
git clone https://github.com/marturojt/snr-red.git
cd snr-red

# Instalar dependencias
npm install

# Compilar tipos compartidos
npm run build:types
```

### 4. Configurar Variables de Entorno

#### Backend (.env)
```bash
# Crear archivo de configuración
cp apps/backend/.env.example apps/backend/.env

# Contenido del archivo apps/backend/.env:
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/snr-red-dev
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-dev-env
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST_SIZE=10
```

#### Frontend (.env.local)
```bash
# Crear archivo de configuración
cp apps/frontend/.env.local.example apps/frontend/.env.local

# Contenido del archivo apps/frontend/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Iniciar el Entorno de Desarrollo
```bash
# Iniciar ambos servidores
npm run dev

# Verificar que ambos servicios estén corriendo:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## ✅ Verificación del Entorno

### Comandos de Verificación
```bash
# Verificar salud del backend
curl http://localhost:3001/health
# Respuesta esperada: {"status":"OK","timestamp":"..."}

# Verificar frontend
curl -I http://localhost:3000
# Respuesta esperada: HTTP/1.1 200 OK

# Verificar que MongoDB esté corriendo
brew services list | grep mongodb
# Respuesta esperada: mongodb-community started
```

### URLs de Desarrollo
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Admin Panel:** http://localhost:3000/admin
- **Health Check:** http://localhost:3001/health

### Credenciales de Administrador
```
Email: arturo.jimenez.26@gmail.com
Password: Arturo06;
Permisos: isAdmin: true, plan: premium
```

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
npm run dev              # Iniciar desarrollo completo
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend
npm run build           # Build completo
npm run build:types     # Compilar tipos
npm run lint            # Linting
npm run type-check      # Verificar tipos
```

### MongoDB
```bash
# Iniciar MongoDB
brew services start mongodb/brew/mongodb-community

# Detener MongoDB
brew services stop mongodb/brew/mongodb-community

# Reiniciar MongoDB
brew services restart mongodb/brew/mongodb-community

# Conectar a MongoDB
mongosh mongodb://127.0.0.1:27017/snr-red-dev
```

### Gestión de Procesos
```bash
# Detener servidores (Ctrl+C en el terminal)
# Verificar puertos ocupados
lsof -i :3000
lsof -i :3001

# Matar proceso específico
kill -9 <PID>
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module '@url-shortener/types'"
```bash
# Solución: Compilar tipos compartidos
npm run build:types
```

### Error: "TSError: Type 'unknown' is not assignable to type 'string'"
```bash
# Solución: Verificar tipos en modelo VCard
# El error se autocorrige al reiniciar nodemon
```

### Error: "EADDRINUSE" - Puerto ocupado
```bash
# Verificar qué está usando el puerto
lsof -i :3000
lsof -i :3001

# Matar proceso
kill -9 <PID>
```

### MongoDB no se conecta
```bash
# Verificar estado del servicio
brew services list | grep mongodb

# Iniciar si no está corriendo
brew services start mongodb/brew/mongodb-community

# Verificar logs
brew services info mongodb-community
```

---

## 📚 Estructura del Proyecto

```
snr-red/
├── apps/
│   ├── backend/              # API REST (Puerto 3001)
│   │   ├── src/
│   │   ├── .env             # Variables de entorno
│   │   └── package.json
│   └── frontend/            # Next.js App (Puerto 3000)
│       ├── src/
│       ├── .env.local       # Variables de entorno
│       └── package.json
├── packages/
│   └── types/               # Tipos compartidos TypeScript
├── docs/                    # Documentación
└── scripts/                 # Scripts de deployment
```

---

## 🚀 Próximos Pasos

Una vez que el entorno esté funcionando correctamente:

1. **Probar funcionalidades básicas:**
   - Crear URL corta
   - Generar código QR
   - Probar vCard generator

2. **Acceder al panel admin:**
   - Ir a http://localhost:3000/admin
   - Usar credenciales documentadas

3. **Explorar el código:**
   - Revisar estructura en `/apps/backend/src/`
   - Revisar componentes en `/apps/frontend/src/`

4. **Leer documentación:**
   - `docs/system/PROJECT-STATUS.md`
   - `docs/system/TECHNICAL-TRACKING-GUIDE.md`

---

## 📝 Notas Adicionales

### Rendimiento
- **Tiempo de inicio:** ~10-15 segundos
- **Recarga automática:** ✅ Activada (nodemon + Next.js)
- **Compilación tipos:** ~2-3 segundos

### Compatibilidad
- **Apple Silicon:** ✅ Completamente compatible
- **Intel Mac:** ✅ Completamente compatible
- **MongoDB:** ARM64 y x86_64 soportados

### Mantenimiento
- **Actualizaciones:** Verificar regularmente `brew outdated`
- **Dependencias:** Ejecutar `npm audit` periódicamente
- **Logs:** Revisar salida de consola para errores

---

**Estado:** ✅ Funcional y Verificado  
**Última validación:** 7 de Julio, 2025  
**Próxima revisión:** Al realizar cambios significativos en el entorno

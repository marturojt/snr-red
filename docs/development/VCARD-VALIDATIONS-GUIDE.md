# vCard System - Validations and Required Fields

## Campo Obligatorios para vCard

### ✅ Paso 1: Información Personal (OBLIGATORIOS)
- **First Name (Nombre)**: Mínimo 2 caracteres, máximo 100
- **Last Name (Apellido)**: Mínimo 2 caracteres, máximo 100

### ✅ Paso 1: Información Personal (OPCIONALES)
- **Company (Empresa)**: Si se proporciona, mínimo 2 caracteres, máximo 200
- **Job Title (Cargo)**: Si se proporciona, mínimo 2 caracteres, máximo 200

### ✅ Paso 2: Información de Contacto (OPCIONALES con validación)
- **Email**: Formato válido de email con regex mejorado
- **Phone**: Formato internacional o nacional con máscaras automáticas
- **Website**: URL válida con formato automático (añade https://)

### ✅ Paso 3: Redes Sociales (OPCIONALES con validación)
- **LinkedIn**: URL válida de LinkedIn (soporta formatos in/pub/public-profile)
- **WhatsApp**: Número de teléfono válido (formato internacional)
- **Instagram**: URL válida de Instagram
- **Twitter**: URL válida de Twitter o X

## Validaciones Implementadas

### Validación de Email
```typescript
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

### Validación de Teléfono
```typescript
const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/;
```

### Validación de Website
```typescript
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
```

### Validación de LinkedIn
```typescript
const linkedinRegex = /^(https?:\/\/)?(www\.)?(linkedin\.com\/(in|pub|public-profile)\/[a-zA-Z0-9-]+)\/?$/;
```

### Validación de Instagram
```typescript
const instagramRegex = /^(https?:\/\/)?(www\.)?(instagram\.com\/[a-zA-Z0-9_.]+)\/?$/;
```

### Validación de Twitter/X
```typescript
const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com\/[a-zA-Z0-9_]+|x\.com\/[a-zA-Z0-9_]+)\/?$/;
```

## Máscaras Implementadas

### Máscara de Teléfono
- **Formato Nacional**: (123) 456-7890
- **Formato Internacional**: +1 234 567 8900
- **Formato Flexible**: Se adapta automáticamente al input del usuario

### Máscara de Website
- **Auto-formato**: Añade automáticamente "https://" si no se proporciona protocolo
- **Validación**: Verifica formato de URL válida

## Flujo de Validación

1. **Validación en tiempo real**: Los errores se limpian cuando el usuario empieza a escribir
2. **Validación por pasos**: Cada paso se valida antes de avanzar
3. **Validación final**: Todos los pasos se validan antes de enviar
4. **Feedback visual**: Los campos con errores se resaltan en rojo con mensajes descriptivos

## Correcciones Implementadas

### ✅ URL de vCard Corregida
- **Problema**: Las URLs se generaban como `/v/${shortCode}` pero la página estaba en `/vcard/${shortCode}`
- **Solución**: Actualizado el backend para generar URLs como `/vcard/${shortCode}`
- **Compatibilidad**: Creada ruta de redirección `/v/[id]` que redirige a `/vcard/[id]`

### ✅ Validaciones Mejoradas
- **Problema**: Validaciones básicas y limitadas
- **Solución**: Implementadas validaciones robustas con regex específicos para cada tipo de campo
- **Mejora**: Mensajes de error descriptivos y amigables al usuario

### ✅ Máscaras Mejoradas
- **Problema**: Máscara de teléfono básica
- **Solución**: Implementada máscara inteligente que maneja formatos nacionales e internacionales
- **Mejora**: Formateo automático de websites con protocolo

### ✅ Experiencia de Usuario
- **Problema**: Falta de feedback visual en errores
- **Solución**: Implementados indicadores visuales (bordes rojos) y iconos de error
- **Mejora**: Limpieza automática de errores al escribir

## Siguiente Paso Recomendado

Para probar la funcionalidad completamente:

1. Ir a `http://localhost:3000`
2. Hacer clic en la pestaña "vCard Generator"
3. Completar el formulario con datos válidos
4. Verificar que las validaciones funcionen correctamente
5. Probar el preview de la vCard generada
6. Verificar la descarga del archivo .vcf

## Backend Validations

El backend también valida:
- Campos obligatorios: firstName, lastName
- Longitud máxima de campos
- Formato de email válido
- Formato de URL válido para website
- Temas válidos: professional, creative, minimal

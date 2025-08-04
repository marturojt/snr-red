# Logo de Marca SNR.red - Estándar de Diseño

## Fecha: 8 de julio de 2025

### Resumen
Se ha establecido un estándar consistente para el logo de la marca SNR.red que mantiene el gradiente característico como parte de la identidad visual, diferenciándolo de los elementos funcionales que siguen el estilo minimalista.

### Filosofía del Logo de Marca

#### Principio de Identidad Visual:
- **Logo de marca**: Mantiene gradiente como identidad corporativa
- **Elementos funcionales**: Estilo minimalista sin gradientes
- **Consistencia**: Mismo gradiente en todos los contextos

### Estándar Definido

#### Código HTML/CSS Estándar:
```jsx
<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg flex items-center justify-center">
  <Link className="w-4 h-4 text-white" />
</div>
<span className="text-xl font-semibold">SNR.red</span>
```

#### Especificaciones Técnicas:

**Contenedor del Ícono:**
- Tamaño: `w-8 h-8` (32x32px)
- Gradiente Light: `from-blue-600 to-purple-600`
- Gradiente Dark: `from-blue-500 to-purple-500`
- Border radius: `rounded-lg`
- Posición: `flex items-center justify-center`

**Ícono:**
- Componente: `Link` de Lucide React
- Tamaño: `w-4 h-4` (16x16px)
- Color: `text-white` (fijo, no variable de tema)

**Texto:**
- Tamaño: `text-xl` (20px)
- Peso: `font-semibold` (600)
- Color: Adaptable al tema (sin clase específica)

### Implementación por Componente

#### 1. ResponsiveHeader.tsx
✅ **Implementado**
- Logo principal en navegación
- Consistente en todos los breakpoints

#### 2. ModernLandingPage.tsx
✅ **Implementado**
- Logo en vista "Mis URLs"
- Logo en footer
- Mismo estándar aplicado

#### 3. ModernDashboard.tsx
✅ **Implementado**
- Logo en dashboard de usuario
- Coherente con el resto de la aplicación

### Razón del Gradiente en el Logo

#### Diferenciación Visual:
1. **Identidad de Marca**: El gradiente azul-morado es distintivo de SNR.red
2. **Reconocimiento**: Facilita identificación visual de la marca
3. **Profesionalidad**: Aporta sofisticación sin comprometer minimalismo
4. **Consistencia**: Misma identidad en todos los contextos

#### Contraste con Elementos Funcionales:
- **Botones**: Sin gradientes, estilo shadcn/ui limpio
- **Cards**: Fondos sólidos y bordes sutiles
- **Elementos UI**: Minimalismo puro
- **Logo**: Excepción justificada por branding

### Variaciones de Color

#### Modo Claro:
- Primario: `#2563eb` (blue-600)
- Secundario: `#9333ea` (purple-600)
- Texto ícono: `#ffffff` (white)

#### Modo Oscuro:
- Primario: `#3b82f6` (blue-500)
- Secundario: `#a855f7` (purple-500)
- Texto ícono: `#ffffff` (white)

### Casos de Uso

#### ✅ Usar Gradiente:
- Logo principal en headers
- Logo en footers
- Logo en dashboards
- Cualquier referencia a la marca SNR.red

#### ❌ No Usar Gradiente:
- Botones de acción
- Elementos de formulario
- Cards de contenido
- Elementos funcionales
- Iconos decorativos

### Mantenimiento

#### Reglas de Implementación:
1. **Siempre** usar el código estándar definido
2. **Nunca** modificar los colores del gradiente
3. **Mantener** consistencia en tamaños
4. **Aplicar** en todos los logos de marca

#### Control de Calidad:
- Revisar que todos los logos usen el estándar
- Verificar adaptabilidad en dark mode
- Confirmar que no haya degradación visual
- Validar consistencia cross-browser

### Beneficios del Estándar

#### Técnicos:
- ✅ Código reutilizable
- ✅ Fácil mantenimiento
- ✅ Consistencia visual
- ✅ Adaptabilidad dark mode

#### Visuales:
- ✅ Identidad de marca fuerte
- ✅ Reconocimiento inmediato
- ✅ Profesionalidad
- ✅ Diferenciación clara

#### UX:
- ✅ Navegación intuitiva
- ✅ Confianza en la marca
- ✅ Experiencia cohesiva
- ✅ Memorabilidad

### Conclusión

El logo de SNR.red mantiene su gradiente característico como elemento de identidad de marca, mientras que todos los demás elementos siguen el estilo minimalista de shadcn/ui. Esta diferenciación es intencional y beneficiosa:

- **Marca fuerte**: El gradiente distingue el logo como elemento corporativo
- **Funcionalidad limpia**: Los elementos UI mantienen simplicidad
- **Balance perfecto**: Identidad visual + usabilidad óptima

Este estándar debe mantenerse en futuras implementaciones para preservar la coherencia visual y la identidad de marca de SNR.red.

# Configuración de Tema Oscuro por Defecto

## Problema Resuelto
Se solucionó el issue donde la página cargaba inicialmente en tema claro y luego cambiaba al tema oscuro, causando un flash visual molesto. Ahora el tema oscuro es el predeterminado y no hay flash inicial.

## Cambios Realizados

### 1. Modificación del ThemeProvider
**Archivo**: `/apps/frontend/src/context/ThemeContext.tsx`

#### Cambios en el estado inicial:
```typescript
// ANTES
const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light', // ❌ Causaba flash inicial
};

// DESPUÉS
const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  resolvedTheme: 'dark', // ✅ Tema oscuro por defecto
};
```

#### Cambios en el defaultTheme:
```typescript
// ANTES
defaultTheme = 'system'

// DESPUÉS  
defaultTheme = 'dark'
```

#### Inicialización inteligente del estado:
```typescript
// Nuevo código que verifica localStorage antes de establecer el estado inicial
const [theme, setTheme] = useState<Theme>(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
  }
  return defaultTheme;
});

const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      if (stored === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return stored;
    }
  }
  return 'dark';
});
```

### 2. Script Inline para Prevenir Flash
**Archivo**: `/apps/frontend/src/app/layout.tsx`

Se agregó un script inline en el `<head>` que aplica el tema antes de que React se hidrate:

```typescript
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            var theme = localStorage.getItem('snr-red-theme') || 'dark';
            var resolvedTheme = theme;
            
            if (theme === 'system') {
              resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(resolvedTheme);
          } catch (e) {
            document.documentElement.classList.add('dark');
          }
        })();
      `,
    }}
  />
</head>
```

### 3. Simplificación de useEffects
Se optimizaron los `useEffect` en el ThemeProvider:
- Eliminado el useEffect que cargaba desde localStorage (ahora se hace en la inicialización)
- Mantenido solo el useEffect para aplicar cambios de tema
- Simplificado el useEffect para guardar en localStorage

## Beneficios

### ✅ **Problema Resuelto**
- **Sin flash inicial**: La página ahora carga directamente en tema oscuro
- **Experiencia de usuario mejorada**: Transición suave y consistente
- **Tema predeterminado oscuro**: Más moderno y menos agresivo para los ojos

### 🚀 **Mejoras Técnicas**
- **Hidratación optimizada**: El script inline previene el flash antes de que React tome control
- **Inicialización inteligente**: Se verifica localStorage durante la inicialización del estado
- **Mejor rendimiento**: Menos re-renders innecesarios
- **Código más limpio**: Lógica simplificada en los useEffects

### 🎨 **Experiencia de Usuario**
- **Consistencia visual**: Sin cambios abruptos de tema al cargar
- **Tema moderno**: Oscuro por defecto, más popular actualmente
- **Preservación de preferencias**: Si el usuario había seleccionado un tema específico, se mantiene

## Comportamiento Actualizado

### Primera Visita (sin localStorage)
1. ✅ Carga directamente en tema oscuro
2. ✅ No hay flash visual
3. ✅ Tema oscuro se guarda en localStorage

### Visitas Posteriores
1. ✅ Script inline aplica inmediatamente el tema guardado
2. ✅ React se hidrata con el tema correcto ya aplicado
3. ✅ Sin flashes ni cambios visuales

### Cambio Manual de Tema
1. ✅ Cambio inmediato sin flash
2. ✅ Preferencia guardada en localStorage
3. ✅ Aplicada en próximas visitas

## Compatibilidad
- ✅ **SSR**: Compatible con Server-Side Rendering
- ✅ **Hidratación**: Sincronizado entre servidor y cliente
- ✅ **Sistema de preferencias**: Sigue respetando 'system' si se selecciona
- ✅ **Fallback**: Si hay error, aplica tema oscuro por defecto

## Testing
- ✅ Build exitoso
- ✅ Type checking pasó
- ✅ No errores de hidratación
- ✅ Funcionalidad de cambio de tema preservada

Este cambio mejora significativamente la experiencia de usuario al eliminar el molesto flash inicial y proporciona un tema moderno por defecto.

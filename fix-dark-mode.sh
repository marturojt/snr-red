#!/bin/bash

# Script para corregir colores hardcodeados en componentes React
# Reemplaza clases hardcodeadas con clases de tema de shadcn/ui

echo "🔧 Corrigiendo colores hardcodeados en componentes..."

# Directorio de componentes
COMPONENTS_DIR="/Users/marturojt/Developer/snr-red/apps/frontend/src/components"

# Función para reemplazar en un archivo
fix_colors() {
    local file="$1"
    echo "📝 Procesando: $file"
    
    # Reemplazos de texto
    sed -i '' \
        -e 's/text-gray-900/text-foreground/g' \
        -e 's/text-gray-800/text-foreground/g' \
        -e 's/text-gray-700/text-foreground/g' \
        -e 's/text-gray-600/text-muted-foreground/g' \
        -e 's/text-gray-500/text-muted-foreground/g' \
        -e 's/text-gray-400/text-muted-foreground/g' \
        -e 's/text-gray-300/text-muted-foreground/g' \
        -e 's/bg-gray-50/bg-muted/g' \
        -e 's/bg-gray-100/bg-muted/g' \
        -e 's/bg-gray-200/bg-border/g' \
        -e 's/border-gray-200/border-border/g' \
        -e 's/border-gray-300/border-border/g' \
        -e 's/bg-white/bg-background/g' \
        -e 's/bg-white\/80/bg-background\/80/g' \
        -e 's/hover:text-gray-900/hover:text-foreground/g' \
        -e 's/hover:bg-gray-50/hover:bg-muted/g' \
        -e 's/focus:border-blue-500/focus:border-primary/g' \
        -e 's/text-blue-600/text-primary/g' \
        -e 's/text-blue-500/text-primary/g' \
        -e 's/text-green-600/text-green-600 dark:text-green-400/g' \
        -e 's/text-red-600/text-red-600 dark:text-red-400/g' \
        -e 's/text-yellow-600/text-yellow-600 dark:text-yellow-400/g' \
        "$file"
}

# Procesar todos los archivos .tsx en el directorio de componentes
find "$COMPONENTS_DIR" -name "*.tsx" -type f | while read -r file; do
    if [[ -f "$file" ]]; then
        fix_colors "$file"
    fi
done

echo "✅ Corrección completada!"
echo "🎨 Colores hardcodeados reemplazados con clases de tema shadcn/ui"

#!/bin/bash

# Script para limpiar duplicaciones en las clases de tema
echo "🧹 Limpiando duplicaciones en clases de tema..."

COMPONENTS_DIR="/Users/marturojt/Developer/snr-red/apps/frontend/src/components"

# Función para limpiar duplicaciones
clean_duplicates() {
    local file="$1"
    echo "📝 Limpiando duplicaciones en: $file"
    
    # Limpiar duplicaciones específicas
    sed -i '' \
        -e 's/dark:text-green-400 dark:text-green-400/dark:text-green-400/g' \
        -e 's/dark:text-red-400 dark:text-red-400/dark:text-red-400/g' \
        -e 's/dark:text-yellow-400 dark:text-yellow-400/dark:text-yellow-400/g' \
        -e 's/dark:text-blue-400 dark:text-blue-400/dark:text-blue-400/g' \
        "$file"
}

# Procesar todos los archivos .tsx
find "$COMPONENTS_DIR" -name "*.tsx" -type f | while read -r file; do
    if [[ -f "$file" ]]; then
        clean_duplicates "$file"
    fi
done

echo "✅ Limpieza completada!"

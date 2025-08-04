#!/bin/bash

# Script mejorado para corregir gradientes y fondos hardcodeados específicos
echo "🎨 Corrigiendo gradientes y fondos hardcodeados restantes..."

COMPONENTS_DIR="/Users/marturojt/Developer/snr-red/apps/frontend/src/components"

# Función para corregir gradientes específicos
fix_gradients() {
    local file="$1"
    echo "📝 Corrigiendo gradientes en: $file"
    
    # Gradientes de fondo de sección
    sed -i '' \
        -e 's/bg-gradient-to-r from-blue-600 to-purple-600/bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500/g' \
        -e 's/bg-gradient-to-br from-blue-50 via-white to-purple-50/bg-gradient-to-br from-blue-50\/30 via-background to-purple-50\/30 dark:from-blue-950\/20 dark:via-background dark:to-purple-950\/20/g' \
        "$file"
    
    # Gradientes de cards y componentes
    sed -i '' \
        -e 's/bg-gradient-to-r from-purple-500 to-blue-500/bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400/g' \
        -e 's/bg-gradient-to-br from-blue-500 to-blue-600/bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500/g' \
        -e 's/bg-gradient-to-br from-green-500 to-green-600/bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500/g' \
        -e 's/bg-gradient-to-br from-purple-500 to-purple-600/bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500/g' \
        -e 's/bg-gradient-to-br from-orange-500 to-orange-600/bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500/g' \
        "$file"
    
    # Fondos sólidos específicos
    sed -i '' \
        -e 's/bg-blue-400\b/bg-blue-400 dark:bg-blue-300/g' \
        -e 's/bg-green-400\b/bg-green-400 dark:bg-green-300/g' \
        -e 's/bg-purple-400\b/bg-purple-400 dark:bg-purple-300/g' \
        -e 's/bg-orange-400\b/bg-orange-400 dark:bg-orange-300/g' \
        -e 's/bg-blue-500\b/bg-blue-500 dark:bg-blue-400/g' \
        -e 's/bg-green-500\b/bg-green-500 dark:bg-green-400/g' \
        -e 's/bg-purple-600\b/bg-purple-600 dark:bg-purple-500/g' \
        "$file"
    
    # Gradientes de botones con hover
    sed -i '' \
        -e 's/bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700/bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600/g' \
        "$file"
    
    # Texto en gradientes
    sed -i '' \
        -e 's/text-purple-600 hover:bg-purple-50/text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950\/30/g' \
        "$file"
}

# Procesar archivos específicos con problemas
fix_gradients "$COMPONENTS_DIR/ModernLandingPage.tsx"
fix_gradients "$COMPONENTS_DIR/ModernDashboard.tsx"

# Procesar otros archivos con posibles gradientes
find "$COMPONENTS_DIR" -name "*.tsx" -type f | while read -r file; do
    if [[ -f "$file" ]] && [[ "$file" != *"ModernLandingPage.tsx" ]] && [[ "$file" != *"ModernDashboard.tsx" ]]; then
        if grep -q "from-.*-[0-9]" "$file"; then
            fix_gradients "$file"
        fi
    fi
done

echo "✅ Corrección de gradientes completada!"

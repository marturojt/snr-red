#!/bin/bash

# Script para corregir colores hardcodeados en ModernDashboard.tsx

FILE="apps/frontend/src/components/ModernDashboard.tsx"

# Corregir gradiente de fondo principal
sed -i '' 's/from-blue-50\/30 via-background to-purple-50\/30 dark:from-blue-950\/20 dark:via-background dark:to-purple-950\/20/from-primary\/10 via-background to-secondary\/10 dark:from-primary\/5 dark:via-background dark:to-secondary\/5/g' "$FILE"

# Corregir gradiente del logo
sed -i '' 's/from-blue-600 to-purple-600/from-primary to-secondary/g' "$FILE"

# Corregir tarjetas con gradientes específicos
sed -i '' 's/from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 text-white/from-primary to-secondary dark:from-primary\/80 dark:to-secondary\/80 text-primary-foreground/g' "$FILE"

sed -i '' 's/from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white/from-primary to-primary\/80 dark:from-primary\/80 dark:to-primary\/60 text-primary-foreground/g' "$FILE"

sed -i '' 's/from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 text-white/from-secondary to-secondary\/80 dark:from-secondary\/80 dark:to-secondary\/60 text-secondary-foreground/g' "$FILE"

# Corregir colores de texto específicos
sed -i '' 's/text-purple-100/text-primary-foreground\/80/g' "$FILE"
sed -i '' 's/text-blue-100/text-primary-foreground\/80/g' "$FILE"
sed -i '' 's/text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950\/30/text-primary hover:bg-primary\/10 dark:text-primary dark:hover:bg-primary\/20/g' "$FILE"

echo "Colores corregidos en $FILE"

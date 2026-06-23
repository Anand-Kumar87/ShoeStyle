#!/bin/bash

echo "=== Checking Missing Files and Directories ==="

# Check for critical files
files=(
  "src/pages/api/auth/[...nextauth].ts"
  "src/pages/api/products/index.ts"
  "src/pages/api/cart/index.ts"
  "src/pages/api/orders/index.ts"
  "prisma/schema.prisma"
  "next.config.js"
  "tsconfig.json"
  "tailwind.config.js"
  ".eslintrc.js"
)

echo "Critical Files:"
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ MISSING: $file"
  fi
done

# Check for critical directories
dirs=(
  "src/pages"
  "src/components"
  "src/lib"
  "src/utils"
  "src/hooks"
  "src/types"
  "prisma"
  "public"
  "node_modules"
)

echo -e "\nCritical Directories:"
for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✓ $dir"
  else
    echo "✗ MISSING: $dir"
  fi
done

# Check for .next build
if [ -d ".next" ]; then
  echo -e "\n✓ .next build directory exists"
else
  echo -e "\n✗ MISSING: .next build directory (needs rebuild)"
fi

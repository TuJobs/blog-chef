#!/bin/bash

# Script để update tất cả API routes từ sqlite sang postgres
echo "🔄 Updating API routes from SQLite to Postgres..."

# List of API route files to update
API_FILES=(
    "src/app/api/posts/route.ts"
    "src/app/api/posts/[id]/route.ts"
    "src/app/api/comments/route.ts"
    "src/app/api/reactions/route.ts"
)

# Update import statements
for file in "${API_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Updating imports in $file"
        sed -i '' 's/@\/lib\/sqlite/@\/lib\/postgres/g' "$file"
        
        # Update field names from camelCase to snake_case
        sed -i '' 's/\.authorId/\.author_id/g' "$file"
        sed -i '' 's/createdAt/created_at/g' "$file"
        sed -i '' 's/updatedAt/updated_at/g' "$file"
        sed -i '' 's/authorId:/author_id:/g' "$file"
        
        echo "✅ Updated $file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo "🎉 All API routes updated successfully!"
echo "📝 Don't forget to:"
echo "1. Test the APIs: npm run dev"
echo "2. Check for any remaining type errors"
echo "3. Deploy to Vercel with NEON_DATABASE_URL"

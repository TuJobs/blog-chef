#!/bin/bash

# Migration script for Blog Chef to Cloud Services
echo "🚀 Starting migration to Cloud Services..."
echo "======================================"

# Check environment variables
if [ -z "$NEON_DATABASE_URL" ]; then
    echo "❌ NEON_DATABASE_URL not set"
    echo "Please set your Neon database connection string"
    exit 1
fi

if [ -z "$CLOUDINARY_CLOUD_NAME" ]; then
    echo "❌ CLOUDINARY_CLOUD_NAME not set"
    echo "Please set your Cloudinary credentials"
    exit 1
fi

echo "✅ Environment variables check passed"

# Generate and run database migrations
echo "📊 Generating database migrations..."
npx drizzle-kit generate

echo "🔄 Running database migrations..."
npx drizzle-kit migrate

# Migrate existing data from JSON to PostgreSQL
echo "📁 Migrating existing data..."
node -e "
const fs = require('fs');
const path = require('path');

async function migrateData() {
  try {
    // Check if data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      console.log('No data directory found, skipping data migration');
      return;
    }

    console.log('Migration script would go here...');
    console.log('For now, please manually migrate your data using the new API endpoints');
    console.log('Or create a custom migration script based on your specific needs');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateData();
"

echo ""
echo "✅ Migration completed!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env.local with the new environment variables"
echo "2. Test the new API endpoints:"
echo "   - GET /api/posts-new - Fetch posts from PostgreSQL"
echo "   - POST /api/upload-cloudinary - Upload images to Cloudinary"
echo "3. Update your frontend to use the new endpoints"
echo "4. Migrate existing data if needed"
echo ""
echo "🔧 Useful commands:"
echo "- Generate migrations: npx drizzle-kit generate"
echo "- Run migrations: npx drizzle-kit migrate"  
echo "- Studio (DB viewer): npx drizzle-kit studio"
echo ""

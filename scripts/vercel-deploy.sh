#!/bin/bash

# 🚀 Vercel Deployment Script for Blog Chef

echo "🌟 Blog Chef - Vercel Deployment"
echo "================================="

# Kiểm tra Vercel CLI
echo "📋 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI chưa được cài đặt"
    echo "🔧 Installing Vercel CLI..."
    npm install -g vercel@latest
else
    echo "✅ Vercel CLI đã sẵn sàng"
fi

# Build test
echo ""
echo "📦 Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors first."
    exit 1
fi

echo "✅ Build successful!"

# Check git status
echo ""
echo "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Commit them first:"
    echo "git add ."
    echo "git commit -m 'Ready for Vercel deployment'"
    echo "git push origin main"
    echo ""
    read -p "Continue anyway? (y/N): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        exit 1
    fi
fi

# Environment Variables Guide
echo ""
echo "📝 Required Environment Variables for Vercel:"
echo "=============================================="
echo ""
echo "🔑 Core Variables:"
echo "NODE_ENV=production"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "NEXTAUTH_URL=https://your-app.vercel.app (will be updated after deploy)"
echo ""
echo "🗄️ Database (choose one):"
echo "# Option 1: JSON-based (current)"
echo "# No additional vars needed"
echo ""
echo "# Option 2: Cloud Database"
echo "NEON_DATABASE_URL=postgresql://user:pass@host/db"
echo "SUPABASE_URL=https://your-project.supabase.co"
echo "SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "🖼️ Image Upload (optional):"
echo "CLOUDINARY_CLOUD_NAME=your-cloud-name"
echo "CLOUDINARY_API_KEY=your-api-key" 
echo "CLOUDINARY_API_SECRET=your-api-secret"
echo ""

# Create .env.production for reference
echo "📝 Creating .env.production template..."
cat > .env.production << EOF
# Vercel Environment Variables Template
# Copy these to your Vercel dashboard

# Core Next.js
NODE_ENV=production
NEXTAUTH_SECRET=generate-a-random-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app

# Database (optional - for cloud integration)
# NEON_DATABASE_URL=postgresql://user:pass@host/db
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key

# Image Upload (optional)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
EOF

echo ""
echo "🎯 Next Steps:"
echo "1. 🌐 Go to https://vercel.com and sign in with GitHub"
echo "2. 📂 Import your GitHub repository"
echo "3. ⚙️  Configure environment variables in Vercel dashboard"
echo "4. 🚀 Deploy!"
echo ""
echo "📋 Manual Deployment Commands:"
echo "vercel login"
echo "vercel --prod"
echo ""

read -p "🚀 Do you want to try automatic Vercel login? (y/N): " try_login
if [ "$try_login" = "y" ] || [ "$try_login" = "Y" ]; then
    echo "🔐 Opening Vercel login..."
    vercel login
    
    read -p "✅ Login successful? Deploy now? (y/N): " deploy_now
    if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
    fi
fi

echo ""
echo "🎉 Vercel deployment ready!"
echo "📖 Check DEPLOY-INTERNET.md for detailed instructions."
echo "🌐 Your site will be available at: https://blog-chef-xxx.vercel.app"

#!/bin/bash

# 🚀 Blog Chef Internet Deployment Script
# Hướng dẫn deploy lên internet với nhiều platform

echo "🌟 Blog Chef - Internet Deployment"
echo "=================================="

# Kiểm tra build
echo "📦 Checking build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors first."
    exit 1
fi

echo "✅ Build successful!"

# Menu lựa chọn platform
echo ""
echo "🌐 Choose deployment platform:"
echo "1) Vercel (Khuyến khích)"
echo "2) Netlify (Dễ sử dụng)"
echo "3) Railway (Nhanh chóng)"
echo "4) Render (Free tier)"
echo "5) Docker + VPS (Tự quản lý)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        echo "Commands to run:"
        echo "1. npm install -g vercel"
        echo "2. vercel login"
        echo "3. vercel --prod"
        echo "4. Set environment variables in Vercel dashboard"
        ;;
    2)
        echo "🎯 Deploying to Netlify..."
        echo "Commands to run:"
        echo "1. npm install -g netlify-cli"
        echo "2. netlify login"
        echo "3. netlify init"
        echo "4. netlify deploy --prod"
        echo "5. Set environment variables in Netlify dashboard"
        ;;
    3)
        echo "🚂 Deploying to Railway..."
        echo "Commands to run:"
        echo "1. npm install -g @railway/cli"
        echo "2. railway login"
        echo "3. railway init"
        echo "4. railway up"
        echo "5. Set environment variables in Railway dashboard"
        ;;
    4)
        echo "🎨 Deploying to Render..."
        echo "Steps:"
        echo "1. Push code to GitHub"
        echo "2. Connect GitHub repo to Render"
        echo "3. Use render.yaml for configuration"
        echo "4. Set environment variables in Render dashboard"
        ;;
    5)
        echo "🐳 Docker + VPS deployment..."
        echo "Commands to run:"
        echo "1. docker build -t blog-chef ."
        echo "2. docker run -p 3000:3000 -d blog-chef"
        echo "3. Set up reverse proxy (nginx)"
        echo "4. Configure SSL certificate (Let's Encrypt)"
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "📝 Environment Variables cần thiết:"
echo "- MONGODB_URI (hoặc dùng cloud services đã setup)"
echo "- NEXTAUTH_SECRET (random string)"
echo "- NEXTAUTH_URL (URL của website sau khi deploy)"
echo "- NEON_DATABASE_URL (nếu dùng Neon)"
echo "- SUPABASE_URL, SUPABASE_ANON_KEY (nếu dùng Supabase)"
echo "- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (nếu dùng Cloudinary)"

echo ""
echo "🎉 Ready for internet deployment!"
echo "Choose your preferred platform and follow the instructions above."

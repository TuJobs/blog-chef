# 🌐 Hướng dẫn Deploy Blog Chef lên Internet

## 🎯 Method 1: Vercel (Khuyến khích)

### Bước 1: Tạo tài khoản
1. Truy cập https://vercel.com
2. Đăng ký bằng GitHub account
3. Kết nối repository blog_chef

### Bước 2: Import Project
1. Click "New Project"
2. Import từ GitHub repository
3. Chọn framework: Next.js
4. Root directory: `/`
5. Build command: `npm run build`
6. Output directory: `.next`

### Bước 3: Environment Variables
Thêm vào Vercel dashboard:
```
NODE_ENV=production
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
MONGODB_URI=your-mongodb-connection-string

# Cloud Services (optional)
NEON_DATABASE_URL=your-neon-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Bước 4: Deploy
1. Click "Deploy"
2. Đợi build hoàn thành
3. Website sẽ có URL: https://blog-chef-xxx.vercel.app

---

## 🎨 Method 2: Netlify

### Bước 1: Tạo tài khoản
1. Truy cập https://netlify.com
2. Đăng ký bằng GitHub
3. Connect repository

### Bước 2: Site Settings
```
Build command: npm run build
Publish directory: .next
Functions directory: netlify/functions
```

### Bước 3: Environment Variables
Giống như Vercel, thêm vào Netlify dashboard

---

## 🚂 Method 3: Railway

### Bước 1: Tạo tài khoản
1. Truy cập https://railway.app
2. Connect GitHub repository
3. Auto-detect Next.js

### Bước 2: Deploy Settings
```
Start command: npm start
Port: 3000
Health check: /api/health
```

---

## 📋 Checklist trước khi Deploy

### ✅ Code Ready
- [ ] `npm run build` thành công
- [ ] Không có TypeScript errors
- [ ] Environment variables configured
- [ ] Database connection working

### ✅ Production Settings
- [ ] `NODE_ENV=production`
- [ ] Secure `NEXTAUTH_SECRET`
- [ ] Correct `NEXTAUTH_URL`
- [ ] Database accessible from internet

### ✅ Domain & SSL
- [ ] Custom domain (optional)
- [ ] SSL certificate (auto với Vercel/Netlify)
- [ ] CDN configuration

---

## 🔧 Troubleshooting

### Build Errors
```bash
# Local test
npm run build

# Check errors
npm run type-check
npm run lint
```

### Database Issues
```bash
# Test connection
curl -X GET "https://your-site.com/api/health"
```

### Performance
- Enable Next.js Image Optimization
- Use Cloudinary for images
- Enable caching headers

---

## 🎉 Go Live Steps

1. **Choose Platform**: Vercel (recommended)
2. **Push to GitHub**: `git push origin main`
3. **Connect Repository**: Link GitHub repo
4. **Set Environment Variables**: Copy from .env.local
5. **Deploy**: Let platform auto-deploy
6. **Test**: Visit your live URL
7. **Custom Domain**: Add your domain (optional)

## 📊 Expected Results

✅ **Build Success**: ~2-3 minutes
✅ **Live URL**: https://your-app.vercel.app
✅ **Performance**: 90+ Lighthouse score
✅ **Features Working**: 
- User registration/login
- Post creation/editing
- Image uploads
- Comments & reactions
- Search functionality
- Mobile responsive

## 🔗 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

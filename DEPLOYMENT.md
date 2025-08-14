# Hướng dẫn Deploy Blog Nội Trợ

## 🚀 Tùy chọn Deploy

### 1. Vercel (Khuyên dùng cho Next.js)

#### Bước 1: Chuẩn bị Database

1. **MongoDB Atlas** (Free tier):
   - Truy cập [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Tạo tài khoản và cluster mới (Free M0)
   - Tạo database user và lấy connection string
   - Whitelist IP addresses (0.0.0.0/0 cho production)

#### Bước 2: Deploy lên Vercel

```bash
# Cài đặt Vercel CLI (nếu chưa có)
npm i -g vercel

# Build project
npm run build

# Deploy
vercel

# Hoặc deploy trực tiếp từ GitHub
# 1. Push code lên GitHub
# 2. Kết nối repository với Vercel
# 3. Thiết lập environment variables
```

#### Bước 3: Thiết lập Environment Variables trên Vercel

Truy cập Vercel Dashboard → Project → Settings → Environment Variables:

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-32-characters-long
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog_chef?retryWrites=true&w=majority
```

### 2. Netlify

#### Bước 1: Build settings

```bash
# Build command
npm run build

# Publish directory
.next
```

#### Bước 2: Netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Railway

```bash
# Cài đặt Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### 4. Docker + Any Cloud Provider

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### docker-compose.yml (với MongoDB)

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
      - MONGODB_URI=mongodb://mongo:27017/blog_chef
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## ⚙️ Cấu hình Production

### 1. Cập nhật Next.js config

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone", // Cho Docker
  images: {
    unoptimized: false, // Bật optimization cho production
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "your-cdn-domain.com" }, // CDN cho uploads
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};
```

### 2. Package.json scripts

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "postbuild": "next-sitemap"
  }
}
```

## 🔒 Bảo mật Production

### 1. Environment Variables

```env
# Strong secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Database with authentication
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/blog_chef

# Production URL
NEXTAUTH_URL=https://your-domain.com
```

### 2. Database Security

- Bật authentication trên MongoDB
- Whitelist specific IPs thay vì 0.0.0.0/0
- Sử dụng strong passwords
- Regular backups

## 📈 Performance Optimization

### 1. Caching

```typescript
// app/layout.tsx
export const metadata = {
  title: "Blog Nội Trợ",
  description: "Cộng đồng chia sẻ kinh nghiệm nội trợ",
};

// Static generation cho posts
export const revalidate = 3600; // 1 hour
```

### 2. Image Optimization

- Sử dụng Next.js Image component
- Cân nhắc CDN cho uploads (Cloudinary, AWS S3)
- WebP format cho images

### 3. Database Indexes

```javascript
// MongoDB indexes
db.posts.createIndex({ title: "text", content: "text" });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ authorId: 1 });
db.comments.createIndex({ postId: 1 });
```

## 🔍 Monitoring & Analytics

### 1. Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build errors**: Check TypeScript types
2. **Database connection**: Verify MongoDB URI
3. **Authentication**: Check NEXTAUTH_SECRET and URL
4. **Image uploads**: Configure proper file storage
5. **CORS**: Check API routes configuration

### Health Check Endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

## 📝 Checklist Deploy

- [ ] Build project thành công (`npm run build`)
- [ ] Test production build (`npm start`)
- [ ] Thiết lập MongoDB Atlas
- [ ] Cấu hình environment variables
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Kiểm tra responsive design
- [ ] Setup monitoring/analytics
- [ ] Configure domain và SSL
- [ ] Backup strategy

## 🔄 CI/CD với GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

**Lưu ý**: Đảm bảo test kỹ trên môi trường staging trước khi deploy production!

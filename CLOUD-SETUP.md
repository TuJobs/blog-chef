# 🌟 Cloud Services Setup Guide

## Cách setup Neon + Supabase + Cloudinary cho Blog Chef

### 1. 🐘 Neon Database (PostgreSQL)

#### Bước 1: Tạo tài khoản Neon
1. Truy cập [neon.tech](https://neon.tech)
2. Đăng ký tài khoản miễn phí
3. Tạo project mới

#### Bước 2: Lấy connection string
1. Trong dashboard Neon, click **"Connection Details"**
2. Copy **Connection String** (dạng: `postgresql://username:password@host:5432/database`)
3. Thêm vào `.env.local`:
```
NEON_DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
```

### 2. 🚢 Supabase

#### Bước 1: Tạo project Supabase
1. Truy cập [supabase.com](https://supabase.com)
2. Tạo tài khoản và project mới
3. Chọn region gần Việt Nam (Singapore)

#### Bước 2: Lấy API keys
1. Trong dashboard, vào **Settings → API**
2. Copy các keys sau:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

3. Thêm vào `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. ☁️ Cloudinary

#### Bước 1: Tạo tài khoản Cloudinary
1. Truy cập [cloudinary.com](https://cloudinary.com)
2. Đăng ký tài khoản miễn phí (10GB storage, 25 credits/month)

#### Bước 2: Lấy credentials
1. Trong dashboard, vào **Settings → Account**
2. Copy thông tin từ **Account Details**:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

3. Thêm vào `.env.local`:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🚀 Migration Process

### Bước 1: Cài đặt dependencies
```bash
npm install @supabase/supabase-js cloudinary @neondatabase/serverless drizzle-orm drizzle-kit
```

### Bước 2: Setup database
```bash
# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open database studio
npm run db:studio
```

### Bước 3: Chạy migration
```bash
# Run full migration
npm run migrate:cloud

# Or manually:
./migrate-to-cloud.sh
```

### Bước 4: Test các endpoints mới
- **Posts API**: `/api/posts-new`
- **Upload API**: `/api/upload-cloudinary`

## ⚙️ Environment Variables Template

Tạo file `.env.local`:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-32-characters-long

# Neon Database
NEON_DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔄 Migration from JSON Files

### Option 1: API Migration Script
```javascript
// scripts/migrate-data.js
const fs = require('fs');
const path = require('path');

async function migrateData() {
  // Read JSON data
  const users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
  const posts = JSON.parse(fs.readFileSync('data/posts.json', 'utf8'));
  
  // Migrate to new database using API calls
  for (const user of users) {
    await fetch('/api/users-new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  }
  
  for (const post of posts) {
    await fetch('/api/posts-new', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
  }
}
```

### Option 2: Direct Database Migration
```typescript
// scripts/direct-migrate.ts
import { db } from '../src/lib/database';
import { users, posts } from '../src/lib/schema';

async function directMigrate() {
  const jsonUsers = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
  const jsonPosts = JSON.parse(fs.readFileSync('data/posts.json', 'utf8'));
  
  // Insert users
  await db.insert(users).values(jsonUsers);
  
  // Insert posts  
  await db.insert(posts).values(jsonPosts);
}
```

## 🧪 Testing

### Test Database Connection
```bash
# Test Neon connection
npm run db:studio

# Test Supabase
curl -X GET 'https://your-project-id.supabase.co/rest/v1/' \
  -H "apikey: your-anon-key"
```

### Test Cloudinary Upload
```bash
# Test upload endpoint
curl -X POST http://localhost:3001/api/upload-cloudinary \
  -F "file=@test-image.jpg"
```

## 📈 Benefits of Migration

### ✅ Neon Database
- **Scalable**: PostgreSQL with auto-scaling
- **Reliable**: Built-in backups and high availability  
- **Free tier**: 3GB storage, 100 hours compute
- **SQL**: Full SQL capabilities vs JSON limitations

### ✅ Supabase
- **Real-time**: WebSocket subscriptions
- **Auth**: Built-in authentication system
- **Storage**: File storage alternative
- **Edge Functions**: Serverless functions

### ✅ Cloudinary
- **CDN**: Global content delivery
- **Optimization**: Automatic image optimization
- **Transformations**: On-the-fly image processing
- **Free tier**: 10GB storage, 25 credits/month

## 🚨 Important Notes

1. **Backup**: Always backup existing data before migration
2. **Testing**: Test thoroughly in development first
3. **Gradual**: Consider gradual migration (run both systems parallel)
4. **Monitoring**: Monitor costs and usage after migration

## 💰 Cost Estimation (Monthly)

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Neon** | 3GB storage, 100h compute | $19/month for Pro |
| **Supabase** | 2 projects, 500MB DB | $25/month for Pro |
| **Cloudinary** | 10GB storage, 25 credits | $89/month for Plus |

**Total for small blog**: $0-20/month (within free tiers)
**Total for growing blog**: $50-150/month

---

**Sau khi migration, blog của bạn sẽ có khả năng scale và performance tốt hơn rất nhiều! 🚀**

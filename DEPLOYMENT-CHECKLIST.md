# 📋 Deployment Checklist

## ✅ Pre-deployment Checklist

### Code Quality

- [ ] All TypeScript errors fixed
- [ ] ESLint warnings resolved
- [ ] Build passes locally (`npm run build`)
- [ ] Tests pass (if implemented)
- [ ] Code reviewed and approved

### Environment Setup

- [ ] Environment variables configured
- [ ] Database connection string updated
- [ ] NEXTAUTH_SECRET generated (32+ characters)
- [ ] NEXTAUTH_URL set to production domain
- [ ] File upload directory permissions set

### Security

- [ ] Remove debug logging
- [ ] Remove test/development endpoints
- [ ] Update CORS settings if needed
- [ ] Review API rate limiting
- [ ] Check sensitive data exposure

### Database

- [ ] Database backups configured
- [ ] Database connection tested
- [ ] Indexes created for performance
- [ ] Data migration completed (if needed)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### Quick Deploy

```bash
npm run build
npm install -g vercel
vercel --prod
```

#### GitHub Integration

1. Push to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Auto-deploy on push to main branch

#### Environment Variables for Vercel

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog_chef
```

### Option 2: Docker + VPS

#### Using Docker Compose

```bash
# Clone repository on server
git clone <your-repo-url>
cd blog_chef

# Set environment variables
cp .env.example .env.local
# Edit .env.local with production values

# Deploy
docker-compose up -d
```

#### Using Deploy Script

```bash
# Make script executable
chmod +x deploy.sh

# Set environment variables
export NEXTAUTH_URL="https://your-domain.com"
export NEXTAUTH_SECRET="your-secret-key"

# Deploy
./deploy.sh
```

### Option 3: Manual Server Deployment

```bash
# On your server
npm install
npm run build
npm run start:production

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "blog-chef" -- run start:production
pm2 startup
pm2 save
```

## 🔧 Post-deployment Checklist

### Functionality Testing

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Post creation works
- [ ] Image upload works
- [ ] Comments system works
- [ ] Reactions system works
- [ ] Search functionality works
- [ ] Responsive design works on mobile

### Performance Testing

- [ ] Page load times < 3 seconds
- [ ] Images load properly
- [ ] No JavaScript errors in console
- [ ] API responses < 1 second
- [ ] Database queries optimized

### SEO & Analytics

- [ ] Meta tags set correctly
- [ ] Sitemap generated
- [ ] Google Analytics/Vercel Analytics configured
- [ ] Social media sharing works
- [ ] Favicon and icons configured

### Security

- [ ] HTTPS enabled and working
- [ ] Security headers configured
- [ ] Rate limiting working
- [ ] File upload restrictions working
- [ ] Authentication working properly

### Monitoring

- [ ] Health check endpoint working (`/api/health`)
- [ ] Error logging configured
- [ ] Performance monitoring setup
- [ ] Database monitoring setup
- [ ] SSL certificate expiration monitoring

## 🔍 Common Issues & Solutions

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Database Connection Issues

- Check MongoDB connection string format
- Verify IP whitelist settings (0.0.0.0/0 for cloud deployment)
- Test connection with MongoDB Compass
- Check firewall settings

### Authentication Issues

- Verify NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set and strong
- Check environment variable naming (no typos)
- Test authentication flow in incognito mode

### File Upload Issues

- Check directory permissions (755 for directories)
- Verify file size limits in Nginx/server config
- Check disk space on server
- Test upload endpoint directly

### Performance Issues

- Enable Gzip compression
- Optimize images (use Next.js Image component)
- Add database indexes
- Use CDN for static assets
- Enable caching headers

## 🔄 Deployment Commands Reference

### Vercel

```bash
# Install CLI
npm i -g vercel

# Deploy
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### Docker

```bash
# Build image
docker build -t blog-chef .

# Run container
docker run -p 3000:3000 blog-chef

# Docker Compose
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### PM2 (Process Management)

```bash
# Start
pm2 start npm --name "blog-chef" -- run start:production

# Monitor
pm2 status
pm2 logs blog-chef

# Restart
pm2 restart blog-chef

# Stop
pm2 stop blog-chef
```

### Git Deployment

```bash
# On server
git pull origin main
npm install
npm run build
pm2 restart blog-chef
```

## 📱 Mobile Testing

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Touch gestures work
- [ ] Forms usable on mobile
- [ ] Images display correctly
- [ ] Performance acceptable on 3G

## 🌐 Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] JavaScript disabled gracefully

## 🚨 Rollback Plan

- [ ] Previous version tagged in Git
- [ ] Database backup before deployment
- [ ] Quick rollback script prepared
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment window

---

**Remember**: Always test in a staging environment first! 🧪

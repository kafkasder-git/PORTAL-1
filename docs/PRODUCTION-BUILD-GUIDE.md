# Production Build & Deployment Guide

Bu guide, production build sürecini ve deployment adımlarını açıklar.

## Production Build Checklist

### Pre-Build Checklist

**1. Environment Variables**
- [ ] `.env.local` dosyası production values ile doldurulmuş
- [ ] `NEXT_PUBLIC_APPWRITE_ENDPOINT` set edilmiş
- [ ] `NEXT_PUBLIC_APPWRITE_PROJECT_ID` set edilmiş
- [ ] `APPWRITE_API_KEY` set edilmiş (server-side)
- [ ] `CSRF_SECRET` generate edilmiş (32+ characters)
- [ ] `SESSION_SECRET` generate edilmiş (32+ characters)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set edilmiş (optional)
- [ ] `SENTRY_DSN` set edilmiş (optional)
- [ ] `SENTRY_AUTH_TOKEN` set edilmiş (for source maps)
- [ ] `EXCHANGERATE_API_KEY` set edilmiş (optional)

**2. Code Quality**
- [ ] `npm run lint` - 0 errors
- [ ] `npm run test` - All tests passing
- [ ] `npm run e2e` - All E2E tests passing
- [ ] `npm audit` - No critical vulnerabilities
- [ ] TypeScript compilation - 0 errors

**3. Database Setup (Appwrite)**
- [ ] Appwrite project created
- [ ] Database created (`dernek_db`)
- [ ] All collections created (users, beneficiaries, donations, tasks, meetings, messages, parameters, settings, etc.)
- [ ] Collection permissions configured
- [ ] Storage bucket created
- [ ] Storage permissions configured
- [ ] API keys generated

**4. Sentry Setup (Optional)**
- [ ] Sentry project created
- [ ] DSN obtained
- [ ] Auth token generated (for source maps)
- [ ] Alerts configured

### Build Process

**1. Clean Build**
```bash
# Remove previous build
rm -rf .next

# Clean node_modules (optional, if issues)
rm -rf node_modules
npm install
```

**2. Run Build**
```bash
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB        XXX kB
├ ○ /login                               XXX kB        XXX kB
├ ƒ /genel                               XXX kB        XXX kB
...

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic) server-rendered on demand
```

**3. Analyze Bundle Size**
```bash
npm run analyze
```

Browser'da bundle analyzer açılacak. Kontrol et:
- Total bundle size < 500KB (gzipped)
- No duplicate dependencies
- Large dependencies justified

**4. Test Production Build Locally**
```bash
npm start
```

Browser'da `http://localhost:3000` açın ve test edin:
- [ ] Login çalışıyor
- [ ] Dashboard yükleniyor
- [ ] API calls çalışıyor
- [ ] Search çalışıyor (Cmd+K)
- [ ] Notifications çalışıyor
- [ ] Settings sayfası çalışıyor
- [ ] User management çalışıyor
- [ ] Console'da error yok
- [ ] Network tab'da failed requests yok

### Build Optimization

**1. Next.js Config Optimizations**

`next.config.ts` already includes:
- ✅ `compress: true` - Gzip compression
- ✅ `removeConsole: true` (production) - Remove console.logs
- ✅ `swcMinify: true` - Fast minification
- ✅ Bundle analyzer integration
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Sentry webpack plugin (source maps)

**2. Image Optimization**

Currently using SVG patterns (already optimized). If adding images:
- Use `next/image` component
- Use WebP format
- Set proper width/height
- Use `priority` for above-the-fold images

**3. Code Splitting**

Next.js automatically code splits by route. Additional optimizations:
- Use dynamic imports for heavy components
- Lazy load modals and dialogs
- Use `React.lazy()` for non-critical components

**Example:**
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingOverlay />,
  ssr: false // if not needed on server
});
```

### Deployment Options

#### Option 1: Vercel (Recommended)

**Pros:**
- Zero-config deployment
- Automatic HTTPS
- Edge network (CDN)
- Preview deployments
- Built-in analytics

**Steps:**
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

#### Option 2: Self-Hosted (VPS/Cloud)

**Requirements:**
- Node.js 22+
- PM2 or similar process manager
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Build on server:**
```bash
git clone <repo>
cd dernek-nextjs
npm install
npm run build
```

2. **Setup PM2:**
```bash
npm install -g pm2
pm2 start npm --name "dernek-app" -- start
pm2 save
pm2 startup
```

3. **Nginx Config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL with Let's Encrypt:**
```bash
sudo certbot --nginx -d yourdomain.com
```

#### Option 3: Docker

**Dockerfile:**
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

**Build & Run:**
```bash
docker build -t dernek-app .
docker run -p 3000:3000 --env-file .env.local dernek-app
```

### Post-Deployment Checklist

**1. Smoke Tests**
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard loads
- [ ] API calls work
- [ ] Search works
- [ ] Notifications work
- [ ] Settings work
- [ ] User management works

**2. Monitoring Setup**
- [ ] Sentry error tracking active
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (Vercel Analytics, Google Analytics)
- [ ] Log aggregation (if self-hosted)

**3. Security**
- [ ] HTTPS enabled
- [ ] Security headers active (check with securityheaders.com)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] CSRF protection active

**4. Performance**
- [ ] Lighthouse audit > 90 (Performance)
- [ ] Page load < 3s
- [ ] API response times < 500ms
- [ ] No memory leaks

**5. Backup & Recovery**
- [ ] Database backup strategy (Appwrite backups)
- [ ] Code repository backed up (GitHub)
- [ ] Environment variables documented
- [ ] Rollback plan documented

### Rollback Plan

**Vercel:**
- Go to Vercel dashboard
- Select previous deployment
- Click "Promote to Production"

**Self-Hosted:**
```bash
# Stop current version
pm2 stop dernek-app

# Checkout previous version
git checkout <previous-commit>

# Rebuild
npm install
npm run build

# Restart
pm2 restart dernek-app
```

**Docker:**
```bash
# Stop current container
docker stop dernek-app

# Run previous image
docker run -p 3000:3000 dernek-app:<previous-tag>
```

### Troubleshooting

**Build Fails:**
- Check TypeScript errors: `npx tsc --noEmit`
- Check linter errors: `npm run lint`
- Check dependencies: `npm audit`
- Clear cache: `rm -rf .next node_modules && npm install`

**Runtime Errors:**
- Check Sentry dashboard
- Check server logs: `pm2 logs dernek-app`
- Check browser console
- Check network tab (failed API calls)

**Performance Issues:**
- Run Lighthouse audit
- Check bundle size: `npm run analyze`
- Check API response times
- Check database query performance (Appwrite console)

**Environment Variable Issues:**
- Verify all required variables set
- Check variable names (typos)
- Restart server after changes
- Check `.env.local` vs `.env.production`

### Maintenance

**Regular Tasks:**
- [ ] Weekly: Check Sentry for new errors
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Update dependencies (`npm update`)
- [ ] Monthly: Security audit (`npm audit`)
- [ ] Quarterly: Lighthouse audit
- [ ] Quarterly: Review and optimize bundle size

**Dependency Updates:**
```bash
# Check outdated packages
npm outdated

# Update minor/patch versions
npm update

# Update major versions (carefully)
npm install <package>@latest

# Test after updates
npm run test
npm run e2e
npm run build
```

### Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment](https://vercel.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Last Updated**: 2025-10-28
**Status**: Ready for Production
# Parrot Web - Deployment Guide

> Repository: https://github.com/cannt/parrot-web

## Architecture
- **Frontend**: React + Vite deployed on Vercel (Free)
- **Backend**: Node.js + Express deployed on Railway ($5/month)
- **Domain**: ex0.es (configured in GoDaddy)

## Backend Deployment (Railway)

### 1. Prepare Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Add deployment configuration"
git push origin main
```

**Repository**: https://github.com/cannt/parrot-web

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up/in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - **Root Directory**: `packages/api`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: `8080`

### 3. Set Environment Variables
In Railway dashboard:
- `NODE_ENV=production`
- `PORT=8080`

### 4. Get Railway URL
After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/in with GitHub
3. Click "New Project"
4. Select your repository
5. Configure:
   - **Root Directory**: `packages/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:
- `VITE_API_URL`: `https://your-railway-app.railway.app`
- `VITE_WS_URL`: `wss://your-railway-app.railway.app`

### 3. Redeploy
After adding environment variables, redeploy the project.

## Domain Configuration (ex0.es)

### 1. For Frontend (Vercel)
1. In Vercel dashboard → Settings → Domains
2. Add domain: `ex0.es`
3. In GoDaddy DNS settings:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.19.19`

### 2. For API Subdomain (Optional)
1. In Railway dashboard → Settings → Domains
2. Add custom domain: `api.ex0.es`
3. In GoDaddy DNS settings:
   - Add CNAME record: `api` → `your-railway-app.railway.app`

### 3. Update Frontend Environment
If using api.ex0.es subdomain:
- `VITE_API_URL`: `https://api.ex0.es`
- `VITE_WS_URL`: `wss://api.ex0.es`

## Cost Breakdown
- **Railway**: $5/month (backend hosting)
- **Vercel**: Free (frontend hosting)
- **GoDaddy Domain**: Already owned
- **Total**: $5/month

## Local Development
```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Environment Files
- `.env.local` - Local development
- `.env.example` - Template for environment variables

## Post-Deployment Testing
1. Test frontend at: `https://ex0.es`
2. Test API at: `https://your-railway-app.railway.app` (or `https://api.ex0.es`)
3. Verify WebSocket connection works
4. Test drone connection functionality
# 🚀 Quick Deploy Guide

## Prerequisites
✅ Railway CLI installed (`brew install railway`)
✅ Vercel CLI installed (`npm install -g vercel`)
✅ Railway account created
✅ Vercel account created and repository connected
✅ GoDaddy DNS configured (Option 1)

## Step 1: Deploy Backend to Railway

Run the Railway deployment script:
```bash
./deploy-railway.sh
```

**Manual steps during script:**
1. Login when prompted (browser will open)
2. Name your project (e.g., "parrot-web-api")
3. Copy the Railway URL when displayed

## Step 2: Configure Vercel Frontend

Run the Vercel configuration script:
```bash
./deploy-vercel.sh
```

**Manual steps during script:**
1. Login if needed
2. Select your existing Vercel project
3. Paste the Railway URL when prompted

## Step 3: Verify Deployment

### Check Backend:
```bash
curl https://your-railway-app.railway.app
```

### Check Frontend:
- Visit: https://ex0.es
- Or: https://your-project.vercel.app

## Troubleshooting

### Railway Issues:
- If deployment fails, check logs: `railway logs`
- View dashboard: `railway open`

### Vercel Issues:
- Check build logs: `vercel logs`
- Redeploy: `vercel --prod`

### Environment Variables:
- Railway: `railway variables`
- Vercel: `vercel env ls`

## Manual Commands Reference

### Railway:
```bash
cd packages/api
railway login
railway init
railway up
railway status
railway variables set NODE_ENV=production
railway variables set PORT=8080
```

### Vercel:
```bash
cd packages/web
vercel login
vercel link
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production
vercel --prod
vercel domains add ex0.es
```

## Cost Summary
- Railway: $5/month
- Vercel: Free
- Total: $5/month

## Support
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Repository: https://github.com/cannt/parrot-web
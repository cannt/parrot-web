#!/bin/bash

echo "🚀 Continuing Deployment Setup for Parrot Web"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Redeploy Backend to Railway${NC}"
echo "-----------------------------------"
cd packages/api

echo -e "${YELLOW}Redeploying to Railway with fixed Dockerfile...${NC}"
railway up

echo ""
echo -e "${YELLOW}Setting environment variables...${NC}"
railway variables set NODE_ENV=production
railway variables set PORT=8080

echo ""
echo -e "${GREEN}✓ Backend deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Getting Railway URL...${NC}"
railway status
echo ""
echo -e "${BLUE}IMPORTANT: Copy the Railway URL above!${NC}"
echo "It should look like: https://parrot-web-production.up.railway.app"
echo ""
read -p "Paste your Railway URL here: " RAILWAY_URL
RAILWAY_URL="${RAILWAY_URL%/}"

echo ""
echo -e "${BLUE}Step 2: Complete Vercel Frontend Setup${NC}"
echo "-------------------------------------"
cd ../../packages/web

echo -e "${YELLOW}Setting Vercel environment variables...${NC}"
echo "$RAILWAY_URL" | vercel env add VITE_API_URL production
echo "wss://${RAILWAY_URL#https://}" | vercel env add VITE_WS_URL production

echo ""
echo -e "${YELLOW}Deploying to Vercel...${NC}"
vercel --prod

echo ""
echo -e "${YELLOW}Adding custom domain...${NC}"
vercel domains add ex0.es

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "Your application is now deployed:"
echo -e "${BLUE}Backend:${NC} $RAILWAY_URL"
echo -e "${BLUE}Frontend:${NC} https://ex0.es"
echo ""
echo "To test your deployment:"
echo "1. Backend API: curl $RAILWAY_URL"
echo "2. Frontend: Visit https://ex0.es"
echo ""
echo "Note: DNS propagation may take up to 24 hours."
echo ""
echo "To view dashboards:"
echo "- Railway: railway open"
echo "- Vercel: vercel"
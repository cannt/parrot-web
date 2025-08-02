#!/bin/bash

echo "🚀 Final Deployment Setup for Parrot Web"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Railway URL
RAILWAY_URL="https://parrot-web-production.up.railway.app"

echo -e "${BLUE}Step 1: Complete Railway Backend Deployment${NC}"
echo "-------------------------------------------"
cd packages/api

echo -e "${YELLOW}Pushing Dockerfile fix and redeploying...${NC}"
cd ../..
git add packages/api/Dockerfile
git commit -m "Fix Dockerfile: Install all dependencies for TypeScript build"
git push origin master

echo ""
echo -e "${YELLOW}Waiting for Railway to pick up changes...${NC}"
echo "Railway will automatically redeploy with the new Dockerfile."
echo ""

echo -e "${YELLOW}Setting environment variables via Railway dashboard...${NC}"
echo ""
echo -e "${BLUE}Please set these environment variables in Railway dashboard:${NC}"
echo "1. Go to: https://railway.com/project/d6781f3e-1e2e-453f-b8f8-1a8f9b264d1c/service/5ee86b5e-d64f-4788-b231-0c9de45327f9"
echo "2. Click on 'Variables' tab"
echo "3. Add these variables:"
echo "   - NODE_ENV = production"
echo "   - PORT = 8080"
echo ""
read -p "Press Enter after setting the Railway environment variables..."

echo ""
echo -e "${GREEN}✓ Backend setup complete!${NC}"
echo -e "${BLUE}Backend URL:${NC} $RAILWAY_URL"
echo ""

echo -e "${BLUE}Step 2: Complete Vercel Frontend Setup${NC}"
echo "-------------------------------------"
cd packages/web

echo -e "${YELLOW}Setting Vercel environment variables...${NC}"
echo "$RAILWAY_URL" | vercel env add VITE_API_URL production
echo "wss://parrot-web-production.up.railway.app" | vercel env add VITE_WS_URL production

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
echo -e "${BLUE}Backend API:${NC} $RAILWAY_URL"
echo -e "${BLUE}Frontend:${NC} https://ex0.es"
echo ""
echo "Test your deployment:"
echo "1. Backend: curl $RAILWAY_URL"
echo "2. Frontend: Visit https://ex0.es (after DNS propagation)"
echo ""
echo "Dashboards:"
echo "- Railway: https://railway.com/project/d6781f3e-1e2e-453f-b8f8-1a8f9b264d1c"
echo "- Vercel: Run 'vercel' to open dashboard"
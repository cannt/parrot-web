#!/bin/bash

echo "🚀 Complete Deployment Setup for Parrot Web"
echo "=========================================="
echo ""
echo "This script will complete the deployment of both backend and frontend."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Railway Backend Setup${NC}"
echo "------------------------------"
cd packages/api

echo -e "${YELLOW}Linking to Railway project...${NC}"
echo "Select 'parrot-web' from the list when prompted"
railway link

echo ""
echo -e "${YELLOW}Deploying to Railway...${NC}"
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
echo -e "${BLUE}IMPORTANT: Copy the Railway URL above - you'll need it for Vercel!${NC}"
echo ""
read -p "Press Enter after copying the Railway URL..."

# Get the Railway URL from user
echo ""
read -p "Paste your Railway URL here (e.g., https://parrot-web-production.up.railway.app): " RAILWAY_URL
RAILWAY_URL="${RAILWAY_URL%/}"

echo ""
echo -e "${BLUE}Step 2: Vercel Frontend Setup${NC}"
echo "-----------------------------"
cd ../../packages/web

echo -e "${YELLOW}Setting Vercel environment variables...${NC}"
vercel env rm VITE_API_URL production 2>/dev/null
vercel env rm VITE_WS_URL production 2>/dev/null
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
echo -e "${BLUE}Frontend:${NC} https://ex0.es (DNS propagation may take time)"
echo ""
echo "To view dashboards:"
echo "- Railway: railway open"
echo "- Vercel: vercel"
echo ""
echo -e "${YELLOW}DNS Configuration for GoDaddy:${NC}"
echo "Type    Name    Value                    TTL"
echo "A       @       76.76.19.19             600"
echo "CNAME   www     cname.vercel-dns.com    600"
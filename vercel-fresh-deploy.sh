#!/bin/bash

echo "🚀 Fresh Vercel Deployment"
echo "========================="
echo ""

cd packages/web

echo "Removing old Vercel configuration..."
rm -rf .vercel

echo ""
echo "Creating new Vercel deployment..."
echo ""
echo "IMPORTANT: When prompted:"
echo "1. Set up and deploy: Y"
echo "2. Which scope: Select your account"
echo "3. Link to existing project: N (NO!)"
echo "4. What's your project's name: parrot-web"
echo "5. In which directory is your code located: ./ (just press Enter)"
echo ""

vercel

echo ""
echo "Setting environment variables for the new project..."
RAILWAY_URL="https://parrot-web-production.up.railway.app"
echo "$RAILWAY_URL" | vercel env add VITE_API_URL production
echo "wss://parrot-web-production.up.railway.app" | vercel env add VITE_WS_URL production

echo ""
echo "Deploying to production..."
vercel --prod

echo ""
echo "Adding custom domain..."
vercel domains add ex0.es

echo ""
echo "✅ Fresh deployment complete!"
echo ""
echo "Your frontend should now be available at:"
echo "- Your new Vercel URL (shown above)"
echo "- https://ex0.es (after DNS propagation)"
echo ""
echo "IMPORTANT: Update DNS in GoDaddy:"
echo "Type    Name    Value              TTL"
echo "A       @       76.76.21.21       600"
echo "CNAME   www     cname.vercel-dns.com    600"
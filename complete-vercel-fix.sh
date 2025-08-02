#!/bin/bash

echo "🔧 Completing Vercel Deployment Fix"
echo "=================================="
echo ""

cd packages/web

echo "Step 1: Remove domain from old project..."
echo "Go to: https://vercel.com/juan-angel-trujillo-jimenezs-projects/parrot-web-web/settings/domains"
echo "Remove ex0.es domain from the old project (parrot-web-web)"
echo ""
read -p "Press Enter after removing ex0.es from the OLD project..."

echo ""
echo "Step 2: Deploy to production with fixed configuration..."
vercel --prod

echo ""
echo "Step 3: Add domain to NEW project..."
vercel domains add ex0.es

echo ""
echo "Step 4: Get the deployment URL..."
vercel ls

echo ""
echo "✅ Deployment completed!"
echo ""
echo "Your application should now be available at:"
echo "- New Vercel URL: https://parrot-web-<random>.vercel.app"
echo "- Custom domain: https://ex0.es (after DNS propagation)"
echo ""
echo "Backend API: https://parrot-web-production.up.railway.app"
echo ""
echo "🔧 FINAL STEP: Update DNS in GoDaddy:"
echo "Type    Name    Value              TTL"
echo "A       @       76.76.21.21       600"
echo "CNAME   www     cname.vercel-dns.com    600"
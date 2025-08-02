#!/bin/bash

echo "🔧 Fixing TypeScript errors and redeploying"
echo "==========================================="
echo ""

cd packages/web

echo "Step 1: Deploying with fixed configuration..."
vercel --prod

echo ""
echo "Step 2: Adding domain to project..."
vercel domains add ex0.es

echo ""
echo "Step 3: Getting deployment status..."
vercel ls

echo ""
echo "✅ Deployment fix completed!"
echo ""
echo "If successful, your app is now available at:"
echo "- Vercel URL: https://parrot-cpqgepc26-juan-angel-trujillo-jimenezs-projects.vercel.app"
echo "- Custom domain: https://ex0.es (after DNS update)"
echo ""
echo "Backend: https://parrot-web-production.up.railway.app"
echo ""
echo "🔧 Don't forget to update DNS in GoDaddy:"
echo "Type    Name    Value              TTL"
echo "A       @       76.76.21.21       600"
echo "CNAME   www     cname.vercel-dns.com    600"
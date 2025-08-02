#!/bin/bash

echo "🔧 Fixing Vercel Deployment"
echo "=========================="
echo ""

cd packages/web

echo "Step 1: Re-linking Vercel project..."
echo "When prompted:"
echo "- Set up and deploy: Y"
echo "- Which scope: Select your account"
echo "- Link to existing project: Y"
echo "- What's the name: parrot-web-web"
echo ""

vercel

echo ""
echo "Step 2: Deploy to production..."
vercel --prod

echo ""
echo "✅ Deployment should be complete!"
echo ""
echo "Your frontend should now be available at:"
echo "- https://parrot-web-web.vercel.app"
echo "- https://ex0.es (after DNS propagation)"
echo ""
echo "DNS Update Required in GoDaddy:"
echo "Type    Name    Value              TTL"
echo "A       @       76.76.21.21       600"
echo "CNAME   www     cname.vercel-dns.com    600"
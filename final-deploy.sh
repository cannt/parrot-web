#!/bin/bash

echo "🚀 Final Production Deployment"
echo "============================="
echo ""

cd packages/web

echo "Step 1: Testing production build locally..."
npm run build:prod

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
else
    echo "❌ Local build failed!"
    exit 1
fi

echo ""
echo "Step 2: Deploying to Vercel with production config..."
vercel --prod

echo ""
echo "Step 3: Adding domain to project..."
vercel domains add ex0.es

echo ""
echo "Step 4: Final deployment status..."
vercel ls

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "Your Parrot Web drone controller is now live at:"
echo "- Vercel URL: (shown above)"
echo "- Custom domain: https://ex0.es (after DNS update)"
echo ""
echo "Backend API: https://parrot-web-production.up.railway.app"
echo ""
echo "🔧 FINAL DNS UPDATE REQUIRED:"
echo "Update these records in GoDaddy for ex0.es:"
echo "Type    Name    Value              TTL"
echo "A       @       76.76.21.21       600"
echo "CNAME   www     cname.vercel-dns.com    600"
echo ""
echo "✈️ Ready to fly your drone! 🚁✨"
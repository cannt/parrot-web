#!/bin/bash

echo "🔧 Fixing SSL and Domain Configuration"
echo "====================================="
echo ""

cd packages/web

echo "Step 1: First, update your Build Command in Vercel Dashboard"
echo "-------------------------------------------------------------"
echo "1. Go to: https://vercel.com/juan-angel-trujillo-jimenezs-projects/parrot-web/settings/general"
echo "2. In Framework Settings > Project Settings > Build Command"
echo "3. Turn ON the Override toggle"
echo "4. Change to: npm run build:prod"
echo "5. Click Save"
echo ""
read -p "Press Enter after updating the build command in Vercel dashboard..."

echo ""
echo "Step 2: Remove and re-add domain to trigger fresh SSL certificate"
echo "-----------------------------------------------------------------"
vercel domains rm ex0.es --yes
echo "Domain removed. Waiting 5 seconds..."
sleep 5

echo ""
echo "Step 3: Re-add domain"
echo "--------------------"
vercel domains add ex0.es

echo ""
echo "Step 4: Trigger a fresh deployment"
echo "----------------------------------"
vercel --prod

echo ""
echo "✅ Complete!"
echo ""
echo "SSL certificate generation has been triggered. It may take 5-10 minutes."
echo "Check status at: https://vercel.com/juan-angel-trujillo-jimenezs-projects/parrot-web/settings/domains"
echo ""
echo "Once ready, your site will be available at:"
echo "- https://ex0.es (with SSL)"
echo "- https://www.ex0.es (with SSL)"
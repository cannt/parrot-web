#!/bin/bash

echo "🚂 Railway Deployment Script for Parrot Web Backend"
echo "=================================================="
echo ""
echo "This script will guide you through deploying the backend to Railway."
echo ""

# Navigate to API directory
cd packages/api

echo "Step 1: Login to Railway"
echo "------------------------"
echo "Run: railway login"
echo "A browser window will open for authentication."
echo ""
read -p "Press Enter after you've logged in..."

echo ""
echo "Step 2: Create a new Railway project"
echo "------------------------------------"
railway init

echo ""
echo "Step 3: Deploy to Railway"
echo "-------------------------"
echo "Deploying the backend..."
railway up

echo ""
echo "Step 4: Get the Railway URL"
echo "---------------------------"
railway status

echo ""
echo "Step 5: Set Environment Variables"
echo "---------------------------------"
railway variables set NODE_ENV=production
railway variables set PORT=8080

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Your Railway backend URL will be shown above."
echo "Copy this URL - you'll need it for the Vercel frontend configuration."
echo ""
echo "To view your project in the Railway dashboard:"
echo "Run: railway open"
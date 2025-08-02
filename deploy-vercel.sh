#!/bin/bash

echo "▲ Vercel Configuration Script for Parrot Web Frontend"
echo "===================================================="
echo ""
echo "This script will configure your Vercel deployment."
echo ""

# Navigate to web directory
cd packages/web

echo "Step 1: Login to Vercel (if needed)"
echo "-----------------------------------"
echo "Run: vercel login"
echo "Follow the prompts to authenticate."
echo ""
read -p "Press Enter after you've logged in (or if already logged in)..."

echo ""
echo "Step 2: Link to existing Vercel project"
echo "---------------------------------------"
echo "Since you've already connected the repository in Vercel dashboard,"
echo "we'll link this local project to it."
vercel link

echo ""
echo "Step 3: Configure Environment Variables"
echo "--------------------------------------"
echo ""
read -p "Enter your Railway backend URL (e.g., https://your-app.railway.app): " RAILWAY_URL

# Remove trailing slash if present
RAILWAY_URL="${RAILWAY_URL%/}"

echo ""
echo "Setting environment variables..."

# Set production environment variables
vercel env add VITE_API_URL production <<< "$RAILWAY_URL"
vercel env add VITE_WS_URL production <<< "wss://${RAILWAY_URL#https://}"

# Set preview environment variables
vercel env add VITE_API_URL preview <<< "$RAILWAY_URL"
vercel env add VITE_WS_URL preview <<< "wss://${RAILWAY_URL#https://}"

# Set development environment variables (optional)
vercel env add VITE_API_URL development <<< "http://localhost:3001"
vercel env add VITE_WS_URL development <<< "ws://localhost:3001"

echo ""
echo "Step 4: Pull environment variables locally"
echo "-----------------------------------------"
vercel env pull .env.production.local

echo ""
echo "Step 5: Deploy to Vercel"
echo "------------------------"
echo "Triggering a new deployment..."
vercel --prod

echo ""
echo "Step 6: Configure Domain"
echo "------------------------"
echo "Adding ex0.es domain..."
vercel domains add ex0.es

echo ""
echo "🎉 Configuration complete!"
echo ""
echo "Your frontend should now be deployed with the correct environment variables."
echo ""
echo "DNS Configuration for GoDaddy:"
echo "-----------------------------"
echo "Type    Name    Value                    TTL"
echo "A       @       76.76.19.19             600"
echo "CNAME   www     cname.vercel-dns.com    600"
echo ""
echo "To view your project in the Vercel dashboard:"
echo "Run: vercel"
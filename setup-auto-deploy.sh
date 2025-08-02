#!/bin/bash

echo "🔄 Setting up Auto-Deployment with GitHub"
echo "========================================"
echo ""

cd packages/web

echo "Connecting Vercel to GitHub repository..."
echo ""
echo "This will open a browser window to authorize the connection."
echo "Please follow these steps:"
echo "1. Authorize Vercel to access your GitHub repository"
echo "2. Select the 'cannt/parrot-web' repository"
echo "3. Choose the 'master' branch for production deployments"
echo ""

vercel git connect https://github.com/cannt/parrot-web.git

echo ""
echo "✅ Auto-deployment setup complete!"
echo ""
echo "Now, every time you push to GitHub:"
echo "- Push to 'master' branch → Deploys to production (ex0.es)"
echo "- Push to other branches → Creates preview deployments"
echo ""
echo "Example workflow:"
echo "git add ."
echo "git commit -m 'Update feature X'"
echo "git push origin master"
echo "→ Automatically deploys to https://ex0.es"
#!/bin/bash

# Render Deployment Script for Badminton Booking Backend
# This script helps prepare and deploy your backend to Render

echo "🚀 Preparing for Render deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all files are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for Render deployment'"
    echo "   git push"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please ensure you're in the correct directory."
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please ensure the file exists."
    exit 1
fi

echo "✅ All checks passed!"

echo ""
echo "📋 Next steps:"
echo "1. Go to https://render.com and sign up/login"
echo "2. Click 'New +' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will automatically detect the render.yaml file"
echo "5. Click 'Apply' to deploy"
echo ""
echo "🔧 Environment Variables to set in Render Dashboard:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=<your_mongodb_connection_string>"
echo "   - JWT_SECRET=<your_super_secret_jwt_key>"
echo ""
echo "📖 For detailed instructions, see RENDER_SETUP.md"
echo ""
echo "🎯 After deployment, update your frontend to use the new Render URL!" 
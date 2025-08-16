#!/bin/bash

# Render Setup Verification Script
# This script verifies that your project is ready for Render deployment

echo "🔍 Verifying Render deployment setup..."

# Check if we're in the project root
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found in current directory"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Check if Backend folder exists
if [ ! -d "Backend" ]; then
    echo "❌ Backend folder not found"
    exit 1
fi

# Check if Backend/package.json exists
if [ ! -f "Backend/package.json" ]; then
    echo "❌ Backend/package.json not found"
    exit 1
fi

# Check if Backend/index.js exists
if [ ! -f "Backend/index.js" ]; then
    echo "❌ Backend/index.js not found"
    exit 1
fi

# Check render.yaml configuration
echo "📋 Checking render.yaml configuration..."
if grep -q "rootDir: Backend" render.yaml; then
    echo "✅ rootDir is correctly set to Backend"
else
    echo "❌ rootDir is not set to Backend in render.yaml"
    exit 1
fi

if grep -q "startCommand: npm start" render.yaml; then
    echo "✅ startCommand is correctly set"
else
    echo "❌ startCommand is not set correctly in render.yaml"
    exit 1
fi

# Check package.json start script
echo "📦 Checking package.json..."
if grep -q '"start": "node index.js"' Backend/package.json; then
    echo "✅ package.json start script is correct"
else
    echo "❌ package.json start script is not correct"
    echo "   Expected: \"start\": \"node index.js\""
    exit 1
fi

echo ""
echo "✅ All checks passed! Your project is ready for Render deployment."
echo ""
echo "🚀 Next steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'Add Render deployment configuration'"
echo "   git push origin main"
echo ""
echo "2. Deploy on Render:"
echo "   - Go to https://render.com"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Click 'Apply' to deploy"
echo ""
echo "3. Set environment variables in Render Dashboard"
echo "   (See Backend/render-env-template.txt for details)" 
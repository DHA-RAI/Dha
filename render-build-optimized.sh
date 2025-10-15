#!/bin/bash

# Render Production Build Script with Optimizations
set -e

echo "🚀 Starting Render Production Build"
echo "===================================="

# Ensure correct Node.js version
echo "🔧 Setting up Node.js environment..."
export PATH="/usr/local/bin:$PATH"
node_version=$(node --version)
if [[ ! $node_version =~ ^v20 ]]; then
    echo "❌ Wrong Node.js version. Installing Node.js 20..."
    sudo npm install -g n
    sudo n 20.19.0
    hash -r
    export PATH="/usr/local/bin:$PATH"
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist build node_modules/.cache client/node_modules/.cache || true

# Install root dependencies
echo "📦 Installing root dependencies..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm ci --legacy-peer-deps --no-audit || npm install --legacy-peer-deps --no-audit

# Setup client build environment
echo "🛠️ Setting up client environment..."
cd client

# Clean client dependencies
rm -rf node_modules package-lock.json

# Install client dependencies including Tailwind
echo "📦 Installing client dependencies..."
npm install --legacy-peer-deps --no-audit
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Create Tailwind config if it doesn't exist
echo "⚙️ Configuring Tailwind..."
cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# Create PostCSS config if it doesn't exist
cat > postcss.config.js << EOL
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Build client with production optimizations
echo "🔨 Building client..."
NODE_ENV=production npm run build
cd ..

# Build server
echo "🔨 Building server..."
NODE_ENV=production npx tsc --project tsconfig.production.json --skipLibCheck

# Ensure dist directory exists
mkdir -p dist

echo "✅ Build completed successfully"
#!/bin/bash

# Render Production Start Script with enhanced error handling
set -e

# Error handling function
handle_error() {
    echo "❌ Error: $1"
    echo "==== Environment Information ===="
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Current directory: $(pwd)"
    echo "Files in dist:"
    ls -la dist/ || echo "No dist directory"
    echo "=============================="
    exit 1
}

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-5000}
export HOST=${HOST:-0.0.0.0}
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🚀 Starting DHA Digital Services"
echo "================================="
echo "Port: $PORT"
echo "Host: $HOST"
echo "Node Options: $NODE_OPTIONS"
echo "Node Version: $(node --version)"

# Start the server with fallback options
if [ -f "dist/server/index.js" ]; then
    echo "✅ Starting from dist/server/index.js"
    node dist/server/index.js
elif [ -f "dist/index.js" ]; then
    echo "✅ Starting from dist/index.js"
    node dist/index.js
elif [ -f "server/index.js" ]; then
    echo "⚠️ Using source server/index.js"
    node server/index.js
else
    echo "❌ No server file found!"
    ls -la dist/ || echo "No dist directory"
    exit 1
fi
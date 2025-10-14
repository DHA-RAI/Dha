#!/bin/bash

# Render Production Start Script
set -e

export NODE_ENV=production
export PORT=${PORT:-5000}
export HOST=${HOST:-0.0.0.0}

echo "🚀 Starting DHA Digital Services"
echo "================================="
echo "Port: $PORT"
echo "Host: $HOST"

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
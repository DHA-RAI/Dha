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

# Debug info
echo "📊 Debug Information"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "Dist directory contents:"
ls -la dist || echo "No dist directory"
echo "Server directory contents:"
ls -la server || echo "No server directory"

# Check for required files
echo "🔍 Checking for required files..."
if [ ! -d "dist" ]; then
    handle_error "Dist directory not found"
fi

if [ ! -d "dist/public" ]; then
    handle_error "Public directory not found"
fi

# Start the server with enhanced error handling
echo "🚀 Starting server..."
if [ -f "dist/server/index.js" ]; then
    echo "✅ Starting from dist/server/index.js"
    node --trace-warnings dist/server/index.js 2>&1 | tee server.log || handle_error "Server crashed"
elif [ -f "dist/index.js" ]; then
    echo "✅ Starting from dist/index.js"
    node --trace-warnings dist/index.js 2>&1 | tee server.log || handle_error "Server crashed"
else
    handle_error "No server file found"
fi

# Monitor server startup
tail -f server.log | while read line; do
    echo "$line"
    if [[ $line == *"Server running on port"* ]]; then
        echo "✅ Server started successfully!"
        break
    fi
done
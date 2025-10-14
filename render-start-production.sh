
#!/bin/bash

# Render Production Start Script
set -e

echo "🚀 Starting DHA Digital Services"
echo "================================="

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}
export HOST=${HOST:-0.0.0.0}

# Start the server
if [ -f "dist/server/index.js" ]; then
    echo "✅ Starting from dist/server/index.js"
    node dist/server/index.js
elif [ -f "dist/index.js" ]; then
    echo "✅ Starting from dist/index.js"
    node dist/index.js
else
    echo "❌ No server file found!"
    exit 1
fi

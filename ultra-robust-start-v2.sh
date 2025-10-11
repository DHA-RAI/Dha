#!/bin/bash

# Ultra Robust Start Script v2
# Ensures clean startup with proper port management

set -e

echo "🚀 Starting Ultra-Robust Server..."

# Kill any processes using our ports
cleanup_ports() {
    echo "🧹 Cleaning up port usage..."
    for port in 3000 3001 3004 3005; do
        pid=$(lsof -t -i:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo "Killing process using port $port"
            kill -9 $pid 2>/dev/null || true
        fi
    done
}

# Ensure all ports are free
cleanup_ports

# Validate port configuration
echo "🔍 Validating port configuration..."
node -e "require('./config/ports.js').validate()"

# Start the application with proper port configuration
echo "📡 Starting server..."
export PORT=3000
export AUTO_RECOVERY_PORT=3001
export HEALTH_MONITOR_PORT=3004
export ANTI_SLEEP_PORT=3005

# Start services in the correct order
node server.js